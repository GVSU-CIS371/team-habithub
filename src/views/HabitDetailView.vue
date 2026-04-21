<template>
  <section>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">Back to habits</v-btn>

    <v-progress-linear v-if="habitsStore.loading || logsStore.loading" indeterminate class="mb-4" color="primary" />

    <v-alert v-if="habitsStore.error || logsStore.error" type="error" variant="tonal" class="mb-4" closable @click:close="clearErrors">
      {{ habitsStore.error || logsStore.error }}
    </v-alert>

    <v-card v-if="habitsStore.selected" variant="outlined" class="mb-6">
      <v-card-title class="text-h5">{{ habitsStore.selected.title }}</v-card-title>
      <v-card-text>
        <p class="text-body-1">{{ habitsStore.selected.description }}</p>
        <div v-if="habitsStore.selected.tags?.length" class="mt-2">
          <v-chip v-for="tag in habitsStore.selected.tags" :key="tag" size="small" class="mr-1">
            {{ tag }}
          </v-chip>
        </div>
      </v-card-text>
      
      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn 
          :color="isCompletedToday ? 'grey' : 'success'" 
          variant="elevated"
          :prepend-icon="isCompletedToday ? 'mdi-check-circle' : 'mdi-plus'"
          :disabled="isCompletedToday || logsStore.loading"
          :loading="loggingProgress"
          @click="completeToday"
        >
          {{ isCompletedToday ? 'Completed Today' : 'Mark Completed Today' }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <div class="d-flex align-center mb-3">
      <h2 class="text-h6">History</h2>
      <v-spacer />
      <span class="text-caption text-grey">Showing last {{ logsStore.items.length }} entries</span>
    </div>

    <LogList 
      :logs="logsStore.items" 
      @edit="openEditDialog" 
      @delete="deleteLog" 
    />

    <v-alert v-if="logsStore.items.length === 0 && !logsStore.loading" type="info" variant="tonal" class="mt-4">
      No progress logs found for this habit yet.
    </v-alert>

    <v-dialog v-model="showEditDialog" max-width="520" persistent>
      <v-card>
        <v-card-title>Edit Log Entry</v-card-title>
        <v-card-text>
          <v-text-field 
            v-model="editDate" 
            label="Date" 
            type="date" 
            hint="Format: YYYY-MM-DD" 
            persistent-hint
          />
          <v-textarea v-model="editNote" label="Notes" rows="3" class="mt-4" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="logsStore.loading" @click="saveEdit">Save Changes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import LogList from '@/components/LogList.vue';
import { useHabitsStore } from '@/stores/habits';
import { useLogsStore } from '@/stores/logs';

const props = defineProps<{ id: string }>();
const router = useRouter();
const habitsStore = useHabitsStore();
const logsStore = useLogsStore();

const showEditDialog = ref(false);
const loggingProgress = ref(false);
const editingLogId = ref<string | null>(null);
const editDate = ref('');
const editNote = ref('');

// QA: Reactive check for today's completion
const isCompletedToday = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return logsStore.items.some(log => log.date === today);
});

onMounted(async () => {
  await habitsStore.fetchById(props.id);
  await logsStore.fetchByHabit(props.id);
});

function clearErrors() {
  habitsStore.error = null;
  logsStore.error = null;
}

async function goBack(): Promise<void> {
  await router.push({ name: 'habits' });
}

async function completeToday(): Promise<void> {
  loggingProgress.value = true;
  try {
    await logsStore.markCompletedToday(props.id);
    // Optional: Refresh list after logging
    await logsStore.fetchByHabit(props.id);
  } finally {
    loggingProgress.value = false;
  }
}

function openEditDialog(logId: string): void {
  const target = logsStore.items.find((log) => log.id === logId);
  if (!target) return;

  editingLogId.value = logId;
  editDate.value = target.date;
  editNote.value = target.note;
  showEditDialog.value = true;
}

async function saveEdit(): Promise<void> {
  if (!editingLogId.value) return;

  await logsStore.update(editingLogId.value, {
    date: editDate.value,
    note: editNote.value,
  });
  showEditDialog.value = false;
}

async function deleteLog(logId: string): Promise<void> {
  if (confirm('Delete this log entry?')) {
    await logsStore.remove(logId);
  }
}
</script>
