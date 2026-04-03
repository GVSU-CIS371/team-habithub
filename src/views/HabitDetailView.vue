<template>
  <section>
    <v-btn variant="text" class="mb-4" @click="goBack">Back to habits</v-btn>

    <v-progress-linear v-if="habitsStore.loading || logsStore.loading" indeterminate class="mb-4" />

    <v-alert v-if="habitsStore.error" type="error" variant="tonal" class="mb-4">
      {{ habitsStore.error }}
    </v-alert>
    <v-alert v-if="logsStore.error" type="error" variant="tonal" class="mb-4">
      {{ logsStore.error }}
    </v-alert>

    <v-card v-if="habitsStore.selected" variant="outlined" class="mb-4">
      <v-card-title>{{ habitsStore.selected.title }}</v-card-title>
      <v-card-text>
        <p>{{ habitsStore.selected.description }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" @click="completeToday">Completed Today</v-btn>
      </v-card-actions>
    </v-card>

    <h2 class="text-h6 mb-3">Logs</h2>
    <LogList :logs="logsStore.items" @edit="openEditDialog" @delete="deleteLog" />

    <v-dialog v-model="showEditDialog" max-width="520">
      <v-card>
        <v-card-title>Edit Log</v-card-title>
        <v-card-text>
          <v-text-field v-model="editDate" label="Date (YYYY-MM-DD)" />
          <v-textarea v-model="editNote" label="Note" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveEdit">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import LogList from '@/components/LogList.vue';
import { useHabitsStore } from '@/stores/habits';
import { useLogsStore } from '@/stores/logs';

const props = defineProps<{ id: string }>();
const router = useRouter();
const habitsStore = useHabitsStore();
const logsStore = useLogsStore();

const showEditDialog = ref(false);
const editingLogId = ref<string | null>(null);
const editDate = ref('');
const editNote = ref('');

onMounted(async () => {
  await habitsStore.fetchById(props.id);
  await logsStore.fetchByHabit(props.id);
});

async function goBack(): Promise<void> {
  await router.push({ name: 'habits' });
}

async function completeToday(): Promise<void> {
  await logsStore.markCompletedToday(props.id);
}

function openEditDialog(logId: string): void {
  const target = logsStore.items.find((log) => log.id === logId);
  if (!target) {
    return;
  }

  editingLogId.value = logId;
  editDate.value = target.date;
  editNote.value = target.note;
  showEditDialog.value = true;
}

async function saveEdit(): Promise<void> {
  if (!editingLogId.value) {
    return;
  }

  await logsStore.update(editingLogId.value, {
    date: editDate.value,
    note: editNote.value,
  });
  showEditDialog.value = false;
}

async function deleteLog(logId: string): Promise<void> {
  await logsStore.remove(logId);
}
</script>
