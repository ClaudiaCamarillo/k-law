export type Categoria = 
  | "federales"
  | "fiscal"
  | "mercantil"
  | "familiar"
  | "administrativo"
  | "penal"
  | "laboral"
  | "civil";

export interface Articulo {
  numero: string;
  texto: string;
  tituloCapitulo: string;
  esTransitorio?: boolean;
  notasReforma?: string[];
  fechaReforma?: Date;
}

export interface Ley {
  id: string;
  nombre: string;
  categoria: Categoria;
  fechaUltimaReforma: Date | string;
  articulos: Articulo[];
}