'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Customer, KanbanColumn } from '@/types'
import { getStatusColor, getStatusText, formatDate } from '@/lib/utils'
import { User, Phone, Building, Calendar } from 'lucide-react'

interface CustomerKanbanProps {
  customers: Customer[]
  onCustomerClick: (customer: Customer) => void
  onStatusChange: (customerId: string, newStatus: Customer['status']) => void
}

const columns: KanbanColumn[] = [
  { id: 'lead', title: '线索', customers: [] },
  { id: 'following', title: '跟进中', customers: [] },
  { id: 'high_intent', title: '高意向', customers: [] },
  { id: 'closed', title: '成交', customers: [] },
  { id: 'lost', title: '流失', customers: [] },
]

export function CustomerKanban({ customers, onCustomerClick, onStatusChange }: CustomerKanbanProps) {
  const [draggedCustomer, setDraggedCustomer] = useState<Customer | null>(null)

  const columnsWithCustomers = columns.map((column) => ({
    ...column,
    customers: customers.filter((customer) => customer.status === column.id),
  }))

  const handleDragStart = (e: React.DragEvent, customer: Customer) => {
    setDraggedCustomer(customer)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: Customer['status']) => {
    e.preventDefault()
    if (draggedCustomer && draggedCustomer.status !== newStatus) {
      onStatusChange(draggedCustomer.id, newStatus)
    }
    setDraggedCustomer(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columnsWithCustomers.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-72"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                <span className="text-xs text-muted-foreground">{column.customers.length}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {column.customers.map((customer) => (
                <Card
                  key={customer.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, customer)}
                  onClick={() => onCustomerClick(customer)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{customer.name}</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(customer.status)}`}>
                          {customer.ai_score}分
                        </div>
                      </div>

                      {customer.company && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building className="h-3 w-3" />
                          <span>{customer.company}</span>
                        </div>
                      )}

                      {customer.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{customer.phone}</span>
                        </div>
                      )}

                      {customer.last_contact_at && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(customer.last_contact_at)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {column.customers.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  暂无客户
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
