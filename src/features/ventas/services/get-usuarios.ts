export type Usuario = { id: string; nombre: string }

export async function getUsuariosService(): Promise<Usuario[]> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: 'u1', nombre: 'María López' },
          { id: 'u2', nombre: 'Juan Pérez' },
          { id: 'u3', nombre: 'Ana García' },
        ]),
      300,
    ),
  )
}
