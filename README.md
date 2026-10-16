# NEON CITY — El último amanecer

Experiencia 3D de exploración orbital construida con React, Three.js, React Three Fiber, Drei y Vite. La ciudad y sus texturas se generan localmente; no necesita cuentas, claves, modelos remotos ni servicios externos.

**Abrir la experiencia:** https://nicolasriverapalacios-maker.github.io/neon-city/

**Mapa de Graphify:** https://nicolasriverapalacios-maker.github.io/neon-city/graphify-out/graph.html

## Ejecutar

Requiere Node.js 22.12+ o 24+ y npm.

```powershell
git clone https://github.com/nicolasriverapalacios-maker/neon-city.git
cd neon-city
npm ci
npm run dev -- --port 5173
```

Abrir http://127.0.0.1:5173/ . Si el puerto está ocupado, Vite muestra el puerto alternativo.

```powershell
npm test
npm run build
npm run preview -- --port 4173
```

La compilación estática queda en `dist/`. GitHub Actions ejecuta las pruebas y publica automáticamente cada cambio en `main` con la base `/neon-city/` de GitHub Pages.

## Explorar

- Arrastrar para orbitar; rueda o pellizco para zoom. Con el mundo enfocado: flechas para girar, `+` / `-` para zoom.
- Elegir un destino en la ciudad, la barra inferior o el mapa. Cada distrito tiene una cámara y una historia propias.
- Sintonizar las tres señales para completar la transmisión. El archivo persiste en el almacenamiento local del navegador.
- Activar la órbita cinematográfica, pausar el ambiente, recentrar la cámara o descargar un PNG de la ciudad sin interfaz.
- Ajustar calidad, movimiento reducido y audio. El audio es una atmósfera sintetizada que empieza únicamente al activarlo.
- Los diálogos admiten teclado, conservan el foco y se cierran con Escape.

## Mapa del código

Con Vite ejecutándose: http://127.0.0.1:5173/graphify-out/graph.html

`graphify-out/` contiene el mapa interactivo, los datos y el informe de Graphify. El visor del grafo usa vis-network desde un CDN; la experiencia NEON CITY funciona sin ese recurso. Las fuentes Barlow Condensed y Manrope se distribuyen localmente con sus licencias SIL OFL en `public/fonts/`.

## Verificación y límites

Ver `tests/QA.md` y las capturas reales de `evidence/`. Las pruebas de datos se ejecutan con `npm test`.

Se necesita WebGL y aceleración gráfica. La experiencia es una ciudad orbital; no incluye paseo en primera persona. Los reflejos del agua son estilizados. La calidad ligera reduce resolución, lluvia, estrellas y tráfico. El progreso pertenece al navegador y dispositivo actuales. No se comprobó el audio en altavoces físicos ni se probó en teléfonos físicos; se verificaron Web Audio y emulación táctil con Playwright. El paquete JavaScript incluye el motor 3D y produce el aviso de tamaño de Vite (~1.2 MB sin comprimir, ~333 KB gzip).
