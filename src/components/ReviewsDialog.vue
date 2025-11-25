<script setup lang="ts">
import { Star } from 'lucide-vue-next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type {Review} from "@/types/review.ts";

const props = defineProps<{
  reviews: Review[];
  open: boolean;
}>();

// emits open-change for v-model
const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-2xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>All Reviews ({{ props.reviews.length }})</DialogTitle>
      </DialogHeader>

      <ScrollArea class="h-[60vh] pr-4">
        <div class="space-y-4">
          <div v-for="(review, index) in props.reviews" :key="index">
            <div class="space-y-3">
              <!-- Top row -->
              <div class="flex items-start justify-between">
                <!-- Left: reviewer info -->
                <div>
                  <p class="font-medium text-foreground">
                    {{ review.reviewerName }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ review.reviewerEmail }}
                  </p>
                </div>

                <!-- Right: stars + date -->
                <div class="text-right">
                  <div class="flex items-center gap-1 mb-1">
                    <Star
                        v-for="star in 5"
                        :key="star"
                        class="w-4 h-4"
                        :class="star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted'"
                    />
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {{ formatDate(review.date) }}
                  </p>
                </div>
              </div>

              <!-- Comment -->
              <p class="text-sm text-foreground">
                {{ review.comment }}
              </p>
            </div>

            <!-- Separator between reviews -->
            <Separator v-if="index < props.reviews.length - 1" class="my-4" />
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>
