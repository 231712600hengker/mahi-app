export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  daily_calorie_goal: number
  created_at: string
}

export interface FoodLog {
  id: string
  user_id: string
  date: string // YYYY-MM-DD
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  quantity: string
  image_url: string | null
  created_at: string
}

export interface NutritionData {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

export interface RecognizeResult {
  food_name: string
  estimated_quantity: string
  confidence: number
}

export interface EdamamFood {
  foodId: string
  label: string
  nutrients: {
    ENERC_KCAL: number
    PROCNT: number
    FAT: number
    CHOCDF: number
    FIBTG: number
  }
}

export interface DailySummary {
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  total_fiber: number
  logs: FoodLog[]
}
