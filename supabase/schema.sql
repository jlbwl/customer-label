-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE customer_status AS ENUM ('lead', 'following', 'high_intent', 'closed', 'lost');
CREATE TYPE interaction_type AS ENUM ('phone', 'wechat', 'meeting', 'email', 'other');

-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  source TEXT,
  status customer_status DEFAULT 'lead',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ai_score INTEGER DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 100),
  last_contact_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE
);

-- Create interactions table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  type interaction_type DEFAULT 'phone',
  ai_suggested_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_customers_owner_id ON customers(owner_id);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_last_contact_at ON customers(last_contact_at);
CREATE INDEX idx_interactions_customer_id ON interactions(customer_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customers table
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  USING (auth.uid() = owner_id OR is_public = TRUE);

CREATE POLICY "Users can create customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own customers"
  ON customers FOR DELETE
  USING (auth.uid() = owner_id);

-- Create RLS policies for interactions table
CREATE POLICY "Users can view interactions for their customers"
  ON interactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = interactions.customer_id
      AND (customers.owner_id = auth.uid() OR customers.is_public = TRUE)
    )
  );

CREATE POLICY "Users can create interactions for their customers"
  ON interactions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers
      WHERE customers.id = interactions.customer_id
      AND customers.owner_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for customers table
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically move customers to public pool
CREATE OR REPLACE FUNCTION move_to_public_pool()
RETURNS void AS $$
BEGIN
  UPDATE customers
  SET 
    is_public = TRUE,
    owner_id = NULL,
    status = 'lead'
  WHERE 
    last_contact_at < NOW() - INTERVAL '7 days'
    AND owner_id IS NOT NULL
    AND is_public = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for public pool
CREATE OR REPLACE VIEW public_pool AS
SELECT 
  id,
  name,
  phone,
  company,
  source,
  ai_score,
  last_contact_at,
  created_at
FROM customers
WHERE is_public = TRUE AND owner_id IS NULL;

-- Create function to claim customer from public pool
CREATE OR REPLACE FUNCTION claim_customer(customer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE customers
  SET 
    is_public = FALSE,
    owner_id = auth.uid(),
    status = 'following'
  WHERE 
    id = customer_id
    AND is_public = TRUE
    AND owner_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to calculate AI score (simplified version)
CREATE OR REPLACE FUNCTION calculate_ai_score(customer_id UUID)
RETURNS INTEGER AS $$
DECLARE
  interaction_count INTEGER;
  days_since_last_contact INTEGER;
  score INTEGER := 50;
BEGIN
  -- Count interactions in last 30 days
  SELECT COUNT(*) INTO interaction_count
  FROM interactions
  WHERE interactions.customer_id = calculate_ai_score.customer_id
  AND created_at > NOW() - INTERVAL '30 days';
  
  -- Calculate days since last contact
  SELECT EXTRACT(DAY FROM NOW() - last_contact_at)::INTEGER
  INTO days_since_last_contact
  FROM customers
  WHERE id = customer_id;
  
  -- Adjust score based on interactions
  IF interaction_count > 5 THEN
    score := score + 20;
  ELSIF interaction_count > 2 THEN
    score := score + 10;
  END IF;
  
  -- Adjust score based on recency
  IF days_since_last_contact < 3 THEN
    score := score + 20;
  ELSIF days_since_last_contact < 7 THEN
    score := score + 10;
  ELSIF days_since_last_contact > 14 THEN
    score := score - 20;
  END IF;
  
  -- Ensure score is within bounds
  score := GREATEST(0, LEAST(100, score));
  
  -- Update customer score
  UPDATE customers SET ai_score = score WHERE id = customer_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
