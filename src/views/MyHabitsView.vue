<template>
  <section>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">My Habits</h1>
      <v-btn color="primary" @click="showCreateDialog = true">Add Habit</v-btn>
    </div>

    <v-alert v-if="habitsStore.error" type="error" variant="tonal" class="mb-4" closable @click:close="habitsStore.error = null">
      {{ habitsStore.error }}
    </v-alert>

    <v-progress-linear v-if="habitsStore.loading && habitsStore.items.length === 0" indeterminate class="mb-4" />

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
      You do not have habits yet. Add your first one by clicking "Add Habit" or browsing templates.
    </v-alert>

    <v-dialog v-model="showCreateDialog" max-width="520" persistent>
      <v-card>
        <v-card-title>Create Habit</v-card-title>
        <v-card-text>
          <v-form ref="habitForm" v-model="isFormValid">
            <v-text-field 
              v-model="title" 
              label="Title" 
              :rules="[v => !!v || 'Title is required']"
              required 
            />
            <v-textarea v-model="description" label="Description" rows="3" />
            <v-text-field v-model="tagsText" label="Tags (comma separated)" hint="e.g. fitness, morning, health" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="creating" @click="closeDialog">Cancel</v-btn>
          <v-btn 
            color="primary" 
            :loading="creating" 
            :disabled="!isFormValid"
            @click="createHabitFromForm"
          >
            Create
          </v-btn>
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

// UI State
const showCreateDialog = ref(false);
const habitForm = ref<any>(null);
const isFormValid = ref(false);
const creating = ref(false);

// Form Fields
const title = ref('');
const description = ref('');
const tagsText = ref('');

onMounted(async () => {
  await habitsStore.fetchMine();
});

async function openHabit(habitId: string): Promise<void> {
  await router.push({ name: 'habit-detail', params: { id: habitId } });
}

function closeDialog() {
  showCreateDialog.value = false;
  title.value = '';
  description.value = '';
  tagsText.value = '';
  if (habitForm.value) habitForm.value.resetValidation();
}

async function createHabitFromForm(): Promise<void> {
  if (!isFormValid.value) return;

  creating.value = true;
  try {
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
    
    closeDialog();
  } catch (err) {
    console.error("Failed to create habit:", err);
  } finally {
    creating.value = false;
  }
}

async function toggleArchive(habitId: string): Promise<void> {
  const target = habitsStore.items.find((habit) => habit.id === habitId);
  if (!target) return;
  await habitsStore.update(habitId, { archived: !target.archived });
}

async function removeHabit(habitId: string): Promise<void> {
  if (confirm('Are you sure you want to delete this habit and all its logs?')) {
    await habitsStore.remove(habitId);
  }
}
</script>
