import { createFileRoute } from '@tanstack/react-router'
import { VentasForm } from '@/features/ventas'

export const Route = createFileRoute('/ventas')({
  component: VentasForm, 
})
