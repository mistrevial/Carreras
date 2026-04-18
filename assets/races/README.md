# Estructura De Fotos

Cada carrera debe tener:

- `previews/` para imagenes censuradas o en baja calidad
- `full/` para imagenes premium

Ejemplo:

- `assets/races/cdmx-21k-2026/previews/1024-1.jpg`
- `assets/races/cdmx-21k-2026/full/1024-1.jpg`

Luego registra el archivo en `data.js` usando:

```js
["1024", "Ana Soto", "Salida limpia a ritmo controlado", "1024-1.jpg"]
```
