# Guía de Deployment - Pastry Shop Admin

## Configuración de Entornos

La aplicación está configurada para manejar automáticamente diferentes entornos (desarrollo y producción) basándose en el hostname.

### 🔧 Configuración Automática

La aplicación detecta automáticamente el entorno:

- **Desarrollo**: `localhost` o `127.0.0.1` → usa `http://localhost:8080`
- **Producción**: cualquier otro dominio → usa `https://api.tudominio.com`

### 📝 Configuración Manual

Para cambiar la URL del backend en producción, edita el archivo `js/config.js`:

```javascript
const environments = {
    development: {
        api: {
            baseURL: 'http://localhost:8080',
        }
    },
    production: {
        api: {
            baseURL: 'https://api.tudominio.com', // ← Cambiar aquí
        }
    }
};
```

### 🌐 Ejemplos de URLs de Producción

```javascript
// Ejemplo 1: Backend en subdominio
baseURL: 'https://api.mipasteleria.com'

// Ejemplo 2: Backend en puerto específico
baseURL: 'https://mipasteleria.com:8080'

// Ejemplo 3: Backend en path específico
baseURL: 'https://mipasteleria.com/api'
```

### 🖼️ Manejo de Imágenes

Las imágenes se manejan automáticamente:

- **Desarrollo**: `http://localhost:8080/uploads/products/5/image.jpg`
- **Producción**: `https://api.tudominio.com/uploads/products/5/image.jpg`

### 🚀 Pasos para Deploy

1. **Actualizar configuración**:
   ```javascript
   // En js/config.js, línea 16
   baseURL: 'https://tu-dominio-backend.com'
   ```

2. **Verificar CORS**:
   - El backend debe permitir requests desde tu dominio frontend
   - Configurar headers CORS apropiados

3. **Verificar rutas de imágenes**:
   - El backend debe servir archivos estáticos desde `/uploads/products/`
   - Verificar permisos de lectura de archivos

4. **Testing**:
   - Probar login/logout
   - Probar subida de imágenes
   - Probar CRUD de productos

### 🔍 Debugging

Para verificar la configuración actual, abre la consola del navegador y ejecuta:

```javascript
// Ver configuración actual
import { logEnvironment } from './js/config.js';
logEnvironment();
```

### 📋 Checklist de Deploy

- [ ] URL del backend actualizada en `js/config.js`
- [ ] CORS configurado en el backend
- [ ] Rutas de imágenes funcionando
- [ ] HTTPS configurado (recomendado para producción)
- [ ] Certificados SSL válidos
- [ ] Testing completo en ambiente de producción

### 🛠️ Variables de Entorno (Alternativa)

Si prefieres usar variables de entorno, puedes modificar `js/config.js`:

```javascript
// Detectar variables de entorno
const apiBaseUrl = process.env.REACT_APP_API_URL || 
                  (isDevelopment ? 'http://localhost:8080' : 'https://api.tudominio.com');
```

**Nota**: Para usar variables de entorno en el frontend, necesitarás un bundler como Webpack o Vite.
