export default function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Página de Prueba</h1>
      <p>Si puedes ver esto, el servidor está funcionando correctamente.</p>
      <p>Fecha: {new Date().toLocaleString()}</p>
    </div>
  )
}