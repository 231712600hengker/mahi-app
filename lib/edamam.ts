import { NutritionData } from '@/types'

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID!
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY!

export async function fetchNutrition(
  foodName: string,
  quantity: string = '1 serving'
): Promise<NutritionData | null> {
  try {
    const ingr = encodeURIComponent(`${quantity} ${foodName}`)
    const url = `https://api.edamam.com/api/nutrition-data?app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&ingr=${ingr}&nutrition-type=cooking`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Edamam API error')

    const data = await res.json()

    return {
      calories: Math.round(data.calories ?? 0),
      protein: Math.round((data.totalNutrients?.PROCNT?.quantity ?? 0) * 10) / 10,
      carbs: Math.round((data.totalNutrients?.CHOCDF?.quantity ?? 0) * 10) / 10,
      fat: Math.round((data.totalNutrients?.FAT?.quantity ?? 0) * 10) / 10,
      fiber: Math.round((data.totalNutrients?.FIBTG?.quantity ?? 0) * 10) / 10,
    }
  } catch (err) {
    console.error('Edamam fetch error:', err)
    return null
  }
}
