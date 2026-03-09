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

    const prompt = `You are an expert food recognition and nutrition estimation AI. Analyze this food image carefully.
Respond ONLY with a valid JSON object. No explanation, no markdown.

Format:
{
  "food_name": "nama makanan dalam Bahasa Indonesia yang deskriptif dan akurat",
  "estimated_quantity": "perkiraan porsi (misal: 1 porsi, 200g, 1 mangkuk)",
  "confidence": 0.85,
  "nutrition": {
    "calories": 450,
    "protein": 15,
    "carbs": 50,
    "fat": 12,
    "fiber": 3
  }
}

Estimate the macro-nutrients (in grams) and calories based on visual portion size and typical ingredients for this dish. DO NOT use generic or zero values if food is clearly visible.

If you are absolutely certain there is no food in the image, return:
{
  "food_name": "Makanan Tidak Dikenali",
  "estimated_quantity": "1 porsi",
  "confidence": 0.1,
  "nutrition": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0, "fiber": 0 }
}
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
      { 
        food_name: 'Makanan Tidak Dikenali', 
        estimated_quantity: '1 porsi', 
        confidence: 0,
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      },
      { status: 200 }
    )
  }
}
