<template>
  <v-app-bar elevation="1">
    <v-app-bar-title>HabitHub</v-app-bar-title>
    <v-spacer />

    <v-btn variant="text" to="/templates">Templates</v-btn>
    <v-btn v-if="authStore.isAuthenticated" variant="text" to="/habits">My Habits</v-btn>
    <v-btn v-if="!authStore.isAuthenticated" variant="outlined" to="/auth">Login</v-btn>
    <v-btn v-else variant="outlined" :loading="authStore.loading" @click="handleLogout">
      Logout
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

async function handleLogout(): Promise<void> {
  await authStore.logout();
  await router.push({ name: 'auth' });
}
</script>
