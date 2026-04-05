import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '智能客户池转化工具',
  description: '从线索到成交的全流程管理',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">{children}</body>
    </html>
  )
}
