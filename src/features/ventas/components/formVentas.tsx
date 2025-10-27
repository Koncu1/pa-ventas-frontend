// src/routes/ventas.tsx (o formVentas.tsx)
import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/button'
import { GlobalHeader } from '@/components/global-header'
import { IconBox } from '@/components/icons/icon-box'
import { IconChart } from '@/components/icons/icon-chart'
import { PageHeader } from '@/components/page-header'
import { Wrapper } from '@/components/wrapper'
import Filters from '@/features/dashboard/components/filters'
import { AddVentaModal, VentasList, EditVentaPage } from '@/features/ventas'
import type { VentaEntity } from '@/features/ventas/types/ventas.types'
import { ProductProvider } from '@/features/producto/hook/productos'

export const Route = createFileRoute('/ventas')({ component: Ventas })

export default function Ventas() {
  const [openAdd, setOpenAdd] = React.useState(false)
  const [start, setStart] = React.useState<string | null>(null)
  const [end, setEnd] = React.useState<string | null>(null)
  const [editing, setEditing] = React.useState<VentaEntity | null>(null)

  return (
    <Wrapper
      globalHeader={
        <GlobalHeader title="SalesManager">
          <Button><IconBox width={16} /> Productos</Button>
          <Button variant="outline"><IconChart width={16} /> Ventas</Button>
        </GlobalHeader>
      }
    >
      <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <PageHeader title="Gestión de ventas" description="Resumen general de productos y ventas" />
        <Button onClick={() => setOpenAdd(true)} className="bg-emerald-600 text-white hover:bg-emerald-700">
          +Agregar Venta
        </Button>
      </div>

      <Filters onApply={({ start, end }: { start?: string|null; end?: string|null }) => {
        setStart(start ?? null)
        setEnd(end ?? null)
      }}/>

      <VentasList startDate={start} endDate={end} onEdit={(venta) => setEditing(venta)} />

      {/* Modal alta*/}
      {openAdd && (
        <ProductProvider>
          <AddVentaModal open={true} onClose={() => setOpenAdd(false)} />
        </ProductProvider>
      )}

      {/* Modal edición */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute inset-0 overflow-y-auto px-4 py-10">
            <EditVentaPage venta={editing} onCancel={() => setEditing(null)} />
          </div>
        </div>
      )}
    </Wrapper>
  )
}
