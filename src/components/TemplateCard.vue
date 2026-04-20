<template>
  <v-card class="template-card" variant="outlined">
    <v-card-title>{{ template.title }}</v-card-title>
    <v-card-text>
      <p class="mb-3">{{ template.description }}</p>
      <v-chip-group>
        <v-chip v-for="tag in template.tags" :key="tag" size="small" variant="tonal">
          {{ tag }}
        </v-chip>
      </v-chip-group>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" @click="emit('view', template.id)">View</v-btn>
      <v-btn variant="tonal" @click="emit('useTemplate', template.id)">Use Template</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { HabitTemplate } from '@/types/models';

defineProps<{ template: HabitTemplate }>();

const emit = defineEmits<{
  view: [templateId: string];
  useTemplate: [templateId: string];
}>();
</script>

<style scoped>
.template-card {
  height: 100%;
}
</style>
