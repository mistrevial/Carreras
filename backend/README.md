# Finish Line Backend

Backend FastAPI para separar la parte publica del control interno.

## Incluye

- carreras
- fotos
- compras
- login admin
- reportes por API

## Levantar local

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Variables base

```env
APP_NAME=Finish Line API
DATABASE_URL=sqlite:///./finishline.db
ADMIN_BOOTSTRAP_USERNAME=admin
ADMIN_BOOTSTRAP_PASSWORD=ChangeThisNow123!
USE_SECURE_COOKIES=false
ALLOW_ORIGINS=http://127.0.0.1:5500,http://localhost:5500,http://127.0.0.1:8000,http://localhost:8000
SEED_DEMO_DATA=true
```

## Publicacion

Ya se incluye:

- `.env.example`
- `Dockerfile`
- `.dockerignore`

Ejemplo con Docker:

```powershell
cd backend
docker build -t finishline-backend .
docker run --env-file .env -p 8000:8000 finishline-backend
```

Para publicacion real conviene dejar `SEED_DEMO_DATA=false` una vez cargues tu catalogo.

## Endpoints principales

### Publicos

- `GET /api/health`
- `GET /api/public/races`
- `GET /api/public/races/{race_slug}`
- `GET /api/public/races/{race_slug}/photos?bib=1043`

### Admin

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `GET /api/admin/reports/summary`
- `GET /api/admin/reports/purchases`
- `POST /api/admin/races`
- `POST /api/admin/photos`
