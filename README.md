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
| `COBRU_UPLOAD_URL` | Endpoint de subida (opcional) | `{COBRU_API_URL}/base/upload_file/` |

> No uses la ruta legacy `/upload/` — devuelve 404. Si ya la tienes en Vercel, bórrala o deja que el código use el default.

## Deploy en Vercel

En Vercel **no** se usa `.env.local`. Configura las variables en:

**Project → Settings → Environment Variables**

Variables obligatorias:

- `COBRU_API_KEY`
- `COBRU_REFRESH_TOKEN`

Recomendadas para producción:

- `COBRU_API_URL` → `https://prod.cobru.co` (o el ambiente que te indique Cobru)
- `COBRU_PROD_URL` → `https://prod.cobru.co`
- `COBRU_BRAND` → `TRIXEL`
- `COBRU_UPLOAD_URL` → URL de upload de Cobru en producción

Después de guardarlas, haz **Redeploy** del proyecto para que tomen efecto.

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
