# TIME ATTACK — Backend simplificat

**Pràctica de 2n DAW.** El joc continua funcionant localment a Vue. El servidor només **rep un resultat** i **envia la classificació compartida**. No hi ha sales, rondes sincronitzades ni càlcul de temps al servidor.

## 1. Iniciar el servidor amb Docker

Obre un terminal a la carpeta que conté `compose.yaml`:

```bash
docker compose up --build -d
docker compose ps
```

Comprova `http://localhost:3000/health`. Al principi retorna:

```json
{"ok":true,"resultats":0}
```

Per consultar els missatges del servidor:

```bash
docker compose logs -f
```

Per aturar-lo:

```bash
docker compose down
```

Alternativa sense Docker, amb Node.js instal·lat: `npm install` i `npm start`.

## 2. Els dos esdeveniments Socket.IO

| Direcció | Esdeveniment | Dades |
|---|---|---|
| Vue → servidor | `resultat` | `{ nom: 'Anna', errorTotal: 0.85 }` (segons) |
| Servidor → Vue | `classificacio` | `[{ nom: 'Anna', errorTotal: 0.85 }, ...]` |

Quan un navegador es connecta, rep la classificació actual. Quan algú envia un resultat vàlid, el servidor l'afegeix i envia **tota** la classificació a tots els navegadors.

El servidor no ordena els resultats; podeu ordenar-los a Vue com a repte. Les partides repetides d'un mateix jugador es guarden com a entrades diferents.

## 3. Connexió des de Vue

Al **projecte Vue** (no al servidor):

```bash
npm install socket.io-client
```

Crea un fitxer `.env` a l'arrel de Vue:

```dotenv
VITE_SOCKET_URL=http://localhost:3000
```

En `src/services/socket.js`:

```js
import { io } from 'socket.io-client'

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false
})
```

A `GameBoardView.vue`, importa `socket` i utilitza el store Pinia de la sessió 2:

```js
import { onMounted, onUnmounted } from 'vue'
import { socket } from '@/services/socket'
import { useGameStore } from '@/stores/game'

const store = useGameStore()

function rebreClassificacio(dades) {
  store.actualitzarClassificacio(dades)
}

onMounted(() => {
  socket.on('classificacio', rebreClassificacio)
  socket.connect()
})

onUnmounted(() => {
  socket.off('classificacio', rebreClassificacio)
  socket.disconnect()
})
```

**Important:** afegeix els imports, el store i els hooks al component existent; no dupliquis declaracions que ja hi hagi.

Al **store Pinia en Composition API**, afegeix i retorna:

```js
const classificacio = ref([])

function actualitzarClassificacio(dades) {
  classificacio.value = dades
}
```

Al final de `rebreTecla()`, just quan acaba la partida i ja has calculat `errorTotal` (en segons), envia també:

```js
socket.emit('resultat', {
  nom: store.nomJugador,
  errorTotal: Number(errorTotal.toFixed(2))
})
```

`ScoreBoard.vue` pot mostrar `store.classificacio`. **No eliminis** l'historial local `store.partides` de la sessió 2: és independent de la classificació compartida.

## 4. Proves a l'aula

1. Obre el frontend en dos navegadors amb noms diferents.
2. Juga una partida en el primer i comprova que el resultat apareix als dos.
3. Juga una partida en el segon i comprova que tots dos reben la llista ampliada.
4. Recarrega una pàgina: el servidor tornarà a enviar-li la classificació mentre continuï en execució.

Si el backend és en un altre ordinador, substitueix `localhost` a `.env` per la IP d'aquell equip i reinicia Vite. El port TCP 3000 ha de ser accessible des de l'ordinador del navegador.

## Límits d'aquest prototipus

- Dades **en memòria**: es perden en reiniciar el servidor/contenidor.
- Sense comptes, sales, autentificació ni base de dades.
- Els temps i errors es calculen al **client**, de manera que els resultats es poden manipular. No és un sistema de competició segur.
- CORS obert a qualsevol origen: únicament per a desenvolupament docent en una xarxa controlada, **no publicar directament a Internet**.
- L'array de resultats creix mentre el servidor estigui en execució; per a una pràctica curta és suficient, no per a producció.
