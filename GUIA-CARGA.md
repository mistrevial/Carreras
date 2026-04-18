# Guia De Carga De Fotos

## Estructura actual

Cada carrera usa esta estructura:

- `assets/races/<slug>/cover.jpg`
- `assets/races/<slug>/previews/`
- `assets/races/<slug>/full/`

## Como cargar fotos manualmente

1. Copia la portada de la carrera a `cover.jpg`.
2. Copia cada preview a `previews/`.
3. Copia la foto final con el mismo nombre a `full/`.
4. Registra carrera y fotos en `data.js`.

## Formato de cada foto en `data.js`

```js
["1043", "Daniel Vega", "Amanecer sobre Reforma", "1043-1.jpg", "center 24%"]
```

Significado:

- `1043`: dorsal
- `Daniel Vega`: nombre visible
- `Amanecer sobre Reforma`: titulo corto
- `1043-1.jpg`: archivo en `previews/` y `full/`
- `center 24%`: recorte de la tarjeta

## Recomendacion de nombres

Usa este formato:

```text
<dorsal>-<consecutivo>.jpg
```

Ejemplos:

- `1043-1.jpg`
- `324-1.jpg`
- `403-1.jpg`

## Marca

Si cambias la marca:

- logo: `assets/brand/logo-mark.png`
- favicon: `assets/brand/favicon.png`

## Si quieres evitar esto en el futuro

Si, se puede programar para hacerlo desde backend o desde un panel privado fuera de VS Code.

La ruta correcta seria:

- formulario para crear carrera
- subida de portada
- subida masiva de fotos
- generacion automatica de previews
- actualizacion de precios y textos
