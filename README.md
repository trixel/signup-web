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
| `COBRU_API_KEY` | API key de Cobru | — |
| `COBRU_REFRESH_TOKEN` | Refresh token de Cobru | — |
| `COBRU_API_URL` | API sandbox Cobru | `https://dev.cobru.co` |
| `COBRU_PROD_URL` | API producción (categorías) | `https://prod.cobru.co` |
| `COBRU_BRAND` | Identificador whitelabel | `TRIXEL` |
| `COBRU_HASH_KEY` | Clave HMAC para subida de archivos | valor por defecto de Cobru |

La subida de archivos usa siempre `{COBRU_API_URL}/base/upload_file/` (sin variable aparte).

## Deploy en Vercel

En Vercel **no** se usa `.env.local`. Configura las variables en:

**Project → Settings → Environment Variables**

Variables obligatorias:

- `COBRU_API_KEY`
- `COBRU_REFRESH_TOKEN`

Recomendadas para producción:

- `COBRU_API_URL` → URL base del ambiente Cobru (sandbox o producción)
- `COBRU_PROD_URL` → `https://prod.cobru.co`
- `COBRU_BRAND` → `TRIXEL`

Si tenías `COBRU_UPLOAD_URL` en Vercel, elimínala: ya no se usa.

Después de guardarlas, haz **Redeploy** del proyecto para que tomen efecto.

## Flujo de documentos

1. El usuario selecciona archivos en el navegador
2. Se envían a `POST /api/upload`
3. El servidor los sube a Cobru en `{COBRU_API_URL}/base/upload_file/`
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
