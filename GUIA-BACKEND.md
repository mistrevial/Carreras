# Guia Backend

## Archivos listos para publicar

Dentro de `backend/` ya quedaron:

- `.env.example`
- `Dockerfile`
- `.dockerignore`

## Inicio rapido local

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Variables importantes

En `backend/.env`:

```env
APP_NAME=Finish Line API
DATABASE_URL=sqlite:///./finishline.db
ADMIN_BOOTSTRAP_USERNAME=tu_usuario
ADMIN_BOOTSTRAP_PASSWORD=tu_clave_segura
SESSION_COOKIE_NAME=finishline_admin_session
USE_SECURE_COOKIES=true
ALLOW_ORIGINS=https://tudominio.com,https://www.tudominio.com
SEED_DEMO_DATA=false
```

## Que si puede venir del backend

Hoy el backend ya puede manejar:

- autenticacion admin
- carreras
- fotos
- compras
- reportes

## Que no esta automatizado todavia

La marca publica del frontend aun no se administra desde backend.

Hoy eso se cambia por archivos:

- `assets/brand/logo-mark.png`
- `assets/brand/favicon.png`

## Si, eso se puede programar

Si quieres, el siguiente paso puede ser crear una configuracion de sitio en backend para guardar:

- nombre de marca
- logo
- favicon
- textos base
- colores

Y luego cargarlo desde el frontend para cambiar todo desde un panel privado.

## Publicacion recomendada

1. Frontend estatico en tu dominio principal.
2. Backend FastAPI en un subdominio o servicio separado.
3. Variables reales desde `.env`.
4. Base de datos fuera del navegador.

## Endpoints utiles

- `GET /api/health`
- `GET /api/public/races`
- `GET /api/public/races/{race_slug}`
- `GET /api/public/races/{race_slug}/photos?bib=1043`
- `POST /api/admin/auth/login`
- `GET /api/admin/reports/summary`
