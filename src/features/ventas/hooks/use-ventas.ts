import { useQuery } from '@tanstack/react-query'
import { getVentasService } from '../services/get-ventas'

export function useGetVentas() {
  return useQuery({
    queryKey: ['ventas'],
    queryFn: getVentasService,
  })
}