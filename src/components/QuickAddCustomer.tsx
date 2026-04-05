'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { parseCustomerText } from '@/lib/utils'
import { Plus, Sparkles } from 'lucide-react'

interface QuickAddCustomerProps {
  onAddCustomer: (customer: {
    name: string
    phone?: string
    company?: string
    source?: string
  }) => void
}

export function QuickAddCustomer({ onAddCustomer }: QuickAddCustomerProps) {
  const [mode, setMode] = useState<'form' | 'parse'>('form')
  const [parseText, setParseText] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    source: '',
  })

  const handleParse = () => {
    const parsed = parseCustomerText(parseText)
    setFormData({
      name: parsed.name || '',
      phone: parsed.phone || '',
      company: parsed.company || '',
      source: '',
    })
    setMode('form')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onAddCustomer({
      name: formData.name,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      source: formData.source || undefined,
    })

    setFormData({ name: '', phone: '', company: '', source: '' })
    setParseText('')
    setMode('form')
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">快速录入客户</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={mode === 'form' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('form')}
            >
              表单录入
            </Button>
            <Button
              variant={mode === 'parse' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('parse')}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              智能解析
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mode === 'parse' ? (
          <div className="space-y-3">
            <Textarea
              placeholder="粘贴客户信息，支持自动识别姓名、电话、公司等&#10;例如：张三，13800138000，科技有限公司"
              value={parseText}
              onChange={(e) => setParseText(e.target.value)}
              rows={4}
            />
            <Button className="w-full" onClick={handleParse} disabled={!parseText.trim()}>
              解析并填充
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">姓名 *</label>
              <Input
                placeholder="客户姓名"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">电话</label>
              <Input
                placeholder="联系电话"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">公司</label>
              <Input
                placeholder="公司名称"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">来源</label>
              <Input
                placeholder="客户来源"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={!formData.name.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              添加客户
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
