# The Cryptic Club

Un críptico al día. SPA sin backend ni build, con progreso en `localStorage`.

🔗 **Demo:** https://jheremysebastian17.github.io/TheCrypticClub/

## Características

- **Reto diario** con cuenta regresiva a medianoche (hora de Madrid).
- **Crípticos nuevos cada día, sin mantenimiento:** cuando se acaba el catálogo manual, un banco de 154 juegos de palabras verificados (anagramas, inversiones, palabras ocultas y charadas) genera el reto diario. No se repite ninguno hasta agotar el banco.
- **Resolución guiada:** letras en verde, pista desglosada en definición, indicador y material, y explicación del juego de palabras.
- **Archivo** desde el 20 de octubre, jugable sin sumar a la racha.
- **Compartir resultado:** copia tu tiempo, pistas usadas y racha sin revelar la respuesta.
- **Contrarreloj** de 60 segundos con récord local.
- **Logros** (22) y **perfil** con racha, actividad semanal y mapa de 30 días.
- **Copia de seguridad:** exporta e importa tu progreso como archivo JSON desde el perfil.
- **IA Lab y Comunidad**, con acertijos en dos capas y formulario de propuestas.
- **Modo 1v1** por WebRTC (PeerJS), sin servidor propio.

## Estructura
```
thecrypticclub/
├── index.html Esqueleto y carga de scripts
├── styles.css Tema oscuro editorial
├── database.js Catálogo manual de crípticos
├── generator.js Banco verificado + GeneradorProceduralIA(semilla) para días sin entrada
├── generator.test.js Comprueba que cada críptico del banco es válido (node generator.test.js)
├── p2p.js Conexión PeerJS del Modo 1v1
└── app.js Estado, vistas, reloj y lógica de juego
```

## Ejecutar en local

```bash
git clone https://github.com/jheremysebastian17/TheCrypticClub.git
cd TheCrypticClub
python -m http.server 8000
```

Abre `http://localhost:8000`.

## Despliegue

*Settings → Pages* → **Deploy from a branch** → `main` / `/ (root)`.

## Funcionamiento

- **Diario:** `app.js` busca el críptico de la fecha en `database.js`; si no existe, `GeneradorProceduralIA(fecha)` elige uno del banco de `generator.js` según el día. Todos los jugadores ven el mismo, cambia solo a medianoche (hora de Madrid) y no hace falta publicar nada.
- **Calidad:** cada entrada del banco es un juego de palabras real (p. ej. *Frase en desorden: fruta roja* → FRESA). `node generator.test.js` verifica las 154 antes de publicar cambios.
- **1v1:** el anfitrión crea una sala de cuatro caracteres y genera los cinco casos. Ambos jugadores reciben los mismos y ven el progreso del rival en directo. PeerJS usa su servidor público (`0.peerjs.com`) solo para la señalización.

## Persistencia

Todo se guarda en `localStorage` bajo `the-cryptic-club:v1`. Borrar los datos del sitio reinicia el progreso. No hay sincronización automática entre dispositivos, pero puedes exportar el progreso desde el perfil e importarlo en otro navegador.

## Limitaciones

- Sin servidor TURN, algunas redes móviles o corporativas impedirán el 1v1.
- El top 5 de Contrarreloj es simulado; solo el récord es real.
- Tras 154 días generados, el banco vuelve a empezar; amplíalo en `generator.js` para alargar el ciclo.

## Créditos

[Playfair Display](https://fonts.google.com/specimen/Playfair+Display) · [Inter](https://fonts.google.com/specimen/Inter) · [PeerJS](https://peerjs.com/) 1.5.4

## Licencia

Pendiente de definir. Hasta entonces, todos los derechos reservados por el autor.
