<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const store = useGameStore()

const millorMarca = computed(() => {
  if (store.partides.length === 0) return null
  return Math.min(...store.partides.map(p => p.errorTotal))
})

const classificacioOrdenada = computed(() => {
  return [...store.classificacio].sort((a, b) => a.errorTotal - b.errorTotal)
})
</script>

<template>
  <div>
    <h2>Historial de partides</h2>

    <p v-if="millorMarca !== null">
      Millor marca: <strong>{{ millorMarca }} s</strong>
    </p>

    <p v-if="store.partides.length === 0" class="text-muted">
      Encara no hi ha cap partida registrada.
    </p>

    <template v-else>
      <table class="table table-striped table-bordered text-center">
        <thead class="table-dark">
          <tr>
            <th>Partida</th>
            <th>Jugador</th>
            <th>Error total</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="partida in store.partides"
            :key="partida.id"
          >
            <td>{{ partida.id }}</td>
            <td>{{ partida.nom }}</td>
            <td>{{ partida.errorTotal }} s</td>
          </tr>
        </tbody>
      </table>

      <button
        type="button"
        class="btn btn-outline-danger btn-sm"
        @click="store.esborrarPartides"
      >
        Esborrar historial
      </button>
    </template>

    <h2 class="mt-5">Classificació global</h2>

    <p v-if="classificacioOrdenada.length === 0" class="text-muted">
      Encara no hi ha resultats. Sigues el primer a jugar!
    </p>

    <table v-else class="table table-striped table-bordered text-center">
      <thead class="table-dark">
        <tr>
          <th>Posició</th>
          <th>Jugador</th>
          <th>Error total</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(resultat, index) in classificacioOrdenada"
          :key="index"
          :class="{ 'table-success': index === 0 }"
        >
          <td>{{ index + 1 }}</td>
          <td>{{ resultat.nom }}</td>
          <td>{{ resultat.errorTotal }} s</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
