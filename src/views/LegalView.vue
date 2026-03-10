<template>
  <div class="legal-view fade-in">
    <div class="legal-container glass">
      <header class="legal-header">
        <h1 class="legal-title">{{ $t(`legal.${type}.title`) }}</h1>
        <p class="legal-date">{{ $t(`legal.${type}.last_updated`) }}</p>
      </header>
      
      <div class="legal-content">
        <div v-for="(paragraph, index) in contentLines" :key="index" class="legal-block">
          <h3 v-if="paragraph.startsWith('###')" class="legal-subtitle">
            {{ paragraph.replace('### ', '') }}
          </h3>
          <p v-else class="legal-text" v-html="formatMarkdown(paragraph)"></p>
        </div>
      </div>

      <div class="legal-footer">
        <router-link to="/" class="btn-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Voltar ao Início
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  type: {
    type: String,
    required: true
  }
})

const { t } = useI18n()

const contentLines = computed(() => {
  const rawText = t(`legal.${props.type}.content`)
  return rawText.split('\n\n')
})

function formatMarkdown(text) {
  if (!text) return ''
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}
</script>

<style scoped>
.legal-view {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.legal-container {
  padding: 48px;
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.legal-header {
  margin-bottom: 40px;
  border-bottom: 1px solid var(--color-border-subtle);
  padding-bottom: 24px;
}

.legal-title {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--color-gold-400);
  margin-bottom: 8px;
}

.legal-date {
  font-size: 0.9rem;
  color: var(--color-text-tertiary);
}

.legal-subtitle {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 32px 0 16px;
}

.legal-text {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.legal-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border-subtle);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-gold-500);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-back:hover {
  color: var(--color-gold-400);
  transform: translateX(-4px);
}

@media (max-width: 768px) {
  .legal-container { padding: 24px; }
  .legal-title { font-size: 1.75rem; }
}
</style>
