import { env } from '@/lib/env'
import type { ProductResponse } from '../types/types'

export async function getProductsService(): Promise<ProductResponse> {
  try {
    const backendUrl = env.BACKEND_URL || 'http://localhost:3000'

    const productsApiUrl = new URL(`${backendUrl}/product`)

    const response = await fetch(productsApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }, 
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }

    const data = await response.json()
    return data as ProductResponse
  } catch {
    throw new Error('Failed to fetch products')
  }
}