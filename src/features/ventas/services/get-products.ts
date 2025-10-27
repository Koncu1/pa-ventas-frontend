export type Producto = {
  id: string
  nombre: string
  marca: string
  precio: number
  stock: number
}

export async function getProductosService(): Promise<Producto[]> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: 'p1', nombre: 'Smartphone Pro', marca: 'Samsung', precio: 1299, stock: 12 },
          { id: 'p2', nombre: 'Notebook Air 13"', marca: 'Apple', precio: 1899, stock: 6 },
          { id: 'p3', nombre: 'TV 55"', marca: 'LG', precio: 999, stock: 20 },
        ]),
      300,
    ),
  )
}