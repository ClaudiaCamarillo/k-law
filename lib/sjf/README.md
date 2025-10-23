# Módulo de Búsqueda de Jurisprudencia - SJF

Este módulo implementa la funcionalidad de búsqueda de jurisprudencia del Semanario Judicial de la Federación (SJF) para la aplicación K-LAW.

## 🏗️ Estructura del Módulo

```
lib/sjf/
├── api-client.ts      # Cliente para la API del SJF
├── types.ts           # Tipos TypeScript para jurisprudencia
├── cache.ts           # Sistema de cache offline
├── utils.ts           # Utilidades y helpers
└── README.md          # Documentación

app/jurisprudencia/
├── page.tsx           # Página principal de búsqueda
├── [id]/page.tsx      # Vista detalle de tesis
└── components/        # Componentes específicos (futura expansión)
```

## 🚀 Características Principales

### ✅ Implementado
- **Búsqueda de tesis** por texto, materia y tipo
- **Filtros avanzados** por época, materia y tipo de tesis
- **Cache offline** para mejorar rendimiento
- **Favoritos** con persistencia local
- **Copiar al portapapeles** texto completo de tesis
- **Compartir** tesis via Web Share API
- **Manejo robusto de errores** con mensajes amigables
- **Diseño consistente** con el resto de la aplicación
- **Responsive design** para todos los dispositivos

### 🔮 Futuras mejoras
- Búsqueda por precedentes relacionados
- Búsqueda por época específica
- Exportar tesis a PDF
- Historial de búsquedas
- Notificaciones push para nuevas tesis

## 📡 API del Cliente SJF (Bicentenario)

**🔗 API Base:** https://bicentenario.scjn.gob.mx

Esta implementación utiliza la API del Bicentenario de la SCJN que ofrece acceso a tesis, precedentes y votos en formato JSON.

### Clase `SJFApiClient`

```typescript
class SJFApiClient {
  // Búsqueda principal de tesis
  async buscar_tesis(
    texto: string, 
    materia: Materia = 'amparo', 
    tipo: 'jurisprudencia' | 'aislada' | 'todas' = 'jurisprudencia'
  ): Promise<ResultadoBusqueda>

  // Obtener tesis específica por ID
  async obtener_tesis_por_id(registro_digital: string): Promise<Tesis>

  // Búsqueda por época
  async buscar_por_epoca(epoca: Epoca, año?: string): Promise<ResultadoBusqueda>

  // Búsqueda de precedentes relacionados
  async buscar_precedentes_relacionados(num_expediente: string): Promise<Tesis[]>
}
```

### Ejemplo de uso

```typescript
import { sjfClient } from '@/lib/sjf/api-client'

// Búsqueda básica
const resultados = await sjfClient.buscar_tesis(
  'amparo directo',
  'amparo',
  'jurisprudencia'
)

// Obtener tesis específica
const tesis = await sjfClient.obtener_tesis_por_id('2023456')
```

## 💾 Sistema de Cache

### Clase `SJFCache`

El sistema de cache mejora la experiencia del usuario almacenando búsquedas recientes:

```typescript
import { sjfCache } from '@/lib/sjf/cache'

// Guardar resultado en cache
sjfCache.guardar('query-key', resultadoBusqueda)

// Obtener del cache
const cached = sjfCache.obtener('query-key')

// Limpiar cache expirado
sjfCache.limpiarExpiradas()
```

**Configuración del cache:**
- **Máximo de entradas:** 50 búsquedas
- **Tiempo de vida:** 30 minutos
- **Almacenamiento:** localStorage del navegador

## 🎨 Tipos de Datos

### Interfaz `Tesis`

```typescript
interface Tesis {
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
```

### Materias Disponibles

- Amparo
- Civil
- Penal
- Administrativo
- Laboral
- Fiscal
- Mercantil
- Familiar
- Constitucional

### Épocas Disponibles

- Décima Época
- Novena Época
- Octava Época
- Séptima Época
- Quinta Época

## 🛠️ Utilidades

### Funciones principales

```typescript
import { 
  validarTextoConsuita,
  truncarTexto,
  copiarAlPortapapeles,
  obtenerIconoMateria,
  formatearFecha
} from '@/lib/sjf/utils'

// Validar consulta
const { valido, error } = validarTextoConsuita(texto)

// Truncar texto para preview
const preview = truncarTexto(textoCompleto, 250)

// Copiar al portapapeles
const exito = await copiarAlPortapapeles(texto)
```

## 🚨 Manejo de Errores

El módulo incluye manejo robusto de errores:

### Tipos de errores

- **`TIMEOUT`**: Consulta tardó demasiado tiempo
- **`NETWORK_ERROR`**: Error de conexión a internet
- **`API_ERROR`**: Error general de la API

### Ejemplo de manejo

```typescript
try {
  const resultados = await sjfClient.buscar_tesis(consulta)
} catch (error) {
  const errorSJF = error as ErrorSJF
  console.error(`Error ${errorSJF.codigo}: ${errorSJF.mensaje}`)
}
```

## 🎯 Integración con la UI

### Navegación

El módulo se integra en la navegación principal mediante un botón en `/calculadoras`:

```tsx
<button onClick={() => router.push('/jurisprudencia')}>
  🏛️ Jurisprudencia
</button>
```

### Rutas

- **`/jurisprudencia`** - Página principal de búsqueda
- **`/jurisprudencia/[id]`** - Vista detalle de tesis específica

## 📱 Funcionalidades de Usuario

### Favoritos
- Almacenamiento local persistente
- Toggle rápido en resultados y vista detalle
- Indicadores visuales claros

### Copiar y Compartir
- **Copiar:** Texto completo con metadatos
- **Compartir:** Web Share API con fallback
- **Formato:** Optimizado para uso legal

### Búsqueda Inteligente
- **Validación:** Mínimo 3 caracteres, máximo 500
- **Cache:** Resultados recientes disponibles offline
- **Filtros:** Combinables para búsquedas específicas

## 🔧 Configuración

### Variables de entorno (futuro)

```env
# Opcional: URL personalizada de la API
NEXT_PUBLIC_SJF_API_URL=https://datos.scjn.gob.mx/api

# Opcional: Timeout personalizado (ms)
NEXT_PUBLIC_SJF_TIMEOUT=10000
```

## 📊 Rendimiento

### Optimizaciones implementadas

- **Cache local** para búsquedas recientes
- **Debounce** en campos de búsqueda (futuro)
- **Lazy loading** de resultados (futuro)
- **Compresión** de datos en cache

### Métricas esperadas

- **Tiempo de respuesta:** < 2 segundos promedio
- **Cache hit rate:** > 30% en uso regular
- **Tamaño de cache:** < 5MB en localStorage

## 🧪 Testing (futuro)

```bash
# Tests unitarios
npm test lib/sjf

# Tests de integración
npm test app/jurisprudencia

# Tests E2E
npm run e2e:jurisprudencia
```

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. **Extender tipos** en `types.ts`
2. **Agregar métodos** en `api-client.ts`
3. **Actualizar utilidades** en `utils.ts`
4. **Mantener consistencia** con el diseño existente

## 📚 Referencias

- [API del SJF](https://datos.scjn.gob.mx/)
- [Semanario Judicial de la Federación](https://sjf.scjn.gob.mx/)
- [Documentación de Next.js](https://nextjs.org/docs)

---

**Desarrollado para K-LAW** - Sistema integral de herramientas jurídicas