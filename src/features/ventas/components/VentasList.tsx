import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetVentas } from '../hooks/use-ventas'
import type { VentaEntity } from '../types/ventas.types'

type Props = {
  startDate?: string | null
  endDate?: string | null
  onEdit?: (venta: VentaEntity) => void
}

const currency = (v: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v)

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))

export default function VentasList({ startDate, endDate, onEdit }: Props) {
  const { data = [], isLoading } = useGetVentas()
  const qc = useQueryClient()

  const filtered = React.useMemo(() => {
    if (!startDate && !endDate) return data
    const s = startDate ? new Date(startDate) : null
    const e = endDate ? new Date(endDate) : null
    return data.filter(v => {
      const f = new Date(v.fecha)
      return (!s || f >= s) && (!e || f <= e)
    })
  }, [data, startDate, endDate])

  const onDelete = (id: string) => {
    if (!confirm('¿Eliminar esta venta?')) return
    qc.setQueryData(['ventas'], (prev: VentaEntity[] | undefined) =>
      (prev ?? []).filter(v => v.id !== id)
    )
  }

  if (isLoading) return <div className="mt-6 text-gray-600">Cargando ventas…</div>
  if (!filtered.length) return <div className="mt-6 text-gray-600">No hay ventas en este rango.</div>

  return (
    <div className="mt-6 space-y-4">
      {filtered
        .slice()
        .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
        .map((venta) => {
          const det = venta.detalleVenta[0] // demo: 1er ítem
          return (
            <article
              key={venta.id}
              className="rounded-2xl border shadow-sm bg-white/80"
            >
              {/* Header de la tarjeta */}
              <div className="flex items-start justify-between px-6 pt-5">
                <div>
                  <h3 className="text-lg font-semibold">Venta #{venta.id.padStart(3, '0')}</h3>
                  <p className="text-sm text-gray-600">{formatDate(venta.fecha)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit?.(venta)}
                    className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(venta.id)}
                    className="rounded-md border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>

                  <div className="ml-2 text-right">
                    <div className="text-2xl font-semibold text-emerald-700">
                      {currency(venta.total ?? 0)}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-gray-500">
                      Total
                    </div>
                  </div>
                </div>
              </div>

              {/* Línea del producto (sin imagen) */}
              <div className="mx-4 mt-4 rounded-xl border bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{det?.producto}</div>
                    {det?.marca && <div className="text-sm text-gray-600">{det.marca}</div>}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {det?.cantidad} x {currency(det?.precioUnitario ?? 0)}
                    </div>
                    <div className="text-xs text-gray-500">Cantidad x Precio</div>
                  </div>
                </div>
              </div>

              <div className="h-4" />
            </article>
          )
        })}
    </div>
  )
}
