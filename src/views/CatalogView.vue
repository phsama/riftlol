<template>
  <div class="catalog">
    <!-- ── Header ── -->
    <header class="catalog-header fade-in">
      <div>
        <h1 class="catalog-title">{{ $t('catalog.title') }}</h1>
        <p class="catalog-subtitle" v-if="!loading && allCards.length">
          {{ $t('catalog.unique_count', { count: uniqueCards.length }) }}
        </p>
      </div>
    </header>

    <!-- Search (always visible) -->
    <div class="catalog-search">
      <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        v-model="searchQuery"
        type="text"
        class="input search-input"
        :placeholder="$t('catalog.search_placeholder')"
        id="catalog-search"
      />
      <button v-if="searchQuery" class="search-clear btn-ghost btn-icon" @click="searchQuery = ''">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Filter bar (horizontal, scrollable on mobile) -->
    <div class="filter-bar">
      <!-- Domain pills -->
      <div class="filter-scroll">
        <button
          v-for="domain in availableDomains"
          :key="domain"
          class="domain-badge filter-pill"
          :class="[`domain-${domain.toLowerCase()}`, { 'filter-pill--active': selectedDomains.includes(domain) }]"
          @click="toggleDomain(domain)"
        >{{ domain }}</button>
      </div>

      <!-- Dropdowns row for Multi-select -->
      <div class="filter-selects" v-if="!loading">
        <MultiSelectDropdown
          v-model="selectedTypes"
          :options="availableTypes"
          :placeholder="$t('catalog.filters.types')"
        />
        <MultiSelectDropdown
          v-model="selectedRarities"
          :options="availableRarities"
          :placeholder="$t('catalog.filters.rarities')"
        />
      </div>

      <!-- Energy pills -->
      <div class="filter-scroll">
        <button
          v-for="e in energyOptions"
          :key="e.value"
          class="filter-pill filter-pill-energy"
          :class="{ 'filter-pill--active': selectedEnergy === e.value }"
          @click="selectedEnergy = selectedEnergy === e.value ? null : e.value"
        >⚡{{ e.label }}</button>
      </div>

      <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm clear-btn" @click="clearFilters">✕ {{ $t('common.clear') }}</button>
    </div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="cards-grid">
      <div v-for="i in 12" :key="i" class="card-skeleton">
        <div class="skeleton card-skeleton-img"></div>
        <div class="skeleton" style="width: 70%; height: 12px; margin: 8px 8px 0;"></div>
        <div class="skeleton" style="width: 40%; height: 10px; margin: 4px 8px 8px;"></div>
      </div>
    </div>

    <!-- ── Error ── -->
    <div v-else-if="error" class="empty-state fade-in">
      <div class="empty-icon">⚠️</div>
      <h3 class="empty-title">{{ $t('common.something_went_wrong') }}</h3>
      <p class="empty-text">{{ error }}</p>
      <button class="btn btn-primary" @click="fetchAllData">{{ $t('common.try_again') }}</button>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="filteredCards.length === 0" class="empty-state fade-in">
      <div class="empty-icon">🔍</div>
      <h3 class="empty-title">{{ $t('collection.empty') }}</h3>
      <p class="empty-text">{{ $t('collection.empty_hint') }}</p>
      <button v-if="hasActiveFilters" class="btn btn-secondary btn-sm" @click="clearFilters">{{ $t('common.clear_filters') }}</button>
    </div>

    <!-- ── Cards grid ── -->
    <div v-else class="cards-grid stagger-enter">
      <router-link
        v-for="card in visibleCards"
        :key="card.id"
        :to="{ name: 'card-detail', params: { name: card.name } }"
        class="card-tile"
        :class="{ 'card-tile--champion': card.classification?.type === 'Legend' }"
      >
        <div 
          class="card-image-wrap"
          :class="{'card-image-wrap--landscape': card.orientation === 'landscape' || card.classification?.type === 'Battlefield'}"
        >
          <img
            :src="card.media?.image_url"
            :alt="card.name"
            class="card-image"
            loading="lazy"
            @mouseenter="hoveredCard = card"
            @mouseleave="hoveredCard = null"
          />
          <span v-if="card._altCount > 1" class="alt-arts-badge">🎨 {{ $t('catalog.alt_arts_count', { count: card._altCount }) }}</span>
        </div>
        <div class="card-info">
          <h3 class="card-name">{{ card.name }}</h3>
          <div class="card-meta">
            <span v-if="card.classification?.rarity" class="rarity-badge" :class="`rarity-${card.classification.rarity.toLowerCase()}`">{{ card.classification.rarity }}</span>
            <span v-if="card.attributes?.energy != null" class="card-energy">⚡{{ card.attributes.energy }}</span>
          </div>
        </div>
      </router-link>
    </div>

    <!-- ── Infinite scroll sentinel ── -->
    <div v-if="hasMore" ref="sentinel" class="loading-more">
      <div class="loading-dots"><span></span><span></span><span></span></div>
    </div>

    <!-- ── Global Hover Preview ── -->
    <Teleport to="body">
      <div 
        v-if="hoveredCard" 
        class="global-card-preview"
        :style="previewPosition"
      >
        <img :src="hoveredCard.media?.image_url" :alt="hoveredCard.name" />
        
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import riftcodex from '@/services/riftcodex'
import MultiSelectDropdown from '@/components/MultiSelectDropdown.vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const BATCH_SIZE = 24
const allCards = ref([])
const loading = ref(true)
const error = ref(null)
const visibleCount = ref(BATCH_SIZE)
const sentinel = ref(null)
let observer = null

const searchQuery = ref('')
const selectedDomains = ref([])
const selectedTypes = ref([])
const selectedRarities = ref([])
const selectedEnergy = ref(null)
const hoveredCard = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)

const availableDomains = ['Body', 'Calm', 'Chaos', 'Fury', 'Mind', 'Order', 'Colorless']

const availableTypes = computed(() => {
  const t = new Set()
  allCards.value.forEach((c) => { if (c.classification?.type) t.add(c.classification.type) })
  return [...t].sort()
})
const availableRarities = computed(() => {
  const r = new Set()
  allCards.value.forEach((c) => { if (c.classification?.rarity) r.add(c.classification.rarity) })
  return [...r].sort()
})

const energyOptions = [
  { value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' },
  { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' }, { value: 6, label: '6+' },
]

const filteredCards = computed(() => {
  let result = allCards.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter((c) => {
      return c.name.toLowerCase().includes(q) ||
             c.text?.raw?.toLowerCase().includes(q) ||
             c.text?.rich?.toLowerCase().includes(q) ||
             c.description?.raw?.toLowerCase().includes(q) ||
             c.description?.rich?.toLowerCase().includes(q) ||
             c.classification?.supertype?.toLowerCase().includes(q) ||
             c.classification?.subtype?.toLowerCase().includes(q) ||
             c.tags?.some((t) => t.toLowerCase().includes(q))
    })
  }
  if (selectedDomains.value.length > 0) {
    result = result.filter((c) => c.classification?.domain?.some((d) => selectedDomains.value.includes(d)))
  }
  if (selectedTypes.value.length > 0) result = result.filter((c) => selectedTypes.value.includes(c.classification?.type))
  if (selectedRarities.value.length > 0) result = result.filter((c) => selectedRarities.value.includes(c.classification?.rarity))
  if (selectedEnergy.value !== null) {
    result = selectedEnergy.value === 6
      ? result.filter((c) => c.attributes?.energy != null && c.attributes.energy >= 6)
      : result.filter((c) => c.attributes?.energy === selectedEnergy.value)
  }
  return result
})

// Deduplicate by name, keeping first version and attaching alt art count
const uniqueCards = computed(() => {
  const seen = new Map()
  for (const card of filteredCards.value) {
    if (seen.has(card.name)) {
      const entry = seen.get(card.name)
      entry._altCount++
      entry._versions.push(card)
    } else {
      const entry = { ...card, _altCount: 1, _versions: [card] }
      seen.set(card.name, entry)
    }
  }
  
  return [...seen.values()].map(entry => {
    // Sort versions: Normal/Standard first, then others
    entry._versions.sort((a, b) => {
      // 1. Check for "Showcase" or "Alternate Art" or "Promo" flags in classification or tags
      const aIsAlt = (
        a.metadata?.alternate_art || 
        a.classification?.rarity === 'Promo' || 
        a.classification?.rarity === 'Showcase' ||
        a.tags?.some(t => {
          const tl = t.toLowerCase();
          return tl.includes('art') || tl.includes('showcase') || tl.includes('promo');
        })
      ) ? 1 : 0;
      
      const bIsAlt = (
        b.metadata?.alternate_art || 
        b.classification?.rarity === 'Promo' || 
        b.classification?.rarity === 'Showcase' ||
        b.tags?.some(t => {
          const tl = t.toLowerCase();
          return tl.includes('art') || tl.includes('showcase') || tl.includes('promo');
        })
      ) ? 1 : 0;
      
      if (aIsAlt !== bIsAlt) return aIsAlt - bIsAlt; // Normal (0) before Alt (1)
      
      // 2. Secondary: compare collector_number strings (numeric part)
      const aNum = parseInt(a.collector_number) || 999;
      const bNum = parseInt(b.collector_number) || 999;
      if (aNum !== bNum) return aNum - bNum;
      
      return (a.public_code || a.id).localeCompare(b.public_code || b.id);
    })
    
    // Use the first sorted version (Normal) as the representative card for the catalog
    const standard = entry._versions[0]
    return { 
      ...standard, 
      _altCount: entry._altCount,
      _versions: entry._versions
    }
  })
})

const visibleCards = computed(() => uniqueCards.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < uniqueCards.value.length)

const hasActiveFilters = computed(() =>
  searchQuery.value.trim() || selectedDomains.value.length > 0 || selectedTypes.value.length > 0 ||
  selectedRarities.value.length > 0 || selectedEnergy.value !== null
)

const resultsCount = computed(() => filteredCards.value.length)

watch([searchQuery, selectedDomains, selectedTypes, selectedRarities, selectedEnergy], () => {
  visibleCount.value = BATCH_SIZE
  nextTick(setupObserver)
}, { deep: true })

function toggleDomain(d) {
  const i = selectedDomains.value.indexOf(d)
  i === -1 ? selectedDomains.value.push(d) : selectedDomains.value.splice(i, 1)
}

function clearFilters() {
  searchQuery.value = ''
  selectedDomains.value = []
  selectedTypes.value = []
  selectedRarities.value = []
  selectedEnergy.value = null
}

function handleGlobalMouseMove(e) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

const previewPosition = computed(() => {
  if (!hoveredCard.value) return {}
  
  const width = 340
  const height = 480
  const padding = 20
  
  let left = mouseX.value + padding
  let top = mouseY.value - (height / 2)
  
  // Viewport bounds check
  if (left + width > window.innerWidth) {
    left = mouseX.value - width - padding
  }
  
  if (top < padding) top = padding
  if (top + height > window.innerHeight) top = window.innerHeight - height - padding
  
  return {
    left: `${left}px`,
    top: `${top}px`
  }
})

function setupObserver() {
  if (observer) observer.disconnect()
  if (!sentinel.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMore.value) {
      visibleCount.value += BATCH_SIZE
      nextTick(setupObserver)
    }
  }, { rootMargin: '200px' })
  observer.observe(sentinel.value)
}

watch(hoveredCard, (newCard) => {
  if (!newCard) return
})

async function fetchAllData() {
  loading.value = true
  error.value = null
  try {
    const c = await riftcodex.getCards()
    allCards.value = Array.isArray(c) ? c : []
    
    await nextTick()
    setupObserver()
  } catch (e) {
    error.value = t('common.something_went_wrong')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAllData()
  window.addEventListener('mousemove', handleGlobalMouseMove)
})
onBeforeUnmount(() => { 
  if (observer) observer.disconnect()
  window.removeEventListener('mousemove', handleGlobalMouseMove)
})
</script>

<style scoped>
.catalog { display: flex; flex-direction: column; gap: 12px; }

/* ── Header ── */
.catalog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.catalog-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--color-text-primary), var(--color-gold-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.catalog-subtitle { color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px; }

/* ── Search ── */
.catalog-search { position: relative; margin-bottom: 12px; }
.search-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--color-text-tertiary); pointer-events: none;
}
.search-input { padding-left: 44px; padding-right: 36px; height: 48px; border-radius: 12px; font-size: 1rem; }
.search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); }

/* ── Filter bar ── */
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}
.filter-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 4px 0;
}
.filter-scroll::-webkit-scrollbar { display: none; }

.filter-pill {
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.55;
  white-space: nowrap;
  flex-shrink: 0;
}
.filter-pill:hover { opacity: 0.8; }
.filter-pill--active { opacity: 1 !important; box-shadow: 0 0 0 1px currentColor; }

.filter-pill-energy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--color-bg-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-subtle);
}
.filter-pill-energy.filter-pill--active {
  background: rgba(74, 127, 255, 0.15);
  color: var(--color-rift-400);
  border-color: var(--color-rift-500);
}

.filter-selects {
  display: flex;
  gap: 6px;
  flex-wrap: wrap; /* allows multiple dropdowns to fit */
}

.clear-btn { align-self: flex-start; }

/* ── Cards grid ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}

.card-tile {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-md);
  background: var(--color-bg-raised);
  border: 1px solid var(--color-border-subtle);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  position: relative;
}
.card-tile:active {
  transform: scale(0.97);
}
.card-tile--champion {
  border-color: rgba(201, 168, 76, 0.3);
  box-shadow: 0 0 12px rgba(201, 168, 76, 0.08);
}

.card-image-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 744 / 1039;
  background: var(--color-bg-deep);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}
.card-image-wrap--landscape {
  aspect-ratio: 1039 / 744;
}

.alt-arts-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  font-size: 0.55rem;
  font-weight: 600;
  color: var(--color-gold-400);
  white-space: nowrap;
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.card-info { padding: 6px 8px 8px; }
.card-name {
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
}
.card-meta .rarity-badge { font-size: 0.55rem; padding: 1px 5px; }
.card-energy { font-size: 0.65rem; font-weight: 600; color: #fff; }

.card-hover-preview { display: none; } /* Hide on mobile to prevent DOM explosion */

/* ── Skeleton ── */
.card-skeleton {
  border-radius: var(--radius-md);
  background: var(--color-bg-raised);
}
.card-skeleton-img { 
  width: 100%; 
  aspect-ratio: 744 / 1039; 
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}
.card-image-wrap--landscape .card-skeleton-img {
  aspect-ratio: 1039 / 744;
}

/* ── Empty state ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 20px; text-align: center; gap: 10px;
}
.empty-icon { font-size: 2.5rem; }
.empty-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.empty-text { color: var(--color-text-secondary); font-size: 0.85rem; max-width: 320px; }

/* ── Loading more (infinite scroll) ── */
.loading-more {
  display: flex; align-items: center; justify-content: center;
  padding: 24px 0;
}
.loading-dots {
  display: flex; gap: 6px;
}
.loading-dots span {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--color-text-tertiary);
  animation: dot-pulse 1.2s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes dot-pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.1); }
}

/* ── Desktop enhancements ── */
@media (min-width: 769px) {
  .catalog-title { font-size: 1.8rem; }
  .cards-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
  .card-tile:hover { transform: translateY(-3px); box-shadow: var(--shadow-card-hover); z-index: 10; }
  .card-name { font-size: 0.8rem; }
  .card-info { padding: 8px 10px 10px; }

  /* Global Hover Preview */
  .global-card-preview {
    position: fixed;
    z-index: 9999;
    width: 340px;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(201,168,76,0.12);
    pointer-events: none;
    transition: opacity 0.1s ease-out;
  }
  .global-card-preview img {
    width: 100%;
    height: auto;
    display: block;
  }
}

/* Hide on mobile */
@media (max-width: 768px) {
  .global-card-preview { display: none !important; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
