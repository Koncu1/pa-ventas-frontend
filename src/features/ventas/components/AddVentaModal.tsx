import * as React from 'react'
import { nanoid } from 'nanoid'
import type { DetalleVentaEntity, VentaEntity } from '@/features/ventas/types/ventas.types'
import { useQueryClient } from '@tanstack/react-query'
import { useGetUsuarios } from '@/features/ventas/hooks/use-usuarios'
import { useProductContext } from '@/features/producto/hook/productos'

type Props = { open: boolean; onClose: () => void }

type DetalleForm = {
  productoId?: string
  producto: string
  marca?: string
  cantidad: number
  precioUnitario: number
}

type ProductoLite = {
  id: string
  nombre: string
  marca?: string | null
  precio: number
  stock: number
}

const currency = (v: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v)

export const AddVentaModal: React.FC<Props> = ({ open, onClose }) => {
  const qc = useQueryClient()
  const { data: usuarios = [], isLoading: loadingUsuarios } = useGetUsuarios()

  const {
    data: products = [],
    isLoading: loadingProductos,
    isError,
    error,
  } = useProductContext()

  const productosLite: ProductoLite[] = React.useMemo(
    () =>
      (products as any[]).map((p: any, idx: number) => ({
        id: String(p?.id ?? p?.productoId ?? p?.uuid ?? idx),
        nombre: p?.nombre ?? '',
        marca: p?.marca ?? null,
        precio: Number(p?.precio ?? 0),
        stock: Number(p?.stock ?? 0),
      })),
    [products]
  )

  const [fecha, setFecha] = React.useState<string>(new Date().toISOString().slice(0, 10))
  const [usuarioId, setUsuarioId] = React.useState<string>('')

  const [detalles, setDetalles] = React.useState<DetalleForm[]>([
    { productoId: undefined, producto: '', marca: '', cantidad: 1, precioUnitario: 0 },
  ])

  console.log('Productos lite en AddVentaModal:', productosLite)

  const idFecha = React.useId()
  const idUsuario = React.useId()
  const modalTitleId = React.useId()

  const updateDetalle = (idx: number, patch: Partial<DetalleForm>) =>
    setDetalles((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)))

  const onChangeProducto = (idx: number, productoId: string) => {
    const p = productosLite.find((x) => x.id === productoId)
    updateDetalle(idx, {
      productoId,
      producto: p?.nombre ?? '',
      marca: p?.marca ?? '',
      precioUnitario: p?.precio ?? 0,
    })
  }

  const addDetalle = () =>
    setDetalles((prev) => [...prev, { productoId: undefined, producto: '', marca: '', cantidad: 1, precioUnitario: 0 }])

  const removeDetalle = (idx: number) => setDetalles((prev) => prev.filter((_, i) => i !== idx))

  const total = detalles.reduce((acc, d) => acc + (Number(d.cantidad) * Number(d.precioUnitario) || 0), 0)

  const isValid = () => {
    if (!usuarioId) return false
    if (!detalles.length) return false
    return detalles.every((d) => d.productoId && d.producto && d.cantidad > 0 && d.precioUnitario >= 0)
  }

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    if (!isValid()) return

    const id = nanoid(6)
    const now = new Date().toISOString()

    const detalleVenta: DetalleVentaEntity[] = detalles.map((d) => {
      const cantidad = Number(d.cantidad) || 0
      const precio = Number(d.precioUnitario) || 0
      return {
        id: nanoid(8),
        ventaId: id,
        producto: d.producto,
        cantidad,
        precioUnitario: precio,
        subtotal: cantidad * precio,
        createdAt: now,
        updatedAt: now,
        marca: d.marca || undefined,
        productoId: d.productoId,
      }
    })

    const venta: VentaEntity = {
      id,
      fecha: new Date(fecha).toISOString(),
      usuarioId,
      createdAt: now,
      updatedAt: now,
      detalleVenta,
      total: detalleVenta.reduce((acc, d) => acc + d.subtotal, 0),
    }

    const prev = (qc.getQueryData(['ventas']) as VentaEntity[] | undefined) ?? []
    qc.setQueryData(['ventas'], [venta, ...prev])

    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="absolute inset-0 overflow-y-auto px-4 py-10">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          className="mx-auto max-w-3xl rounded-xl bg-white shadow-xl ring-1 ring-black/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h3 id={modalTitleId} className="text-xl font-semibold">Agregar Venta</h3>
            <button className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Datos de la venta */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1" htmlFor={idFecha}>
                <span className="text-sm font-medium text-gray-700">Fecha</span>
                <input id={idFecha} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="border rounded-md px-3 py-2" required />
              </label>

              <label className="flex flex-col gap-1 sm:col-span-2" htmlFor={idUsuario}>
                <span className="text-sm font-medium text-gray-700">Usuario</span>
                <select id={idUsuario} value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} className="border rounded-md px-3 py-2" required>
                  <option value="" disabled>
                    {loadingUsuarios ? 'Cargando usuarios...' : 'Seleccione un usuario'}
                  </option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Detalle(s) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Detalle de Venta</h4>
                <button type="button" onClick={addDetalle} className="text-sm rounded-md bg-blue-600 text-white px-3 py-1 hover:bg-blue-700">
                  + Agregar ítem
                </button>
              </div>

              {isError && (
                <div className="text-sm text-red-600">
                  Error al cargar productos: {(error as Error)?.message || 'desconocido'}
                </div>
              )}

              {detalles.map((d, idx) => {
                const pSel: ProductoLite | undefined = d.productoId
                  ? productosLite.find((p) => p.id === d.productoId)
                  : undefined

                const subtotal = (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0)

                const idProd = `producto-${idx}`
                const idCant = `cantidad-${idx}`
                const idPrecio = `precio-${idx}`
                const idSubtotal = `subtotal-${idx}`

                return (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 border rounded-lg p-3">
                    {/* Producto */}
                    <label className="flex flex-col gap-1 sm:col-span-5" htmlFor={idProd}>
                      <span className="text-sm text-gray-700">Producto</span>
                      <select
                        id={idProd}
                        value={d.productoId ?? ''}
                        onChange={(e) => onChangeProducto(idx, e.target.value)}
                        className="border rounded-md px-3 py-2"
                        required
                      >
                        <option value="" disabled>
                          {loadingProductos ? 'Cargando productos...' : 'Seleccione un producto'}
                        </option>
                        {productosLite.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre} ({p.marca ?? '—'}) — {currency(p.precio)} | stock: {p.stock}
                          </option>
                        ))}
                      </select>
                    </label>

                    {/* Cantidad */}
                    <label className="flex flex-col gap-1 sm:col-span-2" htmlFor={idCant}>
                      <span className="text-sm text-gray-700">Cantidad</span>
                      <input
                        id={idCant}
                        type="number"
                        min={1}
                        max={pSel?.stock ?? undefined}
                        value={d.cantidad}
                        onChange={(e) => updateDetalle(idx, { cantidad: Number(e.target.value) })}
                        className="border rounded-md px-3 py-2"
                        required
                      />
                    </label>

                    {/* Precio unitario */}
                    <label className="flex flex-col gap-1 sm:col-span-2" htmlFor={idPrecio}>
                      <span className="text-sm text-gray-700">Precio unit.</span>
                      <input
                        id={idPrecio}
                        type="number"
                        min={0}
                        step="0.01"
                        value={d.precioUnitario}
                        onChange={(e) => updateDetalle(idx, { precioUnitario: Number(e.target.value) })}
                        className="border rounded-md px-3 py-2"
                        required
                      />
                    </label>

                    {/* Subtotal (solo lectura) */}
                    <div className="flex flex-col gap-1 sm:col-span-3">
                      <span className="text-sm text-gray-700">Subtotal</span>
                      <div
                        id={idSubtotal}
                        role="status"
                        aria-live="polite"
                        className="h-[38px] flex items-center px-3 py-2 rounded-md border bg-gray-50"
                      >
                        {currency(subtotal)}
                      </div>
                    </div>

                    {/* Quitar */}
                    <div className="sm:col-span-12 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeDetalle(idx)}
                        className="text-sm text-red-600 hover:text-red-700"
                        aria-label={`Quitar ítem ${idx + 1}`}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold">{currency(total)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={!isValid()} className="rounded-md bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-60">
                  Guardar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
