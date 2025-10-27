// src/features/ventas/services/get-ventas.ts
import type { VentaEntity, DetalleVentaEntity } from '../types/ventas.types'
import { getProductosService } from './get-products'

export async function getVentasService(): Promise<VentaEntity[]> {
  const productos = await getProductosService() // p1, p2, p3
  const now = new Date().toISOString()

  // Fechas de ejemplo (asegurate de que tu filtro incluya este rango)
  const fechas = ['2024-10-14', '2024-10-12', '2024-10-08']

  const ventas: VentaEntity[] = productos.slice(0, 3).map((p, i) => {
    const id = String(i + 1)
    const cantidad = i === 0 ? 2 : 1
    const precio = p.precio
    const subtotal = cantidad * precio

    const detalle: DetalleVentaEntity[] = [
      {
        id: `d${id}`,
        ventaId: id,
        producto: p.nombre,
        marca: p.marca,
        cantidad,
        precioUnitario: precio,
        subtotal,
        createdAt: now,
        updatedAt: now,
        imagen: '', // sin imagen
        // productoId opcional si lo usas en UI
      },
    ]

    return {
      id,
      fecha: new Date(fechas[i] ?? Date.now()).toISOString(),
      usuarioId: 'user-1',
      createdAt: now,
      updatedAt: now,
      detalleVenta: detalle,
      total: subtotal,
    }
  })

  // simulá latencia
  return new Promise((resolve) =>
    setTimeout(() => resolve(ventas.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))), 300),
  )
}
