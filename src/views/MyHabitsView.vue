<template>
  <section>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">My Habits</h1>
      <v-btn color="primary" @click="showCreateDialog = true">Add Habit</v-btn>
    </div>

    <v-alert v-if="habitsStore.error" type="error" variant="tonal" class="mb-4">
      {{ habitsStore.error }}
    </v-alert>

    <v-progress-linear v-if="habitsStore.loading" indeterminate class="mb-4" />

    <v-row>
      <v-col v-for="habit in habitsStore.items" :key="habit.id" cols="12" md="6">
        <HabitCard
          :habit="habit"
          @open="openHabit"
          @toggle-archive="toggleArchive"
          @delete="removeHabit"
        />
      </v-col>
    </v-row>

    <v-alert
      v-if="habitsStore.items.length === 0 && !habitsStore.loading"
      type="info"
      variant="tonal"
    >
      You do not have habits yet. Add your first one.
    </v-alert>

    <v-dialog v-model="showCreateDialog" max-width="520">
      <v-card>
        <v-card-title>Create Habit</v-card-title>
        <v-card-text>
          <v-text-field v-model="title" label="Title" required />
          <v-textarea v-model="description" label="Description" rows="3" />
          <v-text-field v-model="tagsText" label="Tags (comma separated)" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="createHabitFromForm">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import HabitCard from '@/components/HabitCard.vue';
import { useHabitsStore } from '@/stores/habits';

const router = useRouter();
const habitsStore = useHabitsStore();

const showCreateDialog = ref(false);
const title = ref('');
const description = ref('');
const tagsText = ref('');

onMounted(async () => {
  await habitsStore.fetchMine();
});

async function openHabit(habitId: string): Promise<void> {
  await router.push({ name: 'habit-detail', params: { id: habitId } });
}

async function createHabitFromForm(): Promise<void> {
  const tags = tagsText.value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  await habitsStore.create({
    title: title.value,
    description: description.value,
    tags,
    from_template_id: null,
  });

  showCreateDialog.value = false;
  title.value = '';
  description.value = '';
  tagsText.value = '';
}

async function toggleArchive(habitId: string): Promise<void> {
  const target = habitsStore.items.find((habit) => habit.id === habitId);
  if (!target) {
    return;
  }

  await habitsStore.update(habitId, { archived: !target.archived });
}

async function removeHabit(habitId: string): Promise<void> {
  await habitsStore.remove(habitId);
}
</script>
