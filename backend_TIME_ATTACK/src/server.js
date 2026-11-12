import { createServer } from 'node:http'
import { Server } from 'socket.io'

const PORT = Number(process.env.PORT || 3000)
const classificacio = []

// Petita ruta HTTP per comprovar que el servidor funciona.
const httpServer = createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (req.url === '/health') {
    res.writeHead(200)
    res.end(JSON.stringify({ ok: true, resultats: classificacio.length }))
  } else {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Ruta no trobada' }))
  }
})

// CORS obert només per facilitar la pràctica a l'aula.
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

io.on('connection', (socket) => {
  console.log('Jugador connectat:', socket.id)

  // Quan entra un navegador, rep tots els resultats existents.
  socket.emit('classificacio', classificacio)

  // Quan algú acaba una partida, ens envia el seu resultat.
  socket.on('resultat', (dades) => {
    if (
      typeof dades?.nom !== 'string' ||
      !dades.nom.trim() ||
      !Number.isFinite(dades.errorTotal) ||
      dades.errorTotal < 0
    ) {
      return // Ignorem dades incorrectes.
    }

    classificacio.push({
      nom: dades.nom.trim().slice(0, 40),
      errorTotal: dades.errorTotal
    })

    // Tothom rep la classificació actualitzada, inclòs l'emissor.
    io.emit('classificacio', classificacio)
  })

  socket.on('disconnect', () => {
    console.log('Jugador desconnectat:', socket.id)
  })

  // Quan un jugador prem una tecla,
  // avisem tots els altres navegadors.
  socket.on('tecla', (dades) => {
    socket.broadcast.emit('tecla', dades)
  })
})

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`TIME ATTACK SIMPLE en http://localhost:${PORT}`)
})
