<template>
  <v-list lines="two" class="rounded border-sm">
    <v-list-item
      v-for="log in logs"
      :key="log.id"
      :title="`${log.date} - ${log.status}`"
      :subtitle="log.note || 'No note added.'"
    >
      <template #append>
        <v-btn variant="text" size="small" @click="emit('edit', log.id)">Edit</v-btn>
        <v-btn variant="text" size="small" color="error" @click="emit('delete', log.id)"
          >Delete</v-btn
        >
      </template>
    </v-list-item>

    <v-list-item
      v-if="logs.length === 0"
      title="No logs yet"
      subtitle="Add your first completion entry."
    />
  </v-list>
</template>

<script setup lang="ts">
import type { HabitLog } from '@/types/models';

defineProps<{ logs: HabitLog[] }>();

const emit = defineEmits<{
  edit: [logId: string];
  delete: [logId: string];
}>();
</script>
