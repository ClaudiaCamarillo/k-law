'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

interface Tesis {
  id: number
  registro_digital: number
  clave_tesis: string
  tipo: string
  rubro: string
  texto: string
  materia: string
  instancia: string
  epoca: string
  nota: string | null
  precedentes: string
}

interface SearchTerm {
  value: string
  exact: boolean
}

export default function JurisprudenciaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Tesis[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedTesis, setSelectedTesis] = useState<number | null>(null)
  const [copiadoId, setCopiadoId] = useState<number | null>(null)

  const [searchIn, setSearchIn] = useState({ rubro: true, texto: true })
  const [tipoTesis, setTipoTesis] = useState('todas')
  const [epocas, setEpocas] = useState({ '9a': false, '10a': false, '11a': true, '12a': true })
  const [instancia, setInstancia] = useState('todas')
  const [showFilters, setShowFilters] = useState(true)

  const instancias = [
    'todas',
    'Pleno',
    'Primera Sala',
    'Segunda Sala',
    'Tribunales Colegiados de Circuito',
    'Plenos de Circuito',
    'Plenos Regionales'
  ]

  const parseSearchTerms = (input: string) => {
    const include: SearchTerm[] = []
    const exclude: string[] = []

    const exactPhrases = input.match(/"[^"]+"/g) || []
    exactPhrases.forEach(phrase => {
      include.push({ value: phrase.replace(/"/g, ''), exact: true })
    })

    let remaining = input
    exactPhrases.forEach(phrase => {
      remaining = remaining.replace(phrase, '')
    })

    const words = remaining.trim().split(/\s+/).filter(w => w)

    words.forEach(word => {
      if (word.startsWith('-')) {
        exclude.push(word.substring(1).replace(/\*/g, ''))
      } else if (word.includes('*')) {
        include.push({ value: word.replace(/\*/g, ''), exact: false })
      } else if (word) {
        include.push({ value: word, exact: true })
      }
    })

    return { include, exclude }
  }

  const containsExactWord = (text: string, word: string): boolean => {
    if (!text) return false
    const regex = new RegExp(`(^|[\\s.,;:!?¿¡()\\[\\]"'-])${escapeRegex(word)}([\\s.,;:!?¿¡()\\[\\]"'-]|$)`, 'i')
    return regex.test(text)
  }

  const containsTerm = (text: string, term: string): boolean => {
    if (!text) return false
    return text.toLowerCase().includes(term.toLowerCase())
  }

  const escapeRegex = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // ========== FUNCIONES DE COPIAR Y DESCARGAR ==========
  
  const copiarTesis = async (tesis: Tesis) => {
    const contenido = `TESIS: ${tesis.clave_tesis || 'Sin clave'}
REGISTRO DIGITAL: ${tesis.registro_digital}

RUBRO:
${tesis.rubro}

TEXTO:
${tesis.texto}

TIPO: ${tesis.tipo || 'Sin tipo'}
MATERIA: ${tesis.materia || 'Sin materia'}
ÉPOCA: ${tesis.epoca || 'Sin época'}
INSTANCIA: ${tesis.instancia || 'Sin instancia'}
${tesis.precedentes ? `\nPRECEDENTES:\n${tesis.precedentes}` : ''}
${tesis.nota ? `\nNOTA: ${tesis.nota}` : ''}`

    try {
      await navigator.clipboard.writeText(contenido)
      setCopiadoId(tesis.id)
      setTimeout(() => setCopiadoId(null), 2000)
    } catch (err) {
      console.error('Error al copiar:', err)
    }
  }

  const descargarTesis = (tesis: Tesis) => {
    const contenido = `TESIS: ${tesis.clave_tesis || 'Sin clave'}
REGISTRO DIGITAL: ${tesis.registro_digital}

================================================================================
RUBRO:
================================================================================
${tesis.rubro}

================================================================================
TEXTO:
================================================================================
${tesis.texto}

================================================================================
DATOS DE IDENTIFICACIÓN:
================================================================================
TIPO: ${tesis.tipo || 'Sin tipo'}
MATERIA: ${tesis.materia || 'Sin materia'}
ÉPOCA: ${tesis.epoca || 'Sin época'}
INSTANCIA: ${tesis.instancia || 'Sin instancia'}
${tesis.precedentes ? `\nPRECEDENTES:\n${tesis.precedentes}` : ''}
${tesis.nota ? `\n⚠️ NOTA: ${tesis.nota}` : ''}

================================================================================
Descargado desde K-Law - ${new Date().toLocaleDateString('es-MX')}
================================================================================`

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tesis_${tesis.registro_digital}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ========== BÚSQUEDA ==========

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setSearched(true)
    setSelectedTesis(null)

    try {
      const searchTerms = parseSearchTerms(searchTerm)

      if (searchTerms.include.length === 0) {
        setResults([])
        setTotalCount(0)
        setLoading(false)
        return
      }

      let query = supabase.from('tesis').select('*')

      if (tipoTesis === 'jurisprudencia') {
        query = query.ilike('tipo', '%Jurisprudencia%')
      } else if (tipoTesis === 'aislada') {
        query = query.not('tipo', 'ilike', '%Jurisprudencia%')
      }

      const epocasActivas = Object.entries(epocas)
        .filter(([_, activa]) => activa)
        .map(([key]) => {
          const nombres: Record<string, string> = {
            '9a': 'Novena', '10a': 'Décima', '11a': 'Undécima', '12a': 'Duodécima'
          }
          return nombres[key]
        })

      if (epocasActivas.length > 0 && epocasActivas.length < 4) {
        const epocaConditions = epocasActivas.map(e => `epoca.ilike.%${e}%`)
        query = query.or(epocaConditions.join(','))
      }

      if (instancia !== 'todas') {
        query = query.ilike('instancia', `%${instancia}%`)
      }

      const searchValues = searchTerms.include.map(t => t.value)
      const orConditions: string[] = []
      searchValues.forEach(val => {
        if (searchIn.rubro) orConditions.push(`rubro.ilike.%${val}%`)
        if (searchIn.texto) orConditions.push(`texto.ilike.%${val}%`)
      })

      if (orConditions.length > 0) {
        query = query.or(orConditions.join(','))
      }

      const { data, error } = await query.limit(500)

      if (error) throw error

      let filteredData = data || []

      searchTerms.include.forEach(term => {
        filteredData = filteredData.filter(tesis => {
          let matchRubro = false
          let matchTexto = false

          if (searchIn.rubro) {
            if (term.exact) {
              matchRubro = containsExactWord(tesis.rubro, term.value)
            } else {
              matchRubro = containsTerm(tesis.rubro, term.value)
            }
          }

          if (searchIn.texto) {
            if (term.exact) {
              matchTexto = containsExactWord(tesis.texto, term.value)
            } else {
              matchTexto = containsTerm(tesis.texto, term.value)
            }
          }

          return matchRubro || matchTexto
        })
      })

      searchTerms.exclude.forEach(term => {
        filteredData = filteredData.filter(tesis =>
          !containsTerm(tesis.rubro, term) && !containsTerm(tesis.texto, term)
        )
      })

      setResults(filteredData.slice(0, 50))
      setTotalCount(filteredData.length)
    } catch (error) {
      console.error('Error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const toggleEpoca = (epoca: string) => {
    setEpocas(prev => ({ ...prev, [epoca]: !prev[epoca as keyof typeof prev] }))
  }

  const handleSelectTesis = (id: number) => {
    setSelectedTesis(selectedTesis === id ? null : id)
  }

  return (
    <div style={{ backgroundColor: '#F4EFE8', minHeight: '100vh', padding: '1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#1C1C1C', marginBottom: '0.5rem' }}>
          Búsqueda de Jurisprudencia
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#3D3D3D', fontSize: '0.9rem' }}>
          Base de datos K-Law - Semanario Judicial de la Federación
        </p>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button onClick={() => router.push('/calculadoras')} style={{
          background: 'none', border: '1px solid #C5A770', color: '#C5A770',
          padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', fontSize: '0.85rem'
        }}>
          ← Volver
        </button>
      </div>

      <div style={{
        backgroundColor: 'white', padding: '1.5rem', borderRadius: '20px',
        border: '2px solid #C5A770', maxWidth: '1000px', margin: '0 auto 1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Buscar palabra exacta, o use * para derivados (procede*), "comillas" para frase, -excluir'
            style={{
              flex: 1, padding: '0.85rem 1rem', borderRadius: '20px',
              border: '1px solid #C5A770', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem'
            }}
          />
          <button onClick={handleSearch} disabled={loading} style={{
            padding: '0.85rem 1.5rem', borderRadius: '20px', border: 'none',
            backgroundColor: '#1a365d', color: 'white', fontFamily: 'Inter, sans-serif',
            cursor: loading ? 'wait' : 'pointer', fontSize: '0.95rem', fontWeight: '500'
          }}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        <button onClick={() => setShowFilters(!showFilters)} style={{
          background: 'none', border: 'none', color: '#C5A770', cursor: 'pointer',
          fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', marginBottom: showFilters ? '1rem' : 0
        }}>
          {showFilters ? '▼ Ocultar filtros' : '▶ Mostrar filtros avanzados'}
        </button>

        {showFilters && (
          <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: '1rem', display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: '600', color: '#1C1C1C', display: 'block', marginBottom: '0.5rem' }}>
                Buscar en:
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={searchIn.rubro} onChange={() => setSearchIn(p => ({ ...p, rubro: !p.rubro }))} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>Rubro (título)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={searchIn.texto} onChange={() => setSearchIn(p => ({ ...p, texto: !p.texto }))} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>Texto</span>
                </label>
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: '600', color: '#1C1C1C', display: 'block', marginBottom: '0.5rem' }}>
                Tipo de tesis:
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {[{ value: 'todas', label: 'Todas' }, { value: 'jurisprudencia', label: 'Jurisprudencia' }, { value: 'aislada', label: 'Aislada' }].map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                    <input type="radio" name="tipoTesis" checked={tipoTesis === opt.value} onChange={() => setTipoTesis(opt.value)} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: '600', color: '#1C1C1C', display: 'block', marginBottom: '0.5rem' }}>
                Época:
              </label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[{ key: '9a', label: '9a Época' }, { key: '10a', label: '10a Época' }, { key: '11a', label: '11a Época' }, { key: '12a', label: '12a Época' }].map(ep => (
                  <label key={ep.key} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={epocas[ep.key as keyof typeof epocas]} onChange={() => toggleEpoca(ep.key)} />
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>{ep.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: '600', color: '#1C1C1C', display: 'block', marginBottom: '0.5rem' }}>
                Instancia:
              </label>
              <select value={instancia} onChange={(e) => setInstancia(e.target.value)} style={{
                padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #C5A770',
                fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', minWidth: '250px'
              }}>
                {instancias.map(inst => (
                  <option key={inst} value={inst}>{inst === 'todas' ? 'Todas las instancias' : inst}</option>
                ))}
              </select>
            </div>

            <div style={{ backgroundColor: '#F4EFE8', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif', color: '#666' }}>
              <strong>Ayuda:</strong><br />
              • <code>palabra</code> → busca palabra exacta<br />
              • <code>palabra*</code> → busca derivados (procedencia, procedente, etc.)<br />
              • <code>&quot;frase exacta&quot;</code> → busca la frase completa<br />
              • <code>-palabra</code> → excluye resultados con esa palabra
            </div>
          </div>
        )}
      </div>

      {searched && (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#3D3D3D', fontSize: '0.9rem', marginBottom: '1rem' }}>
            <strong>{totalCount}</strong> resultado(s) encontrado(s) {totalCount > 50 && '(mostrando 50)'}
            {selectedTesis && <span style={{ marginLeft: '1rem', color: '#1a365d' }}>• 1 tesis seleccionada</span>}
          </p>

          {results.map((tesis) => (
            <div 
              key={tesis.id} 
              onClick={() => handleSelectTesis(tesis.id)}
              style={{
                backgroundColor: selectedTesis === tesis.id ? '#EBF4FF' : 'white',
                padding: '1.25rem', 
                borderRadius: '12px',
                border: selectedTesis === tesis.id ? '2px solid #1a365d' : '1px solid #E0E0E0',
                marginBottom: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: tesis.tipo === 'Jurisprudencia' ? '#1a365d' : '#718096',
                  color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px',
                  fontSize: '0.7rem', fontFamily: 'Inter, sans-serif', fontWeight: '500'
                }}>
                  {tesis.tipo || 'Tesis'}
                </span>
                <span style={{
                  backgroundColor: '#F4EFE8', color: '#3D3D3D', padding: '0.2rem 0.6rem',
                  borderRadius: '12px', fontSize: '0.7rem', fontFamily: 'Inter, sans-serif'
                }}>
                  {tesis.materia || 'Sin materia'}
                </span>
                <span style={{
                  backgroundColor: '#E8F4F0', color: '#2D6A4F', padding: '0.2rem 0.6rem',
                  borderRadius: '12px', fontSize: '0.7rem', fontFamily: 'Inter, sans-serif'
                }}>
                  {tesis.epoca || 'Sin época'}
                </span>
                      </div>

              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#C5A770', marginBottom: '0.4rem', fontWeight: '500' }}>
                {tesis.clave_tesis || 'Sin clave'} | Registro: {tesis.registro_digital} | {tesis.instancia}
              </p>

              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: '#1C1C1C', marginBottom: '0.6rem', lineHeight: '1.4' }}>
                {tesis.rubro}
              </h3>

              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: '#4A4A4A', lineHeight: '1.5',
                overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                WebkitLineClamp: selectedTesis === tesis.id ? 999 : 3, 
                WebkitBoxOrient: 'vertical' as const
              }}>
                {tesis.texto}
              </p>

              {tesis.nota && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem', backgroundColor: '#FFF5F5', borderRadius: '8px', borderLeft: '3px solid #C53030' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#C53030', margin: 0 }}>
                    {tesis.nota}
                  </p>
                </div>
              )}

              {/* ========== BOTONES DE ACCIÓN ========== */}
              {selectedTesis === tesis.id && (
                <div style={{ 
                  display: 'flex', 
                  gap: '0.75rem', 
                  marginTop: '1rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid #E0E0E0' 
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copiarTesis(tesis)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: copiadoId === tesis.id ? '#38A169' : '#1a365d',
                      color: 'white',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {copiadoId === tesis.id ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      descargarTesis(tesis)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      border: '1px solid #1a365d',
                      backgroundColor: 'white',
                      color: '#1a365d',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    ⬇️ Descargar TXT
                  </button>
                </div>
              )}
            </div>
          ))}

          {results.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '2.5rem', backgroundColor: 'white', borderRadius: '12px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#666' }}>
                No se encontraron resultados. Intente con otros términos o ajuste los filtros.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
