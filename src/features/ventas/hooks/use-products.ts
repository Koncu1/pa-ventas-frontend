import { useQuery } from '@tanstack/react-query'
import { getProductosService } from '../services/get-products'

export function useGetProductos() {
  return useQuery({
    queryKey: ['productos-catalogo'],
    queryFn: getProductosService,
  })
}