<template>
  <v-row justify="center">
    <v-col cols="12" sm="10" md="6" lg="4">
      <v-card variant="outlined">
        <v-card-title>{{ isRegisterMode ? 'Create Account' : 'Welcome Back' }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSubmit">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              autocomplete="email"
              required
            />
            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              autocomplete="current-password"
              required
            />
            <v-text-field
              v-if="isRegisterMode"
              v-model="displayName"
              label="Display Name"
              autocomplete="name"
            />
            <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4">
              {{ authStore.error }}
            </v-alert>
            <v-btn type="submit" block color="primary" :loading="authStore.loading">
              {{ isRegisterMode ? 'Register' : 'Login' }}
            </v-btn>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="isRegisterMode = !isRegisterMode">
            {{ isRegisterMode ? 'Already have an account? Login' : 'Need an account? Register' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isRegisterMode = ref(false);
const email = ref('');
const password = ref('');
const displayName = ref('');

const canSubmit = computed(() => email.value.length > 0 && password.value.length > 0);

async function handleSubmit(): Promise<void> {
  if (!canSubmit.value) {
    return;
  }

  if (isRegisterMode.value) {
    await authStore.register({
      email: email.value,
      password: password.value,
      displayName: displayName.value || undefined,
    });
  } else {
    await authStore.login({ email: email.value, password: password.value });
  }

  await router.push({ name: 'habits' });
}
</script>
