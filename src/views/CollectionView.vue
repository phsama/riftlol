<template>
  <div class="collection fade-in">
    <!-- Unauthenticated state -->
    <div v-if="authStore.isInitialized && !authStore.user" class="empty-state login-prompt">
      <div style="font-size: 2.5rem; color: var(--color-text-tertiary); margin-bottom: 8px;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h3 class="empty-title">{{ $t('collection.login_prompt') }}</h3>
      <p class="empty-text">{{ $t('collection.login_desc') }}</p>
      <button class="btn btn-primary" style="margin-top: 12px;" @click="authStore.openLogin('login')">{{ $t('common.login') }}</button>
    </div>

    <div v-else>
      <!-- ── Header ── -->
      <header class="collection-header">
        <div class="header-content">
          <div>
            <h1 class="collection-title">{{ $t('collection.title') }}</h1>
            <p class="collection-subtitle" v-if="!loading && allCards.length">
              {{ $t('common.progress') }}: {{ collectionProgress.owned }} / {{ collectionProgress.total }}
            </p>
          </div>
          <button class="btn btn-secondary btn-sm export-trigger" @click="openExport" :disabled="loading || collectionStore.isLoading">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {{ $t('collection.export') }}
          </button>
        </div>
      </header>

      <!-- Search (always visible) -->
      <div class="collection-search">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          v-model="searchQuery"
          type="text"
          class="input search-input"
          :placeholder="$t('collection.search_placeholder')"
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
          >{{ e.label }}</button>
        </div>
        
        <!-- Only Owned toggle + Clear -->
        <div class="filter-scroll">
           <button
            class="filter-pill filter-pill-owned"
            :class="{ 'filter-pill--active': showOnlyOwned }"
            @click="showOnlyOwned = !showOnlyOwned"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><polyline points="20 6 9 17 4 12"/></svg>
            {{ $t('collection.only_owned') }}
          </button>
          <button v-if="hasActiveFilters" class="filter-pill filter-pill-clear" @click="clearFilters">✕ {{ $t('common.clear') }}</button>
        </div>
      </div>

      <!-- ── Loading ── -->
      <div v-if="loading || collectionStore.isLoading" class="cards-grid" style="min-height: 60vh;">
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
        <div
          v-for="card in displayCards"
          :key="card.id"
          class="card-tile collection-tile"
          :class="[
            { 'card-tile--champion': card.classification?.type === 'Legend' },
            { 'collection-unowned': collectionStore.getCardTotal(card.id) === 0 }
          ]"
        >
          <!-- Header: Name & Rarity -->
          <div class="tile-header">
            <h3 class="tile-name">{{ card.name }}</h3>
            <span v-if="card.classification?.rarity" class="rarity-badge" :class="`rarity-${card.classification.rarity.toLowerCase()}`">{{ card.classification.rarity }}</span>
          </div>

          <!-- Body: Image + Controls side by side -->
          <div class="tile-body">
            <div 
              class="tile-image-wrap"
              :class="[
                {'tile-image-wrap--landscape': card.orientation === 'landscape' || card.classification?.type === 'Battlefield'},
                {'foil-glow': card.is_display_foil}
              ]"
            >
              <img
                :src="card.display_media"
                :alt="card.name"
                class="card-image"
                loading="lazy"
              />
              <span v-if="card._altCount > 1" class="alt-arts-badge">🎨 {{ card._altCount }} artes</span>
            </div>

            <!-- Controls -->
            <div class="tile-controls">
              <div class="v-row" v-for="variant in [
                { key: 'normal', label: 'Normal', enabled: true, foilField: 'foil_qty' },
                { key: 'aart', label: 'AArt', enabled: hasAltArt(card), foilField: 'alt_art_foil_qty' },
                { key: 'signature', label: 'Sign', enabled: hasSignature(card), foilField: 'signed_foil_qty' },
                { key: 'over', label: 'Over', enabled: hasOvernumbered(card), foilField: 'overnumbered_foil_qty' }
              ]" :key="variant.key" :class="{ 'v-row-off': !variant.enabled }">
                <span class="v-label">{{ variant.label }}</span>
                <div class="v-stepper">
                  <button class="v-btn v-btn-minus" :disabled="!variant.enabled" @click="handleDecrement(card.id, variant.key)">−</button>
                  <span class="v-val" :class="{ 'v-val-foil': getQty(card.id, variant.foilField) > 0 }">
                    {{ getVariantTotal(card.id, variant.key) }}
                  </span>
                  <button class="v-btn" :disabled="!variant.enabled" @click="handleIncrement(card.id, variant.key, false)">+</button>
                  <button class="v-btn v-btn-gold" :disabled="!variant.enabled" @click="handleIncrement(card.id, variant.key, true)">✦</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Infinite scroll sentinel ── -->
      <div v-if="hasMore" ref="sentinel" class="loading-more">
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>


      <!-- ── Export Modal ── -->
      <div v-if="showExportModal" class="modal-overlay fade-in" @click.self="showExportModal = false">
        <div class="modal glass fade-in export-modal scrollable">
          <div class="modal-header">
            <h3>{{ $t('collection.export_title') }}</h3>
            <button class="btn-ghost" @click="showExportModal = false">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="export-hint">{{ $t('collection.export_hint') }}</p>

            <div v-if="isExporting" class="export-loading">
              <div class="spinner-sm"></div>
              <span>{{ $t('common.loading') }}</span>
            </div>
            
            <textarea 
              v-else
              readonly 
              class="export-textarea glass" 
              :value="exportText"
              ref="exportArea"
            ></textarea>
          </div>
          <div class="modal-footer export-modal-footer">
            <button class="btn btn-ghost btn-sm" @click="showExportModal = false">{{ $t('common.close') }}</button>
            <button class="btn btn-primary" @click="copyCollectionExport" :disabled="isExporting">{{ copyLabel }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, reactive } from 'vue'
import riftcodex from '@/services/riftcodex'
import { useAuthStore } from '@/stores/auth'
import { useCollectionStore } from '@/stores/collection'
import { exportCollection, copyToClipboard } from '@/composables/useDeckExport'
import MultiSelectDropdown from '@/components/MultiSelectDropdown.vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const authStore = useAuthStore()
const collectionStore = useCollectionStore()

const BATCH_SIZE = 24
const allCards = ref([])

const showExportModal = ref(false)
const isExporting = ref(false)
const exportText = ref('')
const copyLabel = ref(t('collection.copy_collection'))

async function openExport() {
  isExporting.value = true
  showExportModal.value = true
  try {
    exportText.value = await exportCollection(collectionStore.items, allCards.value, false)
  } finally {
    isExporting.value = false
  }
}

async function copyCollectionExport() {
  const ok = await copyToClipboard(exportText.value)
  copyLabel.value = ok ? `✓ ${t('common.copied')}` : t('common.error')
  setTimeout(() => { copyLabel.value = t('collection.copy_collection') }, 2500)
}

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
const showOnlyOwned = ref(false)

const availableDomains = ['Body', 'Calm', 'Chaos', 'Fury', 'Mind', 'Order', 'Colorless']

function getQty(cardId, field) {
    return collectionStore.items[cardId]?.[field] || 0
}

const hasAltArt = (c) => c._versions?.some(v => v.metadata?.alternate_art)
const hasOvernumbered = (c) => c._versions?.some(v => v.metadata?.overnumbered)
const hasSignature = (c) => c._versions?.some(v => v.metadata?.signature)
const hasSpecialArt = (card) => hasAltArt(card) || hasOvernumbered(card) || hasSignature(card)


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

const groupedCards = computed(() => {
  const seen = new Map()
  for (const card of allCards.value) {
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
      entry._versions.sort((a, b) => {
          const aIsAlt = (a.metadata?.alternate_art || a.classification?.rarity === 'Promo' || a.classification?.rarity === 'Showcase') ? 1 : 0;
          const bIsAlt = (b.metadata?.alternate_art || b.classification?.rarity === 'Promo' || b.classification?.rarity === 'Showcase') ? 1 : 0;
          if (aIsAlt !== bIsAlt) return aIsAlt - bIsAlt;
          const aNum = parseInt(a.collector_number) || 999;
          const bNum = parseInt(b.collector_number) || 999;
          if (aNum !== bNum) return aNum - bNum;
          return (a.public_code || a.id).localeCompare(b.public_code || b.id);
      })
      const standard = entry._versions[0]
      return { ...standard, _altCount: entry._altCount, _versions: entry._versions }
  })
})

const filteredCards = computed(() => {
  let result = [...groupedCards.value]
  if (showOnlyOwned.value) result = result.filter(c => collectionStore.getCardTotal(c.id) > 0)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter((c) => c.name.toLowerCase().includes(q) || c.text?.raw?.toLowerCase().includes(q))
  }
  if (selectedDomains.value.length > 0) result = result.filter((c) => c.classification?.domain?.some((d) => selectedDomains.value.includes(d)))
  if (selectedTypes.value.length > 0) result = result.filter((c) => selectedTypes.value.includes(c.classification?.type))
  if (selectedRarities.value.length > 0) result = result.filter((c) => selectedRarities.value.includes(c.classification?.rarity))
  if (selectedEnergy.value !== null) {
    result = selectedEnergy.value === 6 ? result.filter((c) => c.attributes?.energy >= 6) : result.filter((c) => c.attributes?.energy === selectedEnergy.value)
  }
  result.sort((a,b) => a.name.localeCompare(b.name))
  return result
})

const collectionProgress = computed(() => {
    let total = 0
    let owned = 0
    
    groupedCards.value.forEach(card => {
        // 1. Normal version
        total++
        if (getQty(card.id, 'normal_qty') > 0 || getQty(card.id, 'foil_qty') > 0) owned++
        
        // 2. Alt Art
        if (hasAltArt(card)) {
            total++
            if (getQty(card.id, 'alt_art_qty') > 0 || getQty(card.id, 'alt_art_foil_qty') > 0) owned++
        }
        
        // 3. Signature
        if (hasSignature(card)) {
            total++
            if (getQty(card.id, 'signed_qty') > 0 || getQty(card.id, 'signed_foil_qty') > 0) owned++
        }
        
        // 4. Overnumbered
        if (hasOvernumbered(card)) {
            total++
            if (getQty(card.id, 'overnumbered_qty') > 0 || getQty(card.id, 'overnumbered_foil_qty') > 0) owned++
        }
    })
    
    return { owned, total }
})

const visibleCards = computed(() => filteredCards.value.slice(0, visibleCount.value))

const displayCards = computed(() => {
  return visibleCards.value.map(baseCard => {
    const qty = collectionStore.items[baseCard.id] || {}
    let activeVersion = baseCard._versions[0]
    let isFoilActive = false

    // Priority: Signature > Overnumbered > Alt Art > Normal
    const signature = baseCard._versions.find(v => v.metadata?.signature === true || (v.tags?.some(t => t.toLowerCase().includes('sign'))))
    const overnumbered = baseCard._versions.find(v => v.collector_number && parseInt(v.collector_number) > 200) // Rough check for overnumbered
    const altArt = baseCard._versions.find((v, idx) => idx > 0 && v !== signature && v !== overnumbered)

    if (qty.signed_qty > 0 || qty.signed_foil_qty > 0) {
      if (signature) {
        activeVersion = signature
        isFoilActive = qty.signed_foil_qty > 0
      }
    } else if (qty.overnumbered_qty > 0 || qty.overnumbered_foil_qty > 0) {
      if (overnumbered) {
        activeVersion = overnumbered
        isFoilActive = qty.overnumbered_foil_qty > 0
      }
    } else if (qty.alt_art_qty > 0 || qty.alt_art_foil_qty > 0) {
      if (altArt) {
        activeVersion = altArt
        isFoilActive = qty.alt_art_foil_qty > 0
      }
    } else {
      isFoilActive = qty.foil_qty > 0
    }

    return { 
      ...baseCard, 
      display_media: activeVersion.media?.image_url,
      is_display_foil: isFoilActive 
    }
  })
})

function getVariantTotal(cardId, versionPrefix) {
  const qty = collectionStore.items[cardId] || {}
  const regKey = versionPrefix === 'normal' ? 'normal_qty' : `${versionPrefix}_qty`
  const foilKey = versionPrefix === 'normal' ? 'foil_qty' : `${versionPrefix}_foil_qty`
  return (qty[regKey] || 0) + (qty[foilKey] || 0)
}

function handleDecrement(cardId, versionPrefix) {
  const qty = collectionStore.items[cardId] || {}
  const regKey = versionPrefix === 'normal' ? 'normal_qty' : `${versionPrefix}_qty`
  const foilKey = versionPrefix === 'normal' ? 'foil_qty' : `${versionPrefix}_foil_qty`
  
  if ((qty[regKey] || 0) > 0) {
    collectionStore.updateItemQty(cardId, regKey, -1)
  } else if ((qty[foilKey] || 0) > 0) {
    collectionStore.updateItemQty(cardId, foilKey, -1)
  }
}

function handleIncrement(cardId, versionPrefix, isFoil = false) {
  let key = ''
  if (versionPrefix === 'normal') {
    key = isFoil ? 'foil_qty' : 'normal_qty'
  } else if (versionPrefix === 'aart') {
    key = isFoil ? 'alt_art_foil_qty' : 'alt_art_qty'
  } else if (versionPrefix === 'signature') {
    key = isFoil ? 'signed_foil_qty' : 'signed_qty'
  } else if (versionPrefix === 'over') {
    key = isFoil ? 'overnumbered_foil_qty' : 'overnumbered_qty'
  }
  
  if (key) {
    collectionStore.updateItemQty(cardId, key, 1)
  }
}

const hasMore = computed(() => visibleCount.value < filteredCards.value.length)
const hasActiveFilters = computed(() => searchQuery.value.trim() || selectedDomains.value.length > 0 || selectedTypes.value.length > 0 || selectedRarities.value.length > 0 || selectedEnergy.value !== null || showOnlyOwned.value)

watch([searchQuery, selectedDomains, selectedTypes, selectedRarities, selectedEnergy, showOnlyOwned], () => {
  visibleCount.value = BATCH_SIZE
  nextTick(setupObserver)
}, { deep: true })

watch(() => authStore.user, (user) => { if (user && !collectionStore.initialized) collectionStore.loadCollection() }, { immediate: true })

function toggleDomain(d) {
  const i = selectedDomains.value.indexOf(d)
  i === -1 ? selectedDomains.value.push(d) : selectedDomains.value.splice(i, 1)
}

function clearFilters() { searchQuery.value = ''; selectedDomains.value = []; selectedTypes.value = []; selectedRarities.value = []; selectedEnergy.value = null; showOnlyOwned.value = false; }
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

async function fetchAllData(force = false) {
  if (!force && allCards.value.length > 0) {
    // Already loaded, just setup observer
    await nextTick()
    setupObserver()
    return
  }
  loading.value = true
  error.value = null
  try {
    const c = await riftcodex.getCards()
    allCards.value = Array.isArray(c) ? c : []
    await nextTick()
    setupObserver()
  } catch (e) { error.value = t('common.something_went_wrong') } finally { loading.value = false }
}

onMounted(() => { fetchAllData(); })
onBeforeUnmount(() => { if (observer) observer.disconnect(); })
</script>

<style scoped>
.collection { display: flex; flex-direction: column; gap: 12px; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(6, 6, 16, 0.85); display: flex;
  align-items: center; justify-content: center;
  padding: 20px;
}
.modal {
  width: 100%; max-width: 500px; padding: 24px 20px;
  border-radius: var(--radius-xl);
  display: flex; flex-direction: column; gap: 14px;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
}
.modal-header h3 {
  font-family: var(--font-display); font-size: 1.05rem; font-weight: 700;
}
.modal-body { display: flex; flex-direction: column; gap: 12px; }
.modal-footer { display: flex; gap: 8px; justify-content: flex-end; }

/* ── Header ── */
.collection-header { margin-bottom: 24px; }
.header-content { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.collection-title { font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; background: linear-gradient(135deg, var(--color-text-primary), var(--color-gold-400)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.collection-subtitle { color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px; }

/* ── Export ── */
.export-trigger svg { margin-right: 6px; }
.export-modal { max-width: 500px; }
.export-modal-footer { 
  display: flex; 
  align-items: center; 
  justify-content: flex-end; 
  gap: 12px; 
  padding: 16px; 
  border-top: 1px solid var(--color-border-subtle);
  background: rgba(255, 255, 255, 0.02);
}
.export-hint { font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 16px; line-height: 1.5; }
.export-options { margin-bottom: 16px; padding: 12px; background: rgba(255, 255, 255, 0.03); border-radius: var(--radius-md); }
.export-textarea { width: 100%; height: 260px; font-family: monospace; font-size: 0.85rem; padding: 12px; resize: none; }
.export-loading { height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; background: rgba(0, 0, 0, 0.2); border-radius: var(--radius-lg); color: var(--primary); }

/* ── Search & Filters ── */
.collection-search { position: relative; margin-bottom: 12px; }
.search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--color-text-tertiary); pointer-events: none; }
.search-input { padding-left: 44px; padding-right: 36px; height: 48px; border-radius: 12px; }
.search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); }

.filter-bar { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.filter-scroll { display: flex; gap: 10px; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; padding: 4px 0; }
.filter-scroll::-webkit-scrollbar { display: none; }
.filter-pill { cursor: pointer; transition: all 0.2s ease; opacity: 0.55; white-space: nowrap; flex-shrink: 0; }
.filter-pill--active { opacity: 1 !important; box-shadow: 0 0 0 1px currentColor; }
.filter-pill-owned { display: inline-flex; align-items: center; justify-content: center; padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; background: var(--color-bg-surface); color: var(--color-text-secondary); border: 1px solid var(--color-border-subtle); }
.filter-pill-owned.filter-pill--active { background: rgba(250, 189, 47, 0.15); color: #fabd2f; border-color: rgba(250, 189, 47, 0.6); }
.filter-pill-clear { display: inline-flex; align-items: center; justify-content: center; padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; background: rgba(255, 80, 80, 0.1); color: #ff6b6b; border: 1px solid rgba(255, 80, 80, 0.3); cursor: pointer; transition: all 0.2s; opacity: 1; white-space: nowrap; flex-shrink: 0; }
.filter-pill-clear:hover { background: rgba(255, 80, 80, 0.2); border-color: rgba(255, 80, 80, 0.5); }
.filter-pill-energy { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; background: var(--color-bg-surface); color: var(--color-text-secondary); border: 1px solid var(--color-border-subtle); }
.filter-pill-energy.filter-pill--active { background: rgba(74, 127, 255, 0.15); color: var(--color-rift-400); border-color: var(--color-rift-500); }
.filter-selects { display: flex; gap: 8px; flex-wrap: wrap; }

/* ── Cards grid ── */
.cards-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fill, minmax(460px, 1fr)); 
  gap: 16px; 
}

/* ── Card Tile ── */
.collection-tile {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-raised);
  border: 1px solid var(--color-border-subtle);
  border-radius: 12px;
  transition: all 0.25s ease;
  overflow: hidden;
  max-width: 540px;
}

.collection-tile:hover {
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}

/* ── Tile Header ── */
.tile-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255, 255, 255, 0.02);
}

.tile-name {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
}

/* ── Tile Body ── */
.tile-body {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex: 1;
}

/* ── Image ── */
.tile-image-wrap {
  position: relative;
  width: 180px;
  min-height: 252px;
  flex-shrink: 0;
  background: #000;
  overflow: hidden;
}

.tile-image-wrap--landscape {
  width: 220px;
}

.tile-image-wrap .card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ── Controls ── */
.tile-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  min-width: 0;
}

.v-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v-label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
  width: 52px;
  flex-shrink: 0;
  letter-spacing: 0.08em;
}

.v-stepper {
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.35);
  border-radius: 8px;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  gap: 1px;
}

.v-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 6px;
}

.v-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.v-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.v-btn:disabled {
  opacity: 0.2;
  cursor: default;
}

.v-btn-gold {
  color: #fbbf24 !important;
  background: rgba(251, 191, 36, 0.06) !important;
  font-size: 0.8rem;
}

.v-btn-gold:hover:not(:disabled) {
  background: rgba(251, 191, 36, 0.18) !important;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.15);
}

.v-val {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 900;
  text-align: center;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.9);
  min-width: 24px;
}

.v-val-foil {
  color: #fbbf24;
  text-shadow: 0 0 6px rgba(251, 191, 36, 0.35);
}

.v-row-off {
  opacity: 0.12;
  pointer-events: none;
  filter: grayscale(1);
}

/* ── Foil Glow ── */
.foil-glow {
  position: relative;
  isolation: isolate;
  box-shadow: 0 0 12px 2px rgba(255, 215, 0, 0.25), 0 0 24px 4px rgba(255, 215, 0, 0.1);
}
.foil-glow::after { 
  content: ''; 
  position: absolute; 
  inset: 0; 
  background: linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.4) 30%, rgba(255, 215, 0, 0.2) 45%, transparent 80%); 
  background-size: 200% 100%;
  mix-blend-mode: color-dodge; 
  opacity: 0.75; 
  animation: foil-shine 3s linear infinite; 
  pointer-events: none; 
  z-index: 2;
}
@keyframes foil-shine { 
  0% { background-position: 200% center; } 
  100% { background-position: -200% center; } 
}

.loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@media (min-width: 1600px) {
  .cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .global-card-preview { display: none !important; }
  .cards-grid { 
    grid-template-columns: 1fr; 
    gap: 10px; 
  }
  
  .tile-image-wrap {
    width: 120px;
  }

  .tile-image-wrap--landscape {
    width: 140px;
  }
  
  .tile-name {
    font-size: 0.9rem;
  }
  
  .tile-controls {
    padding: 8px;
  }
  
  .v-label {
    width: 40px;
    font-size: 0.6rem;
  }

  .v-btn {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }

  .export-trigger span { display: none; }
  
  .export-modal { 
    max-width: 95vw; 
    max-height: 85vh;
  }
  .export-modal-footer {
    flex-direction: column-reverse;
    gap: 12px;
    padding: 16px;
  }
  .export-modal-footer .btn {
    width: 100%;
    height: 48px;
  }
}

/* Extra small mobile */
@media (max-width: 400px) {
  .v-label {
    display: none;
  }
}
</style>
