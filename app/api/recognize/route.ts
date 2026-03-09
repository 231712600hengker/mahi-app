import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a food recognition AI. Analyze this food image and respond ONLY with a valid JSON object. No explanation, no markdown. Format:
{
  "food_name": "nama makanan dalam Bahasa Indonesia yang deskriptif",
  "estimated_quantity": "perkiraan porsi (misal: 1 porsi, 200g, 1 mangkuk)",
  "confidence": 0.85
}

If you cannot identify food in the image, return:
{"food_name": "Makanan Tidak Dikenali", "estimated_quantity": "1 porsi", "confidence": 0.1}
`

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
      prompt,
    ])

    const text = result.response.text().trim()

    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Recognize API error:', err)
    return NextResponse.json(
      { food_name: 'Makanan Tidak Dikenali', estimated_quantity: '1 porsi', confidence: 0 },
      { status: 200 }
    )
  }
}
