import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {

  const nomJugador = ref('')
  const partides = ref([])
  const classificacio = ref([])

  function guardarNom(nom) {
    nomJugador.value = nom
  }

  function guardarPartida(errorTotal) {
    partides.value.unshift({
      id: partides.value.length + 1,
      nom: nomJugador.value,
      errorTotal: errorTotal
    })
  }

  function esborrarPartides() {
    partides.value = []
  }

  function actualitzarClassificacio(dades) {
    classificacio.value = dades
  }

  return {
    nomJugador,
    partides,
    classificacio,
    guardarNom,
    guardarPartida,
    esborrarPartides,
    actualitzarClassificacio
  }
})
