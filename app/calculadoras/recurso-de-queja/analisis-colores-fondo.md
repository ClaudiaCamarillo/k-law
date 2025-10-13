# Análisis de Colores de Fondo en Calculadoras de Recursos

## Resumen de Hallazgos

He revisado los archivos de las calculadoras de **Recurso de Queja** y **Recurso de Reclamación** para identificar cómo se aplican los colores de fondo cuando se muestra si el recurso es oportuno o extemporáneo.

## 1. Recurso de Queja (`/app/calculadoras/recurso-de-queja/page.tsx`)

### Ubicación del código (línea 1919):
```jsx
<div style={{ 
  padding: '1.5rem', 
  borderRadius: '8px', 
  marginBottom: '1rem', 
  background: resultado.esOportuno ? 
    'linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%)' : 
    'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', 
  border: `1.5px solid ${resultado.esOportuno ? '#C5A770' : '#dc2626'}` 
}}>
```

### Colores aplicados:
- **OPORTUNA (Verde)**: 
  - Fondo: `linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%)` (degradado verde claro)
  - Borde: `#C5A770` (dorado/beige)
  - Texto: `#16a34a` (verde)

- **EXTEMPORÁNEA (Rojo)**: 
  - Fondo: `linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)` (degradado rojo claro)
  - Borde: `#dc2626` (rojo)
  - Texto: `#dc2626` (rojo)

## 2. Recurso de Reclamación (`/app/calculadoras/recurso-de-reclamacion/page.tsx`)

### Ubicación del código (líneas 2155-2161):
```jsx
<div style={{ 
  padding: '1.5rem', 
  borderRadius: '8px', 
  marginBottom: '1rem', 
  background: resultado.esOportuno ? 
    'linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%)' : 
    'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', 
  border: `1.5px solid ${resultado.esOportuno ? '#C5A770' : '#dc2626'}` 
}}>
```

### Colores aplicados:
**Los colores son idénticos a los del Recurso de Queja:**
- **OPORTUNA (Verde)**: 
  - Fondo: `linear-gradient(135deg, #f0fdf4 0%, #e6f7ed 100%)` (degradado verde claro)
  - Borde: `#C5A770` (dorado/beige)
  - Texto: `#16a34a` (verde)

- **EXTEMPORÁNEA (Rojo)**: 
  - Fondo: `linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)` (degradado rojo claro)
  - Borde: `#dc2626` (rojo)
  - Texto: `#dc2626` (rojo)

## 3. Estructura HTML/JSX

En ambas calculadoras, la estructura es similar:

```jsx
<div style={{ /* estilos del contenedor con fondo y borde condicional */ }}>
  {tipoUsuario === 'servidor' ? (
    <p style={{ /* estilos del párrafo */ }}>
      El recurso se presentó de forma: {' '}
      <span style={{ color: resultado.esOportuno ? '#16a34a' : '#dc2626' }}>
        {resultado.esOportuno ? 'OPORTUNA' : 'EXTEMPORÁNEA'}
      </span>
    </p>
  ) : (
    // Vista para litigantes con información adicional
  )}
</div>
```

## 4. Detalles Técnicos

- **Condición**: Se usa `resultado.esOportuno` (booleano) para determinar los colores
- **Gradientes**: Ambos fondos usan gradientes lineales de 135 grados
- **Consistencia**: Ambas calculadoras usan exactamente los mismos colores y estilos
- **Accesibilidad**: Los colores verde (#16a34a) y rojo (#dc2626) proporcionan buen contraste

## 5. Paleta de Colores Completa

### Para estado OPORTUNO:
- Fondo inicio: `#f0fdf4`
- Fondo fin: `#e6f7ed`
- Borde: `#C5A770`
- Texto: `#16a34a`

### Para estado EXTEMPORÁNEO:
- Fondo inicio: `#fef2f2`
- Fondo fin: `#fee2e2`
- Borde: `#dc2626`
- Texto: `#dc2626`