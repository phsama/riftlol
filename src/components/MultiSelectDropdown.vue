<template>
  <div class="multi-select" ref="dropdownRef">
    <button
      class="input filter-select ms-toggle"
      :class="{ 'ms-active': isOpen, 'ms-has-values': modelValue.length > 0 }"
      @click="isOpen = !isOpen"
      type="button"
    >
      <span class="ms-label">
        {{ modelValue.length === 0 ? displayPlaceholder : `${displayPlaceholder} (${modelValue.length})` }}
      </span>
      <svg class="ms-chevron" :class="{ 'ms-chevron-up': isOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    
    <div v-if="isOpen" class="ms-menu glass">
      <div v-if="options.length === 0" class="ms-empty">{{ $t('common.no_options') }}</div>
      <label
        v-for="opt in options"
        :key="opt.value || opt"
        class="ms-option"
      >
        <input
          type="checkbox"
          :value="opt.value || opt"
          :checked="modelValue.includes(opt.value || opt)"
          @change="toggleOption(opt.value || opt)"
          class="ms-checkbox"
        />
        <span class="ms-option-label">{{ opt.label || opt }}</span>
      </label>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Array, required: true },
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' }
})

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const displayPlaceholder = computed(() => props.placeholder || t('common.all'))


const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = ref(null)

function toggleOption(val) {
  const current = [...props.modelValue]
  const idx = current.indexOf(val)
  if (idx === -1) {
    current.push(val)
  } else {
    current.splice(idx, 1)
  }
  emit('update:modelValue', current)
}

function handleClickOutside(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.multi-select {
  position: relative;
  display: inline-block;
}

.ms-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  padding: 6px 12px;
  min-width: 110px;
  background: var(--color-bg-base);
}

.ms-has-values {
  background: rgba(201, 168, 76, 0.08);
  border-color: rgba(201, 168, 76, 0.4);
  color: var(--color-gold-400);
}

.ms-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms-chevron {
  transition: transform 0.2s;
  flex-shrink: 0;
  margin-left: 6px;
}
.ms-chevron-up {
  transform: rotate(180deg);
}

.ms-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 200;
  min-width: 180px;
  max-height: 250px;
  overflow-y: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg-raised);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  padding: 6px 0;
}

.ms-empty {
  padding: 8px 12px;
  color: var(--color-text-tertiary);
  font-size: 0.8rem;
}

.ms-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background 0.1s;
}
.ms-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.ms-checkbox {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-border-subtle);
  border-radius: 3px;
  background: var(--color-bg-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.ms-checkbox:checked {
  background: var(--color-gold-500);
  border-color: var(--color-gold-400);
}
.ms-checkbox:checked::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid var(--color-bg-deep);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.ms-option-label {
  font-size: 0.85rem;
  color: var(--color-text-primary);
  user-select: none;
}
</style>
