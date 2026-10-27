# The Cryptic Club

Un críptico al día. SPA sin backend ni build, con progreso en `localStorage`.

🔗 **Demo:** https://jheremysebastian17.github.io/thecrypticclub/

## Características

- **Reto diario** con cuenta regresiva a medianoche (hora de Madrid).
- **Resolución guiada:** letras en verde y pista desglosada en definición, indicador y material.
- **Archivo** desde el 20 de octubre, jugable sin sumar a la racha.
- **Contrarreloj** de 60 segundos con récord local.
- **Logros** (22) y **perfil** con racha, actividad semanal y mapa de 30 días.
- **IA Lab y Comunidad**, con acertijos en dos capas y formulario de propuestas.
- **Modo 1v1** por WebRTC (PeerJS), sin servidor propio.

## Estructura
```
thecrypticclub/
├── index.html Esqueleto y carga de scripts
├── styles.css Tema oscuro editorial
├── database.js Catálogo manual de crípticos
├── generator.js GeneradorProceduralIA(semilla) para días sin entrada
├── p2p.js Conexión PeerJS del Modo 1v1
└── app.js Estado, vistas, reloj y lógica de juego
```

## Ejecutar en local

```bash
git clone https://github.com/jheremysebastian17/thecrypticclub.git
cd thecrypticclub
python -m http.server 8000
```

Abre `http://localhost:8000`.

## Despliegue

*Settings → Pages* → **Deploy from a branch** → `main` / `/ (root)`.

## Funcionamiento

- **Diario:** `app.js` busca el críptico de la fecha en `database.js`; si no existe, `GeneradorProceduralIA(fecha)` lo genera de forma determinista.
- **1v1:** el anfitrión crea una sala de cuatro caracteres y genera los cinco casos. Ambos jugadores reciben los mismos y ven el progreso del rival en directo. PeerJS usa su servidor público (`0.peerjs.com`) solo para la señalización.

## Persistencia

Todo se guarda en `localStorage` bajo `the-cryptic-club:v1`. Borrar los datos del sitio reinicia el progreso; no hay sincronización entre dispositivos.

## Limitaciones

- Sin servidor TURN, algunas redes móviles o corporativas impedirán el 1v1.
- El top 5 de Contrarreloj es simulado; solo el récord es real.
- Los crípticos procedurales son válidos en mecanismo, pero menos pulidos que los manuales.

## Créditos

[Playfair Display](https://fonts.google.com/specimen/Playfair+Display) · [Inter](https://fonts.google.com/specimen/Inter) · [PeerJS](https://peerjs.com/) 1.5.4

## Licencia

Pendiente de definir. Hasta entonces, todos los derechos reservados por el autor.
