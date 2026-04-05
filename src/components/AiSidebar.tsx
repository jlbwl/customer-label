'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Customer, AICoachResponse } from '@/types'
import { formatDate, getStatusText, getStatusColor } from '@/lib/utils'
import { Sparkles, MessageSquare, TrendingUp, Loader2 } from 'lucide-react'

interface AiSidebarProps {
  customer: Customer | null
  onClose: () => void
}

export function AiSidebar({ customer, onClose }: AiSidebarProps) {
  const [aiResponse, setAiResponse] = useState<AICoachResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastInteraction, setLastInteraction] = useState('')

  useEffect(() => {
    if (customer) {
      setAiResponse(null)
      setLastInteraction('')
    }
  }, [customer])

  const handleGetAISuggestion = async () => {
    if (!lastInteraction.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customer?.id,
          last_interaction: lastInteraction,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI suggestion')
      }

      const data: AICoachResponse = await response.json()
      setAiResponse(data)
    } catch (error) {
      console.error('Error getting AI suggestion:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!customer) {
    return (
      <div className="w-80 border-l bg-muted/10 p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">AI 销售助手</h3>
          <p className="text-sm text-muted-foreground">
            选择一个客户卡片，AI 将为您提供智能建议
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 border-l bg-muted/10 overflow-y-auto">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">客户详情</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">客户姓名</div>
                <div className="font-medium">{customer.name}</div>
              </div>

              {customer.company && (
                <div>
                  <div className="text-sm text-muted-foreground">公司</div>
                  <div className="font-medium">{customer.company}</div>
                </div>
              )}

              {customer.phone && (
                <div>
                  <div className="text-sm text-muted-foreground">电话</div>
                  <div className="font-medium">{customer.phone}</div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground">状态</div>
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(customer.status)}`}>
                  {getStatusText(customer.status)}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">AI 评分</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${customer.ai_score}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{customer.ai_score}</span>
                </div>
              </div>

              {customer.last_contact_at && (
                <div>
                  <div className="text-sm text-muted-foreground">最后跟进</div>
                  <div className="text-sm">{formatDate(customer.last_contact_at)}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI 销售助手
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">最近跟进记录</label>
              <Textarea
                placeholder="输入最近的跟进记录..."
                value={lastInteraction}
                onChange={(e) => setLastInteraction(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleGetAISuggestion}
              disabled={loading || !lastInteraction.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  分析中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  获取 AI 建议
                </>
              )}
            </Button>

            {aiResponse && (
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <div className="text-sm font-medium mb-1 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    客户意图
                  </div>
                  <div className="text-sm bg-blue-50 p-2 rounded">{aiResponse.customer_intent}</div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">推荐话术</div>
                  <div className="text-sm bg-green-50 p-2 rounded">{aiResponse.suggested_script}</div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">下一步行动</div>
                  <div className="text-sm bg-orange-50 p-2 rounded">{aiResponse.next_action}</div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-1">置信度</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${aiResponse.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm">{Math.round(aiResponse.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
