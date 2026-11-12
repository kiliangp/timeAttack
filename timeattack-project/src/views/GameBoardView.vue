<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import KeyPad from '@/components/KeyPad.vue'
import ResultsTable from '@/components/ResultsTable.vue'
import ScoreBoard from '@/components/ScoreBoard.vue'
import { useGameStore } from '@/stores/game'
import { socket } from '@/services/socket'

const store = useGameStore()

const tecles = ['A', 'S', 'D', 'F']

const tempsObjectiu = {
  A: 2,
  S: 4,
  D: 5,
  F: 7
}

const nom = ref('')
const jugant = ref(false)
const resultats = ref([])

let tempsInici = 0

const premudes = computed(() => resultats.value.map(r => r.tecla))
const partidaAcabada = computed(() => !jugant.value && resultats.value.length === tecles.length)

function entrar() {
  if (nom.value.trim() === '') return

  store.guardarNom(nom.value.trim())
}

function connectat() {
  console.log('Connectat al servidor!', socket.id)
}

function rebreClassificacio(dades) {
  console.log('Classificació rebuda:', dades)

  store.actualitzarClassificacio(dades)
}

onMounted(() => {
  socket.on('connect', connectat)
  socket.on('classificacio', rebreClassificacio)

  socket.connect()
})

onUnmounted(() => {
  socket.off('connect', connectat)
  socket.off('classificacio', rebreClassificacio)

  socket.disconnect()
})

function iniciarPartida() {
  resultats.value = []
  jugant.value = true
  tempsInici = performance.now()
}

function rebreTecla(tecla) {
  if (!jugant.value) return
  if (premudes.value.includes(tecla)) return

  const tempsReal = (performance.now() - tempsInici) / 1000
  const objectiu = tempsObjectiu[tecla]
  const error = parseFloat((tempsReal - objectiu).toFixed(2))

  resultats.value.push({
    tecla,
    objectiu,
    tempsReal: parseFloat(tempsReal.toFixed(2)),
    error
  })

  if (resultats.value.length === tecles.length) {
    jugant.value = false

    let errorTotal = 0

    for (let index = 0; index < resultats.value.length; index++) {
      const element = resultats.value[index]

      errorTotal = errorTotal + Math.abs(element.error)
    }

    const errorFinal = Number(errorTotal.toFixed(2))

    store.guardarPartida(errorFinal)

    socket.emit('resultat', {
      nom: store.nomJugador,
      errorTotal: errorFinal
    })
  }
}
</script>

<template>
  <div class="container py-5 text-center">
    <h1 class="mb-4">Time Attack</h1>

    <div v-if="!store.nomJugador">
      <h2>Benvingut a TIME ATTACK!</h2>

      <input
        v-model="nom"
        placeholder="Introdueix el teu nom"
        class="form-control w-auto mx-auto mb-3"
      />

      <button
        type="button"
        class="btn btn-primary"
        @click="entrar"
      >
        Entrar al joc
      </button>
    </div>

    <div v-else>
      <h2 class="mb-4">Hola, {{ store.nomJugador }}!</h2>

      <ScoreBoard class="mb-5" />

      <p class="text-muted">
        Prem les tecles A, S, D i F en el moment just, sense veure el cronòmetre.
      </p>

      <button
        type="button"
        class="btn btn-success btn-lg mb-5"
        :disabled="jugant"
        @click="iniciarPartida"
      >
        Iniciar partida
      </button>

      <KeyPad
        :tecles="tecles"
        :bloquejat="!jugant"
        :premudes="premudes"
        @premuda="rebreTecla"
      />

      <div v-if="partidaAcabada" class="mt-5">
        <h2 class="mb-3">Resultats</h2>
        <ResultsTable :resultats="resultats" />
      </div>
    </div>
  </div>
</template>
