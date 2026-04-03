<template>
  <section>
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5">Shared Templates</h1>
      <v-btn variant="tonal" :loading="templatesStore.loading" @click="loadMore">Load More</v-btn>
    </div>

    <v-alert v-if="templatesStore.error" type="error" variant="tonal" class="mb-4">
      {{ templatesStore.error }}
    </v-alert>

    <v-progress-linear v-if="templatesStore.loading" indeterminate class="mb-4" />

    <v-row>
      <v-col v-for="template in templatesStore.items" :key="template.id" cols="12" md="6">
        <TemplateCard
          :template="template"
          @view="openTemplate"
          @use-template="startHabitFromTemplate"
        />
      </v-col>
    </v-row>

    <v-alert
      v-if="templatesStore.items.length === 0 && !templatesStore.loading"
      type="info"
      variant="tonal"
    >
      No templates available yet.
    </v-alert>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TemplateCard from '@/components/TemplateCard.vue';
import { useTemplatesStore } from '@/stores/templates';

const router = useRouter();
const templatesStore = useTemplatesStore();

onMounted(async () => {
  if (templatesStore.items.length === 0) {
    await templatesStore.fetchFirstPage();
  }
});

async function loadMore(): Promise<void> {
  await templatesStore.fetchNextPage();
}

async function openTemplate(templateId: string): Promise<void> {
  await router.push({ name: 'template-detail', params: { id: templateId } });
}

async function startHabitFromTemplate(templateId: string): Promise<void> {
  // TODO: prefill habit creation UI once MyHabits create dialog is implemented.
  await router.push({ name: 'template-detail', params: { id: templateId } });
}
</script>
