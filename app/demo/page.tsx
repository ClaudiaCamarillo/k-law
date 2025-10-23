'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoAccess() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (code === 'PRUEBA2024') {
      // Activar modo demo
      const response = await fetch('/api/activate-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      
      if (response.ok) {
        router.push('/calculadoras')
      } else {
        setError('Código inválido')
      }
    } else {
      setError('Código incorrecto. Contacta al administrador.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acceso de Prueba - K-LAW
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa el código de acceso proporcionado
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Código de Acceso
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ingresa tu código"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Activar Prueba Gratuita (7 días)
          </button>
        </form>
        <p className="text-center text-xs text-gray-500">
          El acceso de prueba expira automáticamente después de 7 días
        </p>
      </div>
    </div>
  )
}
