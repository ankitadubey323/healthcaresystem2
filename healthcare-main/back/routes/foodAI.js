import express from 'express'
import Groq from 'groq-sdk'

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const MEALDB = "https://www.themealdb.com/api/json/v1/1"

// ── MealDB se food fetch ─────────────────────────────────────────────────────
async function getMealData(foodName) {
  try {
    const searchRes = await fetch(
      MEALDB + "/search.php?s=" + encodeURIComponent(foodName)
    )
    const searchData = await searchRes.json()
    let meal = searchData.meals?.[0]

    if (!meal) {
      const firstWord = foodName.split(' ')[0]
      const retryRes = await fetch(
        MEALDB + "/search.php?s=" + encodeURIComponent(firstWord)
      )
      const retryData = await retryRes.json()
      meal = retryData.meals?.[0]
    }

    if (!meal) return null

    const ingredients = []
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal["strIngredient" + i]
      const measure = meal["strMeasure" + i]
      if (ingredient && ingredient.trim()) {
        ingredients.push((measure ? measure.trim() + " " : "") + ingredient.trim())
      }
    }

    const steps = meal.strInstructions
      ? meal.strInstructions
          .split(/\r\n|\n|\r/)
          .map(s => s.trim())
          .filter(s => s.length > 10)
      : []

    return {
      name: meal.strMeal,
      image: meal.strMealThumb,
      calories: 0,
      per: "1 serving",
      isDrink: false,
      ingredients,
      steps,
      tags: [meal.strCategory, meal.strArea, meal.strTags]
        .filter(Boolean).join(",").split(",")
        .map(t => t.trim()).filter(Boolean),
      youtubeUrl: meal.strYoutube || null,
    }
  } catch (err) {
    console.error("MealDB error:", err)
    return null
  }
}

// ── Groq se drink recipe generate karo ──────────────────────────────────────
async function getDrinkRecipe(drinkName, condition) {
  const prompt = `You are a nutritionist. Generate a healthy drink recipe for "${drinkName}" that is good for "${condition}".

Return ONLY this JSON (no markdown):
{
  "name": "${drinkName}",
  "image": null,
  "calories": 50,
  "per": "1 glass",
  "isDrink": true,
  "ingredients": ["ingredient 1 with quantity", "ingredient 2 with quantity"],
  "steps": ["Step 1", "Step 2", "Step 3"],
  "tags": ["Healthy", "Detox"],
  "description": "Brief description of health benefits"
}`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    })
    const raw = completion.choices[0]?.message?.content || ''
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Drink image — Unsplash free URL
    const drinkImages = {
      'green tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
      'lemon water': 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=600&q=80',
      'ginger tea': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600&q=80',
      'smoothie': 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&q=80',
      'detox water': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
      'turmeric milk': 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=600&q=80',
      'coconut water': 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?w=600&q=80',
      'protein shake': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      'beetroot juice': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=600&q=80',
      'kombucha': 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600&q=80',
    }

    const imageKey = Object.keys(drinkImages).find(k =>
      drinkName.toLowerCase().includes(k)
    )
    parsed.image = drinkImages[imageKey] || 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&q=80'

    return parsed
  } catch {
    return null
  }
}

// ── Detect karo user food chahta hai ya drink ────────────────────────────────
function detectRequestType(condition) {
  const lower = condition.toLowerCase()
  const drinkWords = ['drink', 'beverage', 'juice', 'smoothie', 'tea', 'water', 'shake', 'liquid', 'peena', 'piye', 'pine']
  const foodWords = ['food', 'eat', 'meal', 'khana', 'recipe', 'dish']

  const wantsDrink = drinkWords.some(w => lower.includes(w))
  const wantsFood = foodWords.some(w => lower.includes(w))

  if (wantsDrink && wantsFood) return 'both'
  if (wantsDrink) return 'drink'
  return 'food'
}

// ── POST /api/food/recommend ─────────────────────────────────────────────────
router.post('/recommend', async (req, res) => {
  const { condition } = req.body
  if (!condition || condition.trim().length < 2) {
    return res.status(400).json({ error: 'Please provide a health condition' })
  }

  const requestType = detectRequestType(condition)
  console.log("Request type:", requestType, "for:", condition)

  const systemPrompt = `You are a certified nutritionist. Recommend healthy ${requestType === 'drink' ? 'drinks' : requestType === 'both' ? 'foods and drinks' : 'foods'} for health conditions.
Respond ONLY with valid JSON. No markdown.`

  let userPrompt

  if (requestType === 'drink') {
    userPrompt = `Recommend 6 healthy DRINKS for: "${condition}".
Examples: "green tea", "ginger lemon water", "beetroot juice", "turmeric milk", "detox water", "coconut water", "protein shake", "kombucha"

Return ONLY this JSON:
{
  "condition": "${condition}",
  "recommendations": [
    {
      "name": "Drink name",
      "why": "Why good for ${condition}",
      "tag": "Detox|Anti-Inflammatory|Weight Loss|High Protein|Heart Healthy",
      "calories": 50,
      "isDrink": true
    }
  ],
  "foods_to_avoid": [
    { "name": "Drink to avoid", "reason": "Why harmful" }
  ],
  "general_tip": "One practical tip"
}`
  } else if (requestType === 'both') {
    userPrompt = `Recommend 3 healthy foods AND 3 healthy drinks for: "${condition}".
Food examples: "chicken soup", "grilled salmon", "omelette"
Drink examples: "green tea", "detox water", "ginger juice"

Return ONLY this JSON:
{
  "condition": "${condition}",
  "recommendations": [
    {
      "name": "Food or drink name",
      "why": "Why good for ${condition}",
      "tag": "Low Carb|High Protein|Weight Loss|Heart Healthy|Detox",
      "calories": 150,
      "isDrink": false
    }
  ],
  "foods_to_avoid": [
    { "name": "Name", "reason": "Why harmful" }
  ],
  "general_tip": "One practical tip"
}`
  } else {
    userPrompt = `Recommend 6 healthy FOODS for: "${condition}".
Use simple English food names from TheMealDB: "chicken soup", "grilled salmon", "beef stew", "omelette", "pasta", "fish pie"
DO NOT suggest any drinks, teas, juices or beverages.

Return ONLY this JSON:
{
  "condition": "${condition}",
  "recommendations": [
    {
      "name": "Simple food name",
      "why": "Why good for ${condition}",
      "tag": "Low Carb|High Protein|Weight Loss|Heart Healthy|Anti-Inflammatory",
      "calories": 250,
      "isDrink": false
    }
  ],
  "foods_to_avoid": [
    { "name": "Food name", "reason": "Why harmful" }
  ],
  "general_tip": "One practical tip"
}`
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const raw = completion.choices[0]?.message?.content || ''
    const cleaned = raw.replace(/```json|```/g, '').trim()
    let parsed

    try {
      parsed = JSON.parse(cleaned)
    } catch {
      return res.status(500).json({ error: 'AI parsing failed. Try again.' })
    }

    // Har item ke liye data fetch karo
    const enrichedFoods = await Promise.all(
      parsed.recommendations.map(async (food) => {
        if (food.isDrink) {
          // Drink ke liye Groq se recipe lo
          const drinkData = await getDrinkRecipe(food.name, condition)
          return {
            name: drinkData?.name || food.name,
            image: drinkData?.image || null,
            calories: drinkData?.calories || food.calories || 50,
            per: drinkData?.per || "1 glass",
            tag: food.tag,
            why: food.why,
            ingredients: drinkData?.ingredients || [],
            steps: drinkData?.steps || [],
            tags: drinkData?.tags || [food.tag],
            isDrink: true,
            description: drinkData?.description || food.why,
          }
        } else {
          // Food ke liye MealDB se lo
          const mealData = await getMealData(food.name)
          return {
            name: mealData?.name || food.name,
            image: mealData?.image || null,
            calories: food.calories || 200,
            per: "1 serving",
            tag: food.tag,
            why: food.why,
            ingredients: mealData?.ingredients || [],
            steps: mealData?.steps || [],
            tags: mealData?.tags?.length ? mealData.tags : [food.tag],
            isDrink: false,
            youtubeUrl: mealData?.youtubeUrl || null,
          }
        }
      })
    )

    // Safety check
    const evalPrompt = `You are a strict medical nutrition safety evaluator.
Condition: "${condition}"
Items: ${enrichedFoods.map(f => f.name).join(', ')}

Return ONLY this JSON (no markdown):
{
  "evaluation": [
    {
      "name": "Item Name",
      "safe": true,
      "reason": "Why safe or unsafe",
      "calories": 200
    }
  ]
}`

    let safeFoods = enrichedFoods
    try {
      const evalCompletion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: evalPrompt }],
        temperature: 0.1,
        max_tokens: 800,
      })
      const evalRaw = evalCompletion.choices[0]?.message?.content || ''
      const evalCleaned = evalRaw.replace(/```json|```/g, '').trim()
      const evaluation = JSON.parse(evalCleaned)

      if (evaluation?.evaluation) {
        safeFoods = enrichedFoods.map(food => {
          const eval_ = evaluation.evaluation.find(
            e => e.name.toLowerCase().includes(food.name.toLowerCase().split(' ')[0])
          )
          return {
            ...food,
            safe: eval_?.safe !== false,
            safetyNote: eval_?.reason || null,
            calories: eval_?.calories || food.calories,
          }
        }).filter(f => f.safe !== false)
      }
    } catch {
      // Evaluation fail hone pe original list use karo
    }

    res.json({
      condition: parsed.condition,
      recommendations: safeFoods,
      foods_to_avoid: parsed.foods_to_avoid || [],
      general_tip: parsed.general_tip || '',
    })

  } catch (err) {
    console.error('Groq /recommend error:', err)
    res.status(500).json({ error: 'AI service unavailable. Try again.' })
  }
})

// ── GET /api/food/search ─────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  const { name } = req.query
  if (!name) return res.status(400).json({ error: 'Food name required' })

  let data = await getMealData(name)
  if (!data) {
    const firstWord = name.split(' ')[0]
    data = await getMealData(firstWord)
  }
  if (!data) return res.status(404).json({ error: 'Food not found' })

  res.json(data)
})

// ── POST /api/food/scan ──────────────────────────────────────────────────────
router.post('/scan', async (req, res) => {
  const { imageBase64 } = req.body
  if (!imageBase64) return res.status(400).json({ error: 'No image provided' })

  const detectPrompt = `You are a food recognition expert.
Identify the food and return ONLY this JSON (no markdown):
{
  "detected_food": "Simple common food name",
  "confidence": "high|medium|low",
  "description": "Brief description",
  "estimated_calories": 200
}`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: detectPrompt }],
      temperature: 0.2,
      max_tokens: 200,
    })

    const raw = completion.choices[0]?.message?.content || ''
    const cleaned = raw.replace(/```json|```/g, '').trim()
    let detected

    try {
      detected = JSON.parse(cleaned)
    } catch {
      detected = { detected_food: 'Unknown Food', confidence: 'low', estimated_calories: 0 }
    }

    const mealData = await getMealData(detected.detected_food)

    res.json({
      detected_food: mealData?.name || detected.detected_food,
      confidence: detected.confidence,
      calories: detected.estimated_calories || 0,
      per: "1 serving",
      image: mealData?.image || null,
      tags: mealData?.tags || [],
      description: detected.description || '',
      ingredients: mealData?.ingredients || [],
      steps: mealData?.steps || [],
    })

  } catch (err) {
    console.error('Scan error:', err)
    res.status(500).json({ error: 'Scan unavailable. Try again.' })
  }
})

// ── GET /api/food/catalog ────────────────────────────────────────────────────
router.get('/catalog', async (req, res) => {
  const defaultFoods = [
    'chicken', 'salmon', 'beef', 'pasta',
    'salad', 'soup', 'omelette', 'pancakes'
  ]
  try {
    const foods = await Promise.all(
      defaultFoods.map(food => getMealData(food))
    )
    res.json(foods.filter(Boolean))
  } catch (err) {
    res.status(500).json({ error: 'Catalog unavailable' })
  }
})

export default router