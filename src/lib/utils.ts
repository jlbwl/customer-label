import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    lead: 'bg-blue-100 text-blue-800',
    following: 'bg-yellow-100 text-yellow-800',
    high_intent: 'bg-orange-100 text-orange-800',
    closed: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    lead: '线索',
    following: '跟进中',
    high_intent: '高意向',
    closed: '成交',
    lost: '流失',
  }
  return texts[status] || status
}

export function getInteractionTypeText(type: string): string {
  const texts: Record<string, string> = {
    phone: '电话',
    wechat: '微信',
    meeting: '面谈',
    email: '邮件',
    other: '其他',
  }
  return texts[type] || type
}

export function parseCustomerText(text: string): Partial<{
  name: string
  phone: string
  company: string
}> {
  const result: Partial<{
    name: string
    phone: string
    company: string
  }> = {}

  const phoneRegex = /1[3-9]\d{9}/
  const phoneMatch = text.match(phoneRegex)
  if (phoneMatch) {
    result.phone = phoneMatch[0]
  }

  const lines = text.split(/[\n,，、]/)
  if (lines.length > 0) {
    result.name = lines[0].trim()
  }

  const companyRegex = /公司[：:]\s*(.+)|(.+?)公司/
  const companyMatch = text.match(companyRegex)
  if (companyMatch) {
    result.company = (companyMatch[1] || companyMatch[2]).trim()
  }

  return result
}
