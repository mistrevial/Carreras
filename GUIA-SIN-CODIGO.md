# Operacion Sin Tocar Codigo

## Lo importante

El cliente solo debe ver el sitio publico de `Finish Line`.

Tu operacion ideal queda separada en:

- sitio publico para buscar y comprar
- backend para datos y seguridad
- panel privado para administracion

## Lo que hoy puedes cambiar sin programar

- logo y favicon reemplazando `assets/brand/logo-mark.png` y `assets/brand/favicon.png`
- fotos y portadas reemplazando archivos dentro de `assets/races/`
- frontend completo desde hosting, FTP o cPanel
- variables del backend desde `backend/.env`

## Lo que hoy todavia depende de archivos

- altas de carreras en `data.js`
- alta manual de fotos en `assets/races/`
- textos fijos del frontend si quieres renombrar secciones

## Lo que conviene programar despues

Si quieres trabajar ya sin entrar a archivos ni VS Code, si se puede programar.

El siguiente paso correcto es hacer un panel privado para:

- crear y editar carreras
- subir portadas y galerias
- cambiar precios
- cambiar logo, favicon y nombre de marca
- revisar compras
- exportar reportes

## Respuesta corta

Si, si se puede hacer desde fuera de VS Code.

Hoy:

- frontend: subiendo y reemplazando archivos
- backend: cambiando `.env`

Despues:

- con un panel de administracion propio
