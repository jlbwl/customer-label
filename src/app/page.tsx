'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerKanban } from '@/components/CustomerKanban'
import { AiSidebar } from '@/components/AiSidebar'
import { QuickAddCustomer } from '@/components/QuickAddCustomer'
import { PublicPoolMarket } from '@/components/PublicPoolMarket'
import type { Customer, PublicPoolCustomer } from '@/types'
import { LayoutDashboard, Users } from 'lucide-react'

// 模拟数据，用于构建时显示
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138000',
    company: 'ABC公司',
    source: '官网',
    status: 'lead',
    owner_id: 'user1',
    ai_score: 75,
    last_contact_at: new Date().toISOString(),
    notes: '对产品感兴趣',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false
  },
  {
    id: '2',
    name: '李四',
    phone: '13900139000',
    company: 'XYZ公司',
    source: '展会',
    status: 'following',
    owner_id: 'user1',
    ai_score: 85,
    last_contact_at: new Date().toISOString(),
    notes: '正在评估方案',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_public: false
  }
]

const mockPublicPool: PublicPoolCustomer[] = [
  {
    id: '3',
    name: '王五',
    phone: '13700137000',
    company: 'DEF公司',
    source: '推荐',
    ai_score: 90,
    last_contact_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
]

export default function Home() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers)
  const [publicPoolCustomers, setPublicPoolCustomers] = useState<PublicPoolCustomer[]>(mockPublicPool)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 只在浏览器环境中执行
    if (typeof window !== 'undefined') {
      import('@/lib/supabase').then(({ supabase }) => {
        fetchCustomers(supabase)
        fetchPublicPool(supabase)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const fetchCustomers = async (supabase: any) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .not('owner_id', 'is', null)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicPool = async (supabase: any) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .is('owner_id', null)
        .eq('is_public', true)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setPublicPoolCustomers(data || [])
    } catch (error) {
      console.error('Error fetching public pool:', error)
    }
  }

  const handleAddCustomer = async (customerData: {
    name: string
    phone?: string
    company?: string
    source?: string
  }) => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await (supabase as any).from('customers').insert({
        ...customerData,
        status: 'lead',
        ai_score: 50,
        last_contact_at: new Date().toISOString(),
      })

      if (error) throw error
      fetchCustomers(supabase)
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const handleStatusChange = async (customerId: string, newStatus: Customer['status']) => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await (supabase as any)
        .from('customers')
        .update({ status: newStatus })
        .eq('id', customerId)

      if (error) throw error
      fetchCustomers(supabase)
    } catch (error) {
      console.error('Error updating customer status:', error)
    }
  }

  const handleClaimCustomer = async (customerId: string) => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await (supabase as any)
        .from('customers')
        .update({
          is_public: false,
          status: 'following',
          last_contact_at: new Date().toISOString(),
        })
        .eq('id', customerId)

      if (error) throw error
      fetchCustomers(supabase)
      fetchPublicPool(supabase)
    } catch (error) {
      console.error('Error claiming customer:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">智能客户池转化工具</h1>
          <p className="text-sm text-muted-foreground">从线索到成交的全流程管理</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-81px)]">
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="dashboard" className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="dashboard" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  销售工作台
                </TabsTrigger>
                <TabsTrigger value="public-pool" className="gap-2">
                  <Users className="h-4 w-4" />
                  公海池市场
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="flex-1 overflow-auto p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                  <CustomerKanban
                    customers={customers}
                    onCustomerClick={setSelectedCustomer}
                    onStatusChange={handleStatusChange}
                  />
                </div>

                <div className="space-y-4">
                  <QuickAddCustomer onAddCustomer={handleAddCustomer} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="public-pool" className="flex-1 overflow-auto p-4">
              <PublicPoolMarket
                customers={publicPoolCustomers}
                onClaim={handleClaimCustomer}
              />
            </TabsContent>
          </Tabs>
        </div>

        <AiSidebar
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      </div>
    </div>
  )
}
