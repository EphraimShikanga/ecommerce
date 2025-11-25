<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { Star } from 'lucide-vue-next';
import type {Review} from "@/types/review.ts";

interface Props {
  reviews: Review[];
  autoPlayInterval?: number;
}

const props = defineProps<Props>();

const currentIndex = ref(0);
let timer: number | null = null;

// Get current review safely
const currentReview = computed(() => {
  if (!props.reviews || props.reviews.length === 0) return null;
  return props.reviews[currentIndex.value];
});

// autoplay logic
const startAutoPlay = () => {
  if (!props.reviews || props.reviews.length === 0) return;
  stopAutoPlay();
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % props.reviews.length;
  }, props.autoPlayInterval ?? 5000);
};

const stopAutoPlay = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

onMounted(startAutoPlay);
onBeforeUnmount(stopAutoPlay);

watch(
    () => [props.reviews.length, props.autoPlayInterval],
    () => startAutoPlay()
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
</script>

<template>
  <div v-if="currentReview" class="space-y-4">
      <!-- Stars -->
      <div class="flex items-center gap-1">
        <Star
            v-for="star in 5"
            :key="star"
            class="w-4 h-4"
            :class="star <= currentReview.rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-muted text-muted'"
        />
      </div>

      <!-- Comment -->
      <p class="text-sm text-foreground ">
        "{{ currentReview.comment }}"
      </p>

      <!-- Reviewer -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-foreground">
            {{ currentReview.reviewerName }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ currentReview.reviewerEmail }}
          </p>
        </div>

        <p class="text-xs text-muted-foreground">
          {{ formatDate(currentReview.date) }}
        </p>
      </div>

    <!-- Dots indicator -->
    <div class="flex items-center justify-center gap-2">
      <button
          v-for="(review, index) in props.reviews"
          :key="review.reviewerEmail + index"
          @click="currentIndex = index"
          class="w-2 h-2 rounded-full transition-all"
          :class="index === currentIndex
          ? 'bg-primary w-6'
          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'"
          :aria-label="`Go to review ${index + 1}`"
      />
    </div>
  </div>
  <div v-else class="text-center py-8 text-muted-foreground">
    No reviews available
  </div>
</template>
