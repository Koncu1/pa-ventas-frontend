import { useQuery } from '@tanstack/react-query'
import { getUsuariosService } from '../services/get-usuarios'

export function useGetUsuarios() {
  return useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuariosService,
  })
}