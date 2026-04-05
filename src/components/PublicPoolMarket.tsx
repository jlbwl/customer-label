'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PublicPoolCustomer } from '@/types'
import { formatDate } from '@/lib/utils'
import { User, Phone, Building, Calendar, TrendingUp } from 'lucide-react'

interface PublicPoolProps {
  customers: PublicPoolCustomer[]
  onClaim: (customerId: string) => void
}

export function PublicPoolMarket({ customers, onClaim }: PublicPoolProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">公海池市场</h2>
          <p className="text-sm text-muted-foreground">
            这些客户超过7天未跟进，已自动回收到公海池
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          共 {customers.length} 个客户
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {customer.name}
                </CardTitle>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{customer.ai_score}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.company && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>{customer.company}</span>
                </div>
              )}

              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{customer.phone}</span>
                </div>
              )}

              {customer.source && (
                <div className="text-sm">
                  <span className="text-muted-foreground">来源：</span>
                  <span>{customer.source}</span>
                </div>
              )}

              {customer.last_contact_at && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>最后跟进：{formatDate(customer.last_contact_at)}</span>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                进入公海：{formatDate(customer.created_at)}
              </div>

              <Button
                className="w-full"
                size="sm"
                onClick={() => onClaim(customer.id)}
              >
                一键领取
              </Button>
            </CardContent>
          </Card>
        ))}

        {customers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">公海池暂无客户</h3>
            <p className="text-sm text-muted-foreground">
              所有客户都在正常跟进中
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
