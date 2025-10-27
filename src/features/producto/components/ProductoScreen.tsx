// src/features/producto/components/ProductoScreen.tsx
import { useState } from 'react'
import { FormMarca } from '@/features/marca'
import { FormLinea } from '@/features/linea'
import { useProductContext } from '../hook/productos'

export default function ProductoScreen() {
  const { data, isLoading, isError } = useProductContext()
  const products = data?.items || [] //Extrae la lista de productos
  // const emptyTable = data?.items.length === 0
  const [mostrarFormMarca, setMostrarFormMarca] = useState(false)
  const [mostrarFormLinea,  setMostrarFormLinea] = useState(false)

  if (isLoading) {
    return <div className="p-8">Cargando productos...</div>
  }

  if (isError) {
    return <div className="p-8 text-red-600">Error al cargar los productos.</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Gestión de Producto</h1>

      {/* Botón para mostrar/ocultar Formulario de Marca */}
      <button
        onClick={() => setMostrarFormMarca((prev) => !prev)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
      >
        {mostrarFormMarca ? 'Ocultar Formulario de Marca' : 'Mostrar Formulario de Marca'}
      </button>

      {/* Botón para mostrar Formulario de Línea */}
      <button
        onClick={() => setMostrarFormLinea((prev) => !prev)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {mostrarFormLinea ? 'Ocultar Formulario de Línea' : 'Mostrar Formulario de Línea'}
      </button>

      {/* Formulario de Marca */}
      {mostrarFormMarca && (
        <div className="mt-6">
          <FormMarca
            onCancel={() => setMostrarFormMarca(false)}
            onSuccess={(marca) => {
              console.log('Marca creada:', marca)
              setMostrarFormMarca(false)
            }}
          />
        </div>
      )}

      {/* Formulario de Línea */}
      {mostrarFormLinea && (
        <div className="mt-6">
          <FormLinea
            onCancel={() => setMostrarFormLinea(false)}
            onSuccess={(linea) => {
              console.log('Línea creada:', linea)
              setMostrarFormLinea(false)
            }}
          />
        </div>
      )}

      {/* 4. Mostrar la Tabla o Lista de Productos */}
      <h2 className="text-xl font-bold mt-8 mb-4">Lista de Productos ({products.length})</h2>
      
      {products.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Línea</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.nombre + product.marca}> {/* Usar un identificador único real si existe */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.marca}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.linea}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.precio.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No se encontraron productos.</p>
      )}
      
    </div>
  )
}

