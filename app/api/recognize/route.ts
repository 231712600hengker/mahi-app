import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json()

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Use Pro model for better reasoning on Indonesian food, with strict JSON output
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro',
      systemInstruction: "You are an expert Indonesian culinary nutritionist. Analyze the food image. You MUST return ONLY a valid JSON object. No markdown formatting, no code blocks, no other text."
    })

    const prompt = `Analyze this food image carefully. Focus heavily on Indonesian cuisine and local street food (e.g., Nasi Padang, Sate, Soto, Gorengan, Pecel, Bakso, Mie Ayam, Nasi Goreng).

Return EXACTLY this JSON format:
{
  "food_name": "Nama makanan spesifik dalam Bahasa Indonesia (misal: 'Nasi Goreng Ayam' bukan cuma 'Nasi')",
  "estimated_quantity": "Perkiraan porsi visual (misal: '1 piring sedang', '2 tusuk', '1 mangkuk')",
  "confidence": 0.90,
  "nutrition": {
    "calories": 450,
    "protein": 15,
    "carbs": 50,
    "fat": 12,
    "fiber": 3
  }
}

Rules:
1. DO NOT use markdown \`\`\`json blocks. Return raw JSON text only.
2. Even if the image is blurry, make your best educated guess based on colors and shapes.
3. Give realistic macro-nutrients (in grams) and calories based on typical Indonesian recipes.
4. If it's a mix of food (like Nasi Padang), name the main dishes combined (e.g., 'Nasi Putih, Rendang, Daun Singkong') and sum the nutrition.
5. ONLY return confidence < 0.3 if you are 100% sure it is NOT food or a completely blank image. Otherwise, guess the food!`

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [
        { inlineData: { mimeType, data: imageBase64 } },
        { text: prompt }
      ]}],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2, // Lower temperature for more consistent, factual output
      }
    })

    const text = result.response.text().trim()
    console.log("Gemini Raw Output:", text)

    // Robust parsing
    let parsed
    try {
      // Strip markdown just in case the model ignores the instruction
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", text)
      throw new Error("Invalid JSON response from AI")
    }

    // Ensure all required fields exist to prevent UI crashes
    const safeData = {
      food_name: parsed.food_name || 'Makanan Tidak Dikenali',
      estimated_quantity: parsed.estimated_quantity || '1 porsi',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
      nutrition: {
        calories: Number(parsed.nutrition?.calories) || 0,
        protein: Number(parsed.nutrition?.protein) || 0,
        carbs: Number(parsed.nutrition?.carbs) || 0,
        fat: Number(parsed.nutrition?.fat) || 0,
        fiber: Number(parsed.nutrition?.fiber) || 0,
      }
    }

    return NextResponse.json(safeData)
  } catch (err) {
    console.error('Recognize API error:', err)
    return NextResponse.json(
      { 
        food_name: 'Gagal menganalisis gambar', 
        estimated_quantity: '-', 
        confidence: 0,
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      },
      { status: 200 } // Return 200 with fallback data so UI doesn't completely crash, just shows default
    )
  }
}
