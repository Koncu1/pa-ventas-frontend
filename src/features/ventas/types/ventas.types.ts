export type DetalleVentaEntity = {
  id: string
  ventaId: string
  producto: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  createdAt: string
  updatedAt: string
  // UI helpers
  marca?: string
  productoId?: string // referencia al producto elegido (UI)
}

export type VentaEntity = {
  id: string
  fecha: string
  usuarioId: string
  createdAt: string
  updatedAt: string
  detalleVenta: DetalleVentaEntity[]
  total?: number
}
