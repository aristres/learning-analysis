import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import type { AssessmentResult, LearningTypeResult } from '@/types'

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30_000 })
  }
  return _openai
}

// 宿題ごとのデフォルトアドバイス（OpenAI未設定時のフォールバック）
const DEFAULT_ADVICE: Record<string, string> = {
  calc:         '計算は時間を計ってゲーム感覚でやると集中できます。間違えても責めず「どこでミスしたか」一緒に確認してあげてください。',
  word_problem: '文章題は問題文を読んで「何を求めているか」に線を引いてから式を立てると整理しやすくなります。',
  drawing:      '作図は定規・コンパスを使う順番を声に出しながら進めると手順を覚えやすくなります。',
  kanji:        '漢字は書く前に「空書き（エアで書く）」してからノートに書くと記憶に定着しやすいです。',
  kanji_problem:'漢字問題は読みと書きに分けて確認しましょう。苦手な字だけ厚紙に書いて貼っておくのも効果的です。',
  reading:      '文章問題は先に設問を読んでから本文を読むと、答えを探しながら読めて効率アップします。',
  essay:        '作文は「いつ・どこで・誰と・何を・どう思ったか」の5つを箇条書きしてからまとめると書きやすくなります。',
  diary:        '日記はその日一番印象に残った場面を1つ選んで書くと、短くてもまとまった内容になります。',
  self_study:   '自主学習は「好きなことを深める」「苦手を少しだけ練習する」のどちらかにテーマを決めると取り組みやすいです。',
  ondoku:       '音読は1回ただ読むより、「どこで区切るか」を意識しながら読むと理解力が上がります。聞いてあげるだけで子どものやる気が変わります。',
  calc_card:    '計算カードはランダムに順番を変えながらやると、答えを覚えず計算力が本当につきます。タイムを計って自己ベストを目指すと楽しく続けられます。',
  social_work:  '社会のワークは地図・図・年表を先に確認してから文章問題を解くと頭に入りやすくなります。',
  science_work: '理科のワークは実験の手順や結果を思い出しながら解くと記憶と結びつきやすくなります。',
  vocab:        '英単語は声に出して読みながら書くと記憶に残りやすいです。1回10個まで、翌日に前日分を復習するサイクルが効果的です。',
  grammar:      '英文法は例文を暗記するのが近道です。「この文は使えそう」と思ったものを1文ノートに書いておきましょう。',
  reading_en:   '英文読解は知らない単語があっても全体の流れを先につかんでから、設問に答えていきましょう。',
  listening:    'リスニングは音声を聞く前に選択肢をざっと読んで「何を聞き取るか」を頭に入れておくと正答率が上がります。',
  writing_en:   '英作文は日本語で言いたいことを先にメモしてから、知っている単語・文法で表現する練習をしましょう。',
}

export async function POST(request: NextRequest) {
  try {
    const { planId, childId, selectedHomework, customHomework } = await request.json() as {
      planId: string
      childId: string
      selectedHomework: string[]
      customHomework?: string
    }

    if (!childId || (!selectedHomework?.length && !customHomework)) {
      return NextResponse.json({ error: '必須パラメータが不足しています' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: '認証が必要です' }, { status: 401 })

    // プランの期限チェック
    if (planId) {
      const today = new Date().toISOString().split('T')[0]
      const { data: plan } = await supabase
        .from('plans')
        .select('end_date, status')
        .eq('id', planId)
        .eq('parent_id', user.id)
        .single()
      if (!plan || plan.status !== 'active' || (plan.end_date && plan.end_date < today)) {
        return NextResponse.json({ error: 'プランの利用期間が終了しています' }, { status: 403 })
      }
    }

    // 子どもの学習プロファイルを取得（最新の完了済みアセスメントから）
    let learningProfile: { typeLabel: string; typeDesc: string; subTags: string[] } | null = null
    let reportResult: AssessmentResult | null = null

    if (planId) {
      const { data: plan } = await supabase
        .from('plans')
        .select('assessment_id')
        .eq('id', planId)
        .eq('parent_id', user.id)
        .single()

      const assessmentId = plan?.assessment_id ?? null

      const query = supabase
        .from('assessments')
        .select('result_json')
        .eq('child_id', childId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)

      const { data: assessments } = assessmentId
        ? await supabase.from('assessments').select('result_json').eq('id', assessmentId).single().then(r => ({ data: r.data ? [r.data] : [] }))
        : await query

      if (assessments && assessments.length > 0) {
        const result = assessments[0].result_json as (AssessmentResult & { v2?: { learning_type?: LearningTypeResult } }) | null
        if (result) {
          reportResult = result
          const v2 = result.v2?.learning_type
          learningProfile = {
            typeLabel: v2?.type_label ?? result.study_style?.type ?? '不明',
            typeDesc: v2?.type_description ?? result.study_style?.description ?? '',
            subTags: v2?.sub_tags ?? [],
          }
        }
      }
    }

    // 宿題ラベルマップ
    const homeworkLabels: Record<string, string> = {
      calc: '計算', word_problem: '文章題', drawing: '作図',
      kanji: '漢字（書き）', kanji_problem: '漢字問題', reading: '文章問題',
      essay: '作文', diary: '日記', self_study: '自主学習',
      ondoku: '音読', calc_card: '計算カード',
      social_work: '社会のワーク', science_work: '理科のワーク',
      vocab: '英単語', grammar: '英文法', reading_en: '英文読解',
      listening: 'リスニング', writing_en: '英作文',
    }

    const homeworkNames = selectedHomework.map(id => homeworkLabels[id] ?? id)
    if (customHomework) homeworkNames.push(customHomework)

    // OpenAIでアドバイス生成（利用可能な場合）
    const openai = getOpenAI()

    if (openai) {
      const profileText = learningProfile
        ? `学習タイプ: ${learningProfile.typeLabel}（${learningProfile.typeDesc}）`
        : ''
      const strengthsText = reportResult?.strengths?.slice(0, 2).join('、') ?? ''
      const weaknessesText = reportResult?.weaknesses?.slice(0, 2).join('、') ?? ''

      const prompt = `あなたは小学生・中学生の学習支援の専門家です。以下のお子さんの学習特性と今日の宿題を見て、具体的で実践的なアドバイスを親御さん向けに日本語で提供してください。

【お子さんの学習特性】
${profileText}
${strengthsText ? `得意なこと: ${strengthsText}` : ''}
${weaknessesText ? `サポートが必要な点: ${weaknessesText}` : ''}

【今日の宿題】
${homeworkNames.join('、')}

【アドバイス形式】
- 各宿題に1〜2文の具体的なアドバイス（親が家庭で実践できる内容）
- 学習特性に合わせた工夫を含める
- 温かく励ます言葉で締める
- Markdown不使用、改行のみで整形
- 合計400字以内`

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
          temperature: 0.7,
        })
        const advice = completion.choices[0]?.message?.content ?? ''
        return NextResponse.json({ advice, homework: homeworkNames })
      } catch (err) {
        console.error('OpenAI error:', err)
        // フォールバックへ
      }
    }

    // フォールバック：デフォルトアドバイスを組み合わせ
    const adviceParts = selectedHomework
      .map(id => DEFAULT_ADVICE[id])
      .filter(Boolean)

    if (customHomework) {
      adviceParts.push(`「${customHomework}」については、まず全体を見渡してから取り組む範囲を決めると始めやすくなります。`)
    }

    const advice = adviceParts.length > 0
      ? adviceParts.join('\n\n') + '\n\n今日も一緒に頑張りましょう！'
      : '今日の宿題、一つずつ丁寧に取り組んでみてください。焦らず、できたことを褒めてあげましょう。'

    return NextResponse.json({ advice, homework: homeworkNames })
  } catch (err) {
    console.error('Homework advice error:', err)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
