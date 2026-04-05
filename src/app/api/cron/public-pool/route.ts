import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerClient()

    const { data: customersToMove, error: fetchError } = await supabase
      .from('customers')
      .select('id, name, owner_id')
      .not('owner_id', 'is', null)
      .is('is_public', false)
      .lt('last_contact_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (fetchError) {
      throw fetchError
    }

    if (!customersToMove || customersToMove.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No customers to move to public pool',
        movedCount: 0,
      })
    }

    const { error: updateError } = await supabase
      .from('customers')
      .update({
        is_public: true,
        owner_id: null,
        status: 'lead',
      })
      .in(
        'id',
        customersToMove.map((c) => c.id)
      )

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: `Moved ${customersToMove.length} customers to public pool`,
      movedCount: customersToMove.length,
      customers: customersToMove,
    })
  } catch (error) {
    console.error('Error in public pool recovery:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
