<template>
  <v-card variant="outlined">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ habit.title }}</span>
      <v-chip size="small" :color="habit.archived ? 'grey' : 'green'" variant="tonal">
        {{ habit.archived ? 'Archived' : 'Active' }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <p class="mb-3">{{ habit.description }}</p>
      <v-chip-group>
        <v-chip v-for="tag in habit.tags" :key="tag" size="small" variant="outlined">{{
          tag
        }}</v-chip>
      </v-chip-group>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" @click="emit('open', habit.id)">Open</v-btn>
      <v-btn variant="text" color="warning" @click="emit('toggleArchive', habit.id)">
        {{ habit.archived ? 'Unarchive' : 'Archive' }}
      </v-btn>
      <v-btn variant="text" color="error" @click="emit('delete', habit.id)">Delete</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { Habit } from '@/types/models';

defineProps<{ habit: Habit }>();

const emit = defineEmits<{
  open: [habitId: string];
  toggleArchive: [habitId: string];
  delete: [habitId: string];
}>();
</script>
