# Trixel — Landing de registro

Landing page profesional de registro para **Trixel**, integrada con la API [Cobru Whitelabel](https://docs.cobru.co/es/docs/guides/whitelabel).

## Características

- Landing page con hero, beneficios y flujo de registro en 4 pasos
- Formulario multi-paso: datos personales → documentos → cuenta → verificación
- Carga de documentos desde el frontend (drag & drop)
- Proxy API para evitar CORS y proteger configuración
- Verificación de correo y teléfono con códigos OTP
- Integración con categorías/subcategorías de Cobru

## Inicio rápido

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `COBRU_API_URL` | API sandbox Cobru | `https://dev.cobru.co` |
| `COBRU_PROD_URL` | API producción (categorías) | `https://prod.cobru.co` |
| `COBRU_BRAND` | Identificador whitelabel | `TRIXEL` |
| `COBRU_UPLOAD_URL` | Endpoint de subida de archivos | `https://dev.cobru.co/upload/` |

> Confirma con tu equipo Cobru el valor de `COBRU_BRAND`, los IDs de documentos y el endpoint de upload vigente antes de producción.

## Flujo de documentos

1. El usuario selecciona archivos en el navegador
2. Se envían a `POST /api/upload`
3. El servidor intenta subirlos a Cobru; si falla, los almacena localmente en `public/uploads/`
4. Las URLs resultantes se incluyen en el payload de registro (`documents` y `profile_picture`)

## Endpoints API internos

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/categories` | GET | Lista categorías Cobru |
| `/api/subcategories?category_id=` | GET | Subcategorías por categoría |
| `/api/upload` | POST | Sube archivo (multipart) |
| `/api/register` | POST | Crea usuario en Cobru |
| `/api/confirmation` | POST | Solicita códigos OTP |
| `/api/verify` | POST | Verifica email o teléfono |

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
