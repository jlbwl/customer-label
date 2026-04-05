import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查是否为生产环境
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: 'Public pool recovery is disabled in non-production environment',
        movedCount: 0,
      })
    }

    // 导入 Supabase 客户端
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = createServerClient()

    // 使用数据库函数移动客户到公海池
    const { error: functionError } = await supabase.rpc('move_to_public_pool')

    if (functionError) {
      throw functionError
    }

    // 获取移动的客户数量
    const { data: movedCustomers, error: fetchError } = await supabase
      .from('customers')
      .select('id')
      .is('is_public', true)
      .is('owner_id', null)

    if (fetchError) {
      throw fetchError
    }

    const movedCount = movedCustomers ? movedCustomers.length : 0

    return NextResponse.json({
      success: true,
      message: `Moved ${movedCount} customers to public pool`,
      movedCount,
    })
  } catch (error) {
    console.error('Error in public pool recovery:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
      }
    )
  }
}
