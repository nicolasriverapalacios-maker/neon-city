# NEON CITY — verificación ejecutada

Fecha: 15 de octubre de 2026 (America/Mexico_City).

Historia comprobada: abrir la ciudad WebGL → elegir distritos → sintonizar tres señales → reconstruir la transmisión → recargar y conservar el archivo. Toda la lógica funciona en el navegador; no hay API ni base de datos remota.

Playwright Interactive se ejecutó desde una sesión persistente de Node REPL, utilizando Microsoft Edge instalado en la primera revisión visual y Google Chrome instalado para el resto de pruebas. Se probaron Vite en `127.0.0.1:5173` y la compilación de producción en `127.0.0.1:4173`.

| Área | Prueba realizada | Resultado |
| --- | --- | --- |
| Arranque y producción | npm test, npm run build; abrir la compilación y renderizar WebGL real. | 6/6 pruebas de datos aprobadas; compilación correcta. |
| Assets y consola | Escuchar pageerror, errores de consola y solicitudes fallidas; comprobar fuentes y geometría. | Sin errores críticos ni solicitudes fallidas en uso normal. Advertencia no crítica de THREE.Clock emitida por R3F/Three. |
| Cámara | Arrastrar, rueda, flechas y +; comparar proyecciones antes/después; recentrar y activar/desactivar órbita. | Aprobado mediante entradas reales de Playwright. |
| Distritos | Visitar panorámica, núcleo, mercado y puerto; seleccionar también desde marcador y mapa. | Contenido, indicador activo y cámara cambian correctamente. |
| Señales | Sintonizar cada señal y esperar contadores 1/3, 2/3, 3/3. | Archivo completo y transmisión final operativos; sin duplicados. |
| Persistencia | Recargar tras completar; introducir JSON corrupto; bloquear Storage. | Conserva 3/3 normalmente; ignora datos corruptos; el bloqueo mantiene la ciudad operativa y avisa de la falta de persistencia. |
| Mapa y archivo | Abrir/cerrar; localizar una señal; revisar registros bloqueados/desbloqueados. | Aprobado, incluida navegación desde mapa y final narrativo. |
| Ajustes | Alta/ligera, sonido, movimiento reducido y pausa. | Cambian el estado real, no sólo la apariencia. |
| Pausa | Detener la ciudad, comparar imágenes de Canvas y reanudar. | Ambiente detenido. Imagen idéntica en calidad ligera. En alta hubo 43 píxeles con diferencia máxima de 1/255 entre ~1.15 millones, sin movimiento visible. |
| Movimiento reducido | Emular preferencia del sistema y modificar ajuste. | Órbita deshabilitada, lluvia oculta, ambiente detenido y cámara inmediata. |
| Audio | Contextos reales de Web Audio: activar, pausar, reanudar y desactivar. | Cero contextos antes de activación; uno reproduciendo; todos cerrados al pausar/desactivar; reanudar crea exactamente uno. API ausente también comprobada. |
| Captura | Descargar PNG y abrirlo. | Ciudad visible, fondo opaco y nombre correcto; city-export.png. |
| Móvil | Emulación 390×844, 320×640 y 844×390; seleccionar/sintonizar, mapa y menús. | Sin desbordamiento ni controles esenciales fuera de pantalla. Corregida separación del panel/contador en 320×640. |
| Gestos | Eventos táctiles por CDP: arrastre y separación de dos dedos. | Cambian las proyecciones; rotación y zoom operativos. |
| Accesibilidad | Teclado de cámara; Tab en diálogo y Escape; revisar etiquetas/foco. | Aprobado. Sin auditoría con lector de pantalla. |
| Recuperación | Bloquear WebGL inicial; perder contexto por WEBGL_lose_context; Reconectar. | Mensaje legible, carga retirada y recuperación funcional después de recargar. |
| Rendimiento | Explorar y alternar ajustes con pestaña activa. | ~44–60 fps, 74 llamadas de dibujo por fotograma en este equipo. En segundo plano puede bajar a 1 fps por limitación del navegador. |
| Dependencias | npm audit --omit=dev con certificados del sistema. | 0 vulnerabilidades conocidas de producción. |
| Graphify | Abrir HTML real y comprobar renderizado. | Mapa funcional; exportación final de 51 nodos, 107 conexiones, 8 comunidades. |

## Evidencias

La carpeta evidence/ contiene capturas reales: desktop-final.png, mobile-initial.png, mobile-market.png, mobile-map.png, mobile-landscape.png, mobile-small.png, mobile-small-recovered.png, map.png, completion.png, harbor-production.png, city-export.png y webgl-error.png. Algunas muestran estados anteriores a los últimos ajustes cosméticos; desktop-final.png y mobile-small-recovered.png corresponden a la revisión final.

## Límites de la comprobación

- No se escuchó el audio en altavoces físicos ni se probó en teléfonos físicos; se verificaron Web Audio real y emulación táctil.
- Sin prueba de carga prolongada ni auditoría completa de accesibilidad/lectores de pantalla.
- Vite avisa del tamaño del motor 3D: JavaScript ~1.20 MB, ~331 KB gzip. No bloquea la compilación.
- El visor de Graphify necesita el CDN vis-network. CSS no entra en su AST; queda una referencia pendiente documentada en el grafo, no un fallo de la app.
