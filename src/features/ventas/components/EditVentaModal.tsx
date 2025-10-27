import * as React from 'react'
import { nanoid } from 'nanoid'
import type { DetalleVentaEntity, VentaEntity } from '@/features/ventas/types/ventas.types'
import { useQueryClient } from '@tanstack/react-query'
import { useGetUsuarios } from '@/features/ventas/hooks/use-usuarios'
import { useGetProductos } from '@/features/ventas/hooks/use-products'

export type EditVentaPageProps = {
  venta: VentaEntity
  onCancel?: () => void
}

// UI helpers
const currency = (v: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(v)

export type DetalleForm = {
  id?: string
  productoId?: string
  producto: string
  marca?: string
  cantidad: number
  precioUnitario: number
}

export default function EditVentaPage({ venta, onCancel }: EditVentaPageProps) {
  const qc = useQueryClient()
  const { data: usuarios = [], isLoading: loadingUsuarios } = useGetUsuarios()
  const { data: productos = [], isLoading: loadingProductos } = useGetProductos()

  // Fecha y usuario
  const [fecha, setFecha] = React.useState<string>(new Date(venta.fecha).toISOString().slice(0, 10))
  const [usuarioId, setUsuarioId] = React.useState<string>(venta.usuarioId)

  // Mapa original de detalles por id, para mantener createdAt y validar stock
  const originalById = React.useMemo(() => {
    const map: Record<string, { producto: string; marca?: string; cantidad: number; createdAt: string }> = {}
    const lista = venta.detalleVenta ?? []
    for (const d of lista) {
      map[d.id] = { producto: d.producto, marca: d.marca, cantidad: d.cantidad, createdAt: d.createdAt }
    }
    return map
  }, [venta.detalleVenta])

  // Estado editable de los detalles (sin productoId al inicio; lo resolvemos cuando cargan productos)
  const [detalles, setDetalles] = React.useState<DetalleForm[]>(() =>
    (venta.detalleVenta ?? []).map((d) => ({
      id: d.id,
      productoId: undefined, // lo setea useEffect cuando haya productos
      producto: d.producto,
      marca: d.marca,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
    }))
  )

  React.useEffect(() => {
    if (!productos.length) return
    setDetalles((prev) =>
      prev.map((d) => {
        if (d.productoId) return d
        const match = productos.find((p: any) => p.nombre === d.producto && (!d.marca || p.marca === d.marca))
        return match ? { ...d, productoId: match.id } : d
      })
    )
  }, [productos])

  const updateDetalle = (idx: number, patch: Partial<DetalleForm>) =>
    setDetalles((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)))

  const onChangeProducto = (idx: number, productoId: string) => {
    const p = productos.find((x: any) => x.id === productoId)
    updateDetalle(idx, {
      productoId,
      producto: p?.nombre ?? '',
      marca: p?.marca ?? '',
      precioUnitario: p?.precio ?? 0, // autocompleta precio
    })
  }

  const addDetalle = () =>
    setDetalles((prev) => [
      ...prev,
      { id: undefined, productoId: undefined, producto: '', marca: '', cantidad: 1, precioUnitario: 0 },
    ])

  const removeDetalle = (idx: number) => setDetalles((prev) => prev.filter((_, i) => i !== idx))

  const total = detalles.reduce((acc, d) => acc + (Number(d.cantidad) * Number(d.precioUnitario) || 0), 0)

  const isValid = () => {
    if (!usuarioId) return false
    if (!detalles.length) return false
    return detalles.every((d) => d.productoId && d.producto && d.cantidad > 0 && d.precioUnitario >= 0)
  }

  const maxForDetalle = (detalle: DetalleForm): number | undefined => {
    if (!detalle.productoId) return undefined
    const p = productos.find((x: any) => x.id === detalle.productoId)
    if (!p) return undefined
    const prev = detalle.id ? originalById[detalle.id] : undefined
    const esMismoProducto = prev && prev.producto === detalle.producto && prev.marca === detalle.marca
    const base = typeof p.stock === 'number' ? p.stock : undefined
    if (base == null) return undefined
    return esMismoProducto ? base + (prev?.cantidad ?? 0) : base
  }

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault()
    if (!isValid()) return

    const now = new Date().toISOString()

    const detalleVenta: DetalleVentaEntity[] = detalles.map((d) => {
      const cantidad = Number(d.cantidad) || 0
      const precio = Number(d.precioUnitario) || 0
      const original = d.id ? originalById[d.id] : undefined
      return {
        id: d.id ?? nanoid(8),
        ventaId: venta.id,
        producto: d.producto,
        cantidad,
        precioUnitario: precio,
        subtotal: cantidad * precio,
        createdAt: original?.createdAt ?? now,
        updatedAt: now,
        marca: d.marca || undefined,
        // productoId solo para UI; no lo persistimos si tu backend no lo necesita
        productoId: d.productoId,
      }
    })

    const updated: VentaEntity = {
      ...venta,
      fecha: new Date(fecha).toISOString(),
      usuarioId,
      updatedAt: now,
      detalleVenta,
      total: detalleVenta.reduce((acc, d) => acc + d.subtotal, 0),
    }

    const prev = (qc.getQueryData(['ventas']) as VentaEntity[] | undefined) ?? []
    const next = prev.some((v) => v.id === updated.id)
      ? prev.map((v) => (v.id === updated.id ? updated : v))
      : [updated, ...prev]
    qc.setQueryData(['ventas'], next)

    onCancel?.()
  }

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-xl bg-white shadow-xl ring-1 ring-black/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">Editar Venta</h3>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Datos de la venta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">Fecha</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="border rounded-md px-3 py-2"
                required
              />
            </label>

            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-sm font-medium text-gray-700">Usuario</span>
              <select
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                className="border rounded-md px-3 py-2"
                required
              >
                <option value="" disabled>
                  {loadingUsuarios ? 'Cargando usuarios...' : 'Seleccione un usuario'}
                </option>
                {usuarios.map((u: any) => (
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
              <button
                type="button"
                onClick={addDetalle}
                className="text-sm rounded-md bg-blue-600 text-white px-3 py-1 hover:bg-blue-700"
              >
                + Agregar ítem
              </button>
            </div>

            {detalles.map((d, idx) => {
              const subtotal = (Number(d.cantidad) || 0) * (Number(d.precioUnitario) || 0)
              const maxQty = maxForDetalle(d)

              return (
                <div key={d.id ?? `nuevo-${idx}`} className="grid grid-cols-1 sm:grid-cols-12 gap-3 border rounded-lg p-3">
                  {/* Producto */}
                  <label className="flex flex-col gap-1 sm:col-span-5">
                    <span className="text-sm text-gray-700">Producto</span>
                    <select
                      value={d.productoId ?? ''}
                      onChange={(e) => onChangeProducto(idx, e.target.value)}
                      className="border rounded-md px-3 py-2"
                      required
                    >
                      <option value="" disabled>
                        {loadingProductos ? 'Cargando productos...' : 'Seleccione un producto'}
                      </option>
                      {productos.map((p: any) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.marca}) — {currency(p.precio)} | stock: {p.stock}
                        </option>
                      ))}
                    </select>
                  </label>

                  {/* Cantidad (valida contra stock si hay producto seleccionado) */}
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-sm text-gray-700">Cantidad</span>
                    <input
                      type="number"
                      min={1}
                      max={maxQty ?? undefined}
                      value={d.cantidad}
                      onChange={(e) => updateDetalle(idx, { cantidad: Number(e.target.value) })}
                      className="border rounded-md px-3 py-2"
                      required
                    />
                    {typeof maxQty === 'number' && (
                      <span className="text-[11px] text-gray-500">Máx: {maxQty}</span>
                    )}
                  </label>

                  {/* Precio unitario (autocompletado; editable por promo) */}
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-sm text-gray-700">Precio unit.</span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={d.precioUnitario}
                      onChange={(e) => updateDetalle(idx, { precioUnitario: Number(e.target.value) })}
                      className="border rounded-md px-3 py-2"
                      required
                    />
                  </label>

                  {/* Subtotal */}
                  <div className="flex flex-col gap-1 sm:col-span-3">
                    <span className="text-sm text-gray-700">Subtotal</span>
                    <div className="h-[38px] flex items-center px-3 py-2 rounded-md border bg-gray-50">
                      {currency(subtotal)}
                    </div>
                  </div>

                  {/* Quitar */}
                  <div className="sm:col-span-12 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeDetalle(idx)}
                      className="text-sm text-red-600 hover:text-red-700"
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
              <button type="button" onClick={onCancel} className="rounded-md border px-4 py-2 hover:bg-gray-50">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValid()}
                className="rounded-md bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:opacity-60"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
