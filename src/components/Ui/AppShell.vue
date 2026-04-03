<template>
  <v-app>
    <AppHeader />
    <v-main>
      <v-container class="py-6" max-width="960">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import AppHeader from './AppHeader.vue';
</script>
