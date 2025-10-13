export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F4EFE8' }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" style={{ borderColor: '#C5A770' }}></div>
        <p className="mt-4 text-sm" style={{ color: '#3D3D3D', fontFamily: 'Inter, sans-serif' }}>Cargando...</p>
      </div>
    </div>
  )
}