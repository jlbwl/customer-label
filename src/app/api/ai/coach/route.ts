import { NextResponse } from 'next/server'
import type { AICoachRequest, AICoachResponse } from '@/types'

const SYSTEM_PROMPT = `
你是一位经验丰富的销售教练，擅长分析客户意图并提供精准的销售建议。
你的任务是：
1. 分析客户的最新跟进记录，识别客户的真实意图和关注点
2. 根据分析结果，提供个性化的销售话术建议
3. 给出明确的下一步行动建议

分析维度：
- 价格敏感度：客户是否对价格敏感
- 功能需求：客户关注哪些具体功能
- 决策周期：客户的购买决策周期
- 竞品对比：是否在对比竞品
- 预算情况：客户的预算范围
- 决策权：客户是否有决策权

回复格式：
{
  "customer_intent": "客户意图分析（一句话概括）",
  "suggested_script": "推荐话术（具体可说的话）",
  "next_action": "下一步行动建议",
  "confidence": 0.85
}
`

function analyzeCustomerIntent(content: string): {
  intent: string
  keywords: string[]
} {
  const lowerContent = content.toLowerCase()

  const intentPatterns = [
    { pattern: /价格|报价|多少钱|成本|预算/, intent: '价格敏感', keywords: ['价格', '报价', '成本'] },
    { pattern: /功能|特性|能不能|是否支持/, intent: '功能咨询', keywords: ['功能', '特性', '支持'] },
    { pattern: /对比|比较|其他|竞品/, intent: '竞品对比', keywords: ['对比', '竞品', '比较'] },
    { pattern: /演示|试用|体验/, intent: '产品体验', keywords: ['演示', '试用', '体验'] },
    { pattern: /合同|签约|购买|下单/, intent: '购买意向', keywords: ['合同', '签约', '购买'] },
    { pattern: /考虑|商量|讨论/, intent: '犹豫观望', keywords: ['考虑', '商量', '讨论'] },
  ]

  for (const { pattern, intent, keywords } of intentPatterns) {
    if (pattern.test(lowerContent)) {
      return { intent, keywords }
    }
  }

  return { intent: '一般咨询', keywords: [] }
}

function generateSuggestedScript(intent: string, keywords: string[]): string {
  const scripts: Record<string, string> = {
    价格敏感:
      '我理解您对价格的关注。我们的产品虽然价格略高，但提供了更全面的功能和更优质的服务。目前我们有限时优惠活动，如果您本周内签约，可以享受8折优惠，还能获得额外的增值服务包。',
    功能咨询:
      '您提到的功能我们完全支持。让我为您详细演示一下这个功能的使用场景和效果。我可以安排一次专属的产品演示，针对您的具体需求进行展示。',
    竞品对比:
      '感谢您坦诚地告诉我们您在对比其他产品。相比竞品，我们的优势在于：1. 更灵活的定制化能力；2. 更完善的售后服务；3. 更快的响应速度。我可以为您提供一份详细的对比分析报告。',
    产品体验:
      '很高兴您想深入了解我们的产品。我可以立即为您开通试用账号，并提供一对一的使用指导。您看今天下午方便吗？',
    购买意向:
      '太好了！看来您已经认可我们的产品了。我可以立即为您准备合同和实施方案。我们还有快速通道服务，可以帮您在3天内完成部署上线。',
    犹豫观望:
      '我理解您需要时间考虑。为了帮助您更好地决策，我可以提供：1. 成功案例分享；2. ROI分析报告；3. 免费试用期延长。您看哪一项对您最有帮助？',
    一般咨询:
      '感谢您的咨询。为了更好地帮助您，我想了解一下您的具体需求和使用场景。您能简单描述一下您的业务痛点吗？',
  }

  return scripts[intent] || scripts['一般咨询']
}

function generateNextAction(intent: string): string {
  const actions: Record<string, string> = {
    价格敏感: '发送限时优惠券和价格对比表',
    功能咨询: '安排产品演示会议',
    竞品对比: '发送竞品对比分析报告',
    产品体验: '开通试用账号并提供指导',
    购买意向: '准备合同和实施方案',
    犹豫观望: '发送成功案例和ROI分析报告',
    一般咨询: '进行需求调研和痛点分析',
  }

  return actions[intent] || actions['一般咨询']
}

export async function POST(request: Request) {
  try {
    const body: AICoachRequest = await request.json()

    if (!body.last_interaction) {
      return NextResponse.json({ error: 'Missing last_interaction' }, { status: 400 })
    }

    const { intent, keywords } = analyzeCustomerIntent(body.last_interaction)

    const suggestedScript = generateSuggestedScript(intent, keywords)
    const nextAction = generateNextAction(intent)

    const confidence = keywords.length > 0 ? 0.85 : 0.65

    const response: AICoachResponse = {
      customer_intent: intent,
      suggested_script: suggestedScript,
      next_action: nextAction,
      confidence,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in AI coach:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
