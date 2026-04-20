<template>
  <section>
    <v-btn variant="text" class="mb-4" @click="goBack">Back to templates</v-btn>

    <v-progress-linear v-if="templatesStore.loading" indeterminate class="mb-4" />

    <v-alert v-if="templatesStore.error" type="error" variant="tonal" class="mb-4">
      {{ templatesStore.error }}
    </v-alert>

    <v-card v-if="templatesStore.selected" variant="outlined">
      <v-card-title>{{ templatesStore.selected.title }}</v-card-title>
      <v-card-text>
        <p class="mb-4">{{ templatesStore.selected.description }}</p>
        <v-chip-group>
          <v-chip
            v-for="tag in templatesStore.selected.tags"
            :key="tag"
            size="small"
            variant="tonal"
          >
            {{ tag }}
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>

    <v-alert v-else-if="!templatesStore.loading" type="info" variant="tonal">
      Template not found.
    </v-alert>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTemplatesStore } from '@/stores/templates';

const props = defineProps<{ id: string }>();
const router = useRouter();
const templatesStore = useTemplatesStore();

onMounted(async () => {
  await templatesStore.fetchById(props.id);
});

async function goBack(): Promise<void> {
  await router.push({ name: 'templates' });
}
</script>
