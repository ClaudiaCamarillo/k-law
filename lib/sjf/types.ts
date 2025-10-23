export interface Tesis {
  id: string
  registro_digital: string
  rubro: string
  texto: string
  tipo: 'jurisprudencia' | 'aislada'
  epoca: string
  materia: string
  fuente: string
  numero_tesis?: string
  precedentes?: Precedente[]
  fecha_publicacion?: string
  sala?: string
  instancia?: string
}

export interface Precedente {
  numero_expediente: string
  fecha: string
  descripcion: string
}

export interface BusquedaParams {
  texto: string
  materia?: string
  tipo?: 'jurisprudencia' | 'aislada' | 'todas'
  epoca?: string
  año?: string
  pagina?: number
  limite?: number
}

export interface ResultadoBusqueda {
  tesis: Tesis[]
  total: number
  pagina: number
  total_paginas: number
}

export interface ErrorSJF {
  codigo: string
  mensaje: string
  detalles?: string
}

export interface CacheEntry {
  data: ResultadoBusqueda
  timestamp: number
  query: string
}

export type Materia = 
  | 'amparo'
  | 'civil'
  | 'penal'
  | 'administrativo'
  | 'laboral'
  | 'fiscal'
  | 'mercantil'
  | 'familiar'
  | 'constitucional'

export type Epoca = 
  | 'quinta'
  | 'decima'
  | 'novena'
  | 'octava'
  | 'septima'