# Guia De Publicacion

## Archivos del frontend

Sube al hosting publico:

- `index.html`
- `carrera.html`
- `carreras.html`
- `precios.html`
- `cart.html`
- `styles.css`
- `app.js`
- `data.js`
- `assets/`

## Marca y favicon

La marca actual ya esta lista como `Finish Line`.

Si quieres cambiar logo o favicon sin tocar codigo:

1. Reemplaza `assets/brand/logo-mark.png`
2. Reemplaza `assets/brand/favicon.png`
3. Vuelve a subir `assets/brand/`

Si quieres cambiar tambien el nombre visible:

- frontend: revisa `index.html`, `carrera.html`, `precios.html`, `cart.html`, `admin.html` y `reportes.html`
- backend: cambia `APP_NAME` en `backend/.env`

## Backend

Dentro de `backend/` ya quedaron:

- `.env.example`
- `Dockerfile`
- `.dockerignore`

## Flujo recomendado

1. Publica el frontend como sitio estatico en tu dominio principal.
2. Publica el backend en otro servicio o subdominio.
3. Crea `backend/.env` desde `.env.example`.
4. Cambia usuario admin, clave y dominios permitidos.
5. Si ya no quieres catalogo inicial, deja `SEED_DEMO_DATA=false`.

## Antes de subir

- cambia la clave de administrador
- revisa `ALLOW_ORIGINS`
- confirma `USE_SECURE_COOKIES=true`
- valida que `assets/races/` tenga tus fotos finales
- valida que `assets/brand/` tenga tu logo y favicon finales

## Se puede cambiar sin VS Code

Si. Puedes hacerlo desde:

- cPanel o administrador de archivos del hosting
- FTP o SFTP
- GitHub si publicas desde repo

Lo unico que necesitas es reemplazar archivos y volver a subirlos.
