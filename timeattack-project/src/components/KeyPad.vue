<script setup>
defineProps({
  tecles: Array,
  bloquejat: Boolean,
  premudes: Array
})

const emit = defineEmits(['premuda'])
</script>

<template>
  <div class="d-flex justify-content-center gap-3">
    <button
      v-for="tecla in tecles"
      :key="tecla"
      type="button"
      class="btn btn-primary btn-lg px-4 py-3 fs-3"
      :disabled="bloquejat || premudes.includes(tecla)"
      @click="emit('premuda', tecla)"
    >
      {{ tecla }}
    </button>
  </div>
</template>
