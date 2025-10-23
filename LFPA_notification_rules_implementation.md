# LFPA Notification Rules Implementation Summary

## Changes Made

### 1. Created Type Interface
Added a TypeScript interface `ReglaNotificacion` to ensure type safety for notification rules:
```typescript
interface ReglaNotificacion {
  articulo: string;
  textoSurte: string;
  surteEfectos: 'mismo_dia' | 'dia_siguiente' | 'tercer_dia';
  fundamento: string;
}
```

### 2. Created Helper Function
Created `obtenerReglaNotificacionLFPA()` function that returns the appropriate notification rule based on the notification form:

```typescript
function obtenerReglaNotificacionLFPA(formaNotificacion: string): ReglaNotificacion
```

This function contains all 9 notification types for LFPA:
- personal - Art. 35, fracción I - same day - Art. 38 LFPA
- correo_certificado_acuse - Art. 35, fracción II - next day - Art. 321 CFPC (supletorio)
- mensajeria_acuse - Art. 35, fracción III - next day - Art. 321 CFPC (supletorio)
- estrados - next day - Art. 321 CFPC (supletorio)
- edictos - Art. 35, fracción III - next day after last publication - Art. 321 CFPC (supletorio)
- medios_electronicos - Art. 35, fracciones II y III - next day - Art. 321 CFPC (supletorio)
- oficio - Art. 35, fracción II - next day - Art. 321 CFPC (supletorio)
- correo_ordinario - Art. 35, fracción III - next day - Art. 321 CFPC (supletorio)
- telegrama - Art. 35, fracción III - next day - Art. 321 CFPC (supletorio)

### 3. Updated Notification Logic
Modified the main calculation logic in the `calcular()` function to handle LFPA notifications:

```typescript
} else if (formData.leyNotificacion === 'Ley Federal de Procedimiento Administrativo') {
  // Reglas específicas de la LFPA
  const reglaLFPA = obtenerReglaNotificacionLFPA(formData.formaNotificacion);
  
  if (reglaLFPA.surteEfectos === 'mismo_dia') {
    fechaSurte = new Date(fechaNotif);
  } else {
    fechaSurte = siguienteDiaHabil(fechaNotif, diasAdicionales, tipoUsuario);
  }
  
  textoSurte = reglaLFPA.textoSurte;
  fundamentoSurte = reglaLFPA.fundamento;
}
```

### 4. Existing UI Elements
The notification form options for LFPA were already correctly configured in the UI (lines 3595-3606).

## Key Features

1. **Proper Legal References**: Each notification type includes the correct article reference and legal foundation
2. **Supletory Law References**: For most notification types, the system correctly references Article 321 of the Código Federal de Procedimientos Civiles as applicable through Article 2 of LFPA
3. **Personal Notification Exception**: Personal notifications take effect the same day (Article 38 LFPA), while all others take effect the next day
4. **Type Safety**: TypeScript interface ensures consistent structure for notification rules
5. **Clean Code**: Refactored to use a helper function instead of a large switch statement

## Testing

To test the implementation:
1. Select "Ley Federal de Procedimiento Administrativo" as the notification law
2. Try each notification type (personal, correo certificado, etc.)
3. Verify that:
   - Personal notifications show "el día en que hubieren sido realizadas" with Art. 38 LFPA
   - All other notifications show "al día siguiente" with the correct supletory law reference
   - The calculation correctly applies the rules to determine when the notification takes effect