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
              {{ $t('common.progress') }}: {{ uniqueCardsOwned }} / {{ groupedCards.length }}
            </p>
          </div>
          <button class="btn btn-secondary btn-sm export-trigger" @click="showExportModal = true" :disabled="loading || uniqueCardsOwned === 0">
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
          >⚡{{ e.label }}</button>
        </div>
        
        <!-- Only Owned toggle -->
        <div class="filter-scroll">
           <button
            class="filter-pill filter-pill-owned"
            :class="{ 'filter-pill--active': showOnlyOwned }"
            @click="showOnlyOwned = !showOnlyOwned"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px"><polyline points="20 6 9 17 4 12"/></svg>
            {{ $t('collection.only_owned') }}
          </button>
        </div>

        <button v-if="hasActiveFilters" class="btn btn-ghost btn-sm clear-btn" @click="clearFilters">✕ {{ $t('common.clear') }}</button>
      </div>

      <!-- ── Loading ── -->
      <div v-if="loading || collectionStore.isLoading" class="cards-grid">
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
          <div 
            class="card-image-wrap"
            :class="[
              {'card-image-wrap--landscape': card.orientation === 'landscape' || card.classification?.type === 'Battlefield'},
              {'foil-glow': getQty(card.id, 'foil_qty') > 0 || getQty(card.id, 'alt_art_foil_qty') > 0 || getQty(card.id, 'overnumbered_foil_qty') > 0}
            ]"
          >
            <img
              :src="card.media?.image_url"
              :alt="card.name"
              class="card-image"
              loading="lazy"
            />
            <span v-if="card._altCount > 1" class="alt-arts-badge">🎨 {{ card._altCount }} artes</span>
            
            <div class="collection-overlay-actions">
              <button class="col-add-btn" @click.prevent="collectionStore.updateItemQty(card.id, 'normal_qty', 1)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            </div>
          </div>
          <div class="card-info">
            <h3 class="card-name">{{ card.name }}</h3>
            <div class="card-meta">
              <span v-if="card.classification?.rarity" class="rarity-badge" :class="`rarity-${card.classification.rarity.toLowerCase()}`">{{ card.classification.rarity }}</span>
              <span v-if="card.attributes?.energy != null" class="card-energy">⚡{{ card.attributes.energy }}</span>
            </div>
            
            <!-- Collection controls -->
            <div class="collection-controls">
                <!-- Base Variant (Aggregated) -->
                <div class="variant-row" :class="{'variant-row--active': getQty(card.id, 'normal_qty') + getQty(card.id, 'foil_qty') > 0}">
                    <span class="variant-label">{{ $t('collection.normal') }}</span>
                    <div class="variant-stepper">
                        <button class="step-btn" @click="removeSmart(card.id, 'normal_qty', 'foil_qty')">−</button>
                        <span class="step-val">{{ getQty(card.id, 'normal_qty') + getQty(card.id, 'foil_qty') }}</span>
                        <button class="step-btn step-add" @click="collectionStore.updateItemQty(card.id, 'normal_qty', 1)">+</button>
                    </div>
                </div>
                <!-- Alt Art Variant (Aggregated) -->
                <div class="variant-row" :class="{'variant-row--active': getQty(card.id, 'alt_art_qty') + getQty(card.id, 'alt_art_foil_qty') > 0, 'variant-row--disabled': !hasAltArt(card)}">
                    <span class="variant-label v-alt">{{ $t('collection.aart') }}</span>
                    <div class="variant-stepper">
                        <button class="step-btn" :disabled="!hasAltArt(card)" @click="removeSmart(card.id, 'alt_art_qty', 'alt_art_foil_qty')">−</button>
                        <span class="step-val">{{ getQty(card.id, 'alt_art_qty') + getQty(card.id, 'alt_art_foil_qty') }}</span>
                        <button class="step-btn step-add" :disabled="!hasAltArt(card)" @click="collectionStore.updateItemQty(card.id, 'alt_art_qty', 1)">+</button>
                    </div>
                </div>
                <!-- Overnumbered/Signed Variant (Aggregated) -->
                <div class="variant-row" :class="{'variant-row--active': getQty(card.id, 'overnumbered_qty') + getQty(card.id, 'overnumbered_foil_qty') > 0, 'variant-row--disabled': !hasSigned(card)}">
                    <span class="variant-label v-sign">{{ $t('collection.over') }}</span>
                    <div class="variant-stepper">
                        <button class="step-btn" :disabled="!hasSigned(card)" @click="removeSmart(card.id, 'overnumbered_qty', 'overnumbered_foil_qty')">−</button>
                        <span class="step-val">{{ getQty(card.id, 'overnumbered_qty') + getQty(card.id, 'overnumbered_foil_qty') }}</span>
                        <button class="step-btn step-add" :disabled="!hasSigned(card)" @click="collectionStore.updateItemQty(card.id, 'overnumbered_qty', 1)">+</button>
                    </div>
                </div>
                
                <button class="manage-btn" @click.prevent="managingCard = card">
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                   <span>{{ $t('collection.manage_variants') }}</span>
                </button>
            </div>
            
          </div>
        </div>
      </div>

      <!-- ── Infinite scroll sentinel ── -->
      <div v-if="hasMore" ref="sentinel" class="loading-more">
        <div class="loading-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
    
    <!-- ── Manage Variants Modal ── -->
    <Teleport to="body">
      <div v-if="managingCard" class="modal-overlay fade-in" @click="managingCard = null">
        <div class="manage-modal stagger-enter" @click.stop>
          <div class="modal-header">
          <h3>{{ $t('collection.variants_title') }}</h3>
          <button class="btn-ghost" @click="managingCard = null">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div class="modal-body">
           <!-- Normal Group -->
           <div class="manage-group">
              <h5 class="manage-group-title">{{ $t('collection.normal_art') }}</h5>
              <div class="manage-row">
                 <span class="manage-label">{{ $t('collection.normal') }}</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'normal_qty', -1)">−</button>
                    <span class="step-val">{{ getQty(managingCard.id, 'normal_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'normal_qty', 1)">+</button>
                 </div>
              </div>
              <div class="manage-row foil-row">
                 <span class="manage-label manage-label-foil">{{ $t('collection.foil') }}</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'foil_qty', -1)">−</button>
                    <span class="step-val">{{ getQty(managingCard.id, 'foil_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'foil_qty', 1)">+</button>
                 </div>
              </div>
           </div>

           <!-- AArt Group -->
           <div class="manage-group" v-if="hasAltArt(managingCard)">
              <h5 class="manage-group-title v-alt">{{ $t('collection.alt_art') }}</h5>
              <div class="manage-row">
                 <span class="manage-label">{{ $t('collection.normal_aart') }}</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'alt_art_qty', -1)">−</button>
                    <span class="step-val">{{ getQty(managingCard.id, 'alt_art_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'alt_art_qty', 1)">+</button>
                 </div>
              </div>
              <div class="manage-row foil-row">
                 <span class="manage-label manage-label-foil">{{ $t('collection.aart_foil') }}</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'alt_art_foil_qty', -1)">−</button>
                    <span class="step-val">{{ getQty(managingCard.id, 'alt_art_foil_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'alt_art_foil_qty', 1)">+</button>
                 </div>
              </div>
           </div>

           <!-- Overnumbered Group -->
           <div class="manage-group" v-if="hasSigned(managingCard)">
              <h5 class="manage-group-title v-sign">{{ $t('collection.overnumbered_title') }}</h5>
              <div class="manage-row">
                 <span class="manage-label">{{ $t('collection.normal_over') }}</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'overnumbered_qty', -1)">−</button>
                    <span class="step-val">{{ getQty(managingCard.id, 'overnumbered_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'overnumbered_qty', 1)">+</button>
                 </div>
              </div>
              <div class="manage-row foil-row">
                 <span class="manage-label manage-label-foil">{{ $t('collection.over_foil') }}</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'overnumbered_foil_qty', -1)">−</button>
                    <span class="step-val">{{ getQty(managingCard.id, 'overnumbered_foil_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'overnumbered_foil_qty', 1)">+</button>
                 </div>
              </div>
           </div>
        </div>
      </div>
      </div>
    </Teleport>
    <!-- ── Export Modal ── -->
    <Teleport to="body">
      <div v-if="showExportModal" class="modal-overlay fade-in" @click.self="showExportModal = false">
        <div class="modal glass fade-in export-modal">
          <div class="modal-header">
            <h3>{{ $t('collection.export_title') }}</h3>
          </div>
          <div class="modal-body">
             <p class="export-hint">{{ $t('collection.export_hint') }}</p>
             <div class="export-preview">
                <pre class="export-text">{{ exportedText }}</pre>
             </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showExportModal = false">{{ $t('common.close') }}</button>
            <button class="btn btn-primary" @click="copyCollectionExport">{{ copyLabel }}</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { getCards } from '@/services/riftcodex'
import { useAuthStore } from '@/stores/auth'
import { useCollectionStore } from '@/stores/collection'
import { exportCollection, copyToClipboard } from '@/composables/useDeckExport'
import MultiSelectDropdown from '@/components/MultiSelectDropdown.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const authStore = useAuthStore()
const collectionStore = useCollectionStore()

const BATCH_SIZE = 24
const allCards = ref([])

const showExportModal = ref(false)
const copyLabel = ref(t('collection.copy_collection'))

const exportedText = computed(() => {
    return exportCollection(collectionStore.items, allCards.value)
})

async function copyCollectionExport() {
    const ok = await copyToClipboard(exportedText.value)
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
const managingCard = ref(null)

const availableDomains = ['Body', 'Calm', 'Chaos', 'Fury', 'Mind', 'Order', 'Colorless']

function getQty(cardId, field) {
    return collectionStore.items[cardId]?.[field] || 0
}

function removeSmart(cardId, baseField, foilField) {
    const baseQty = getQty(cardId, baseField)
    if (baseQty > 0) {
        collectionStore.updateItemQty(cardId, baseField, -1)
    } else {
        const foilQty = getQty(cardId, foilField)
        if (foilQty > 0) {
            collectionStore.updateItemQty(cardId, foilField, -1)
        }
    }
}

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

// Deduplicate by name, keeping first version and organizing versions across ALL cards
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
          
          if (aIsAlt !== bIsAlt) return aIsAlt - bIsAlt; // Normal (0) comes before Alt (1)
          
          // 2. Secondary: compare collector_number strings (numeric part)
          const aNum = parseInt(a.collector_number) || 999;
          const bNum = parseInt(b.collector_number) || 999;
          if (aNum !== bNum) return aNum - bNum;
          
          // 3. Fallback: alphanumerical sort on public_code or id
          return (a.public_code || a.id).localeCompare(b.public_code || b.id);
      })
      
      const standard = entry._versions[0]
      return { 
          ...standard, 
          _altCount: entry._altCount, 
          _versions: entry._versions 
      }
  })
})

const filteredCards = computed(() => {
  // Always work with a fresh copy to avoid mutating the original groupedCards array
  let result = [...groupedCards.value]
  
  if (showOnlyOwned.value) {
      result = result.filter(c => collectionStore.getCardTotal(c.id) > 0)
  }
  
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    result = result.filter((c) => {
      return c.name.toLowerCase().includes(q) ||
             c.text?.raw?.toLowerCase().includes(q) ||
             c.text?.rich?.toLowerCase().includes(q) ||
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
  
  // Sort alphabetically typically for Album
  result.sort((a,b) => a.name.localeCompare(b.name))
  return result
})

const uniqueCardsOwned = computed(() => {
    let count = 0;
    groupedCards.value.forEach(c => {
        if (collectionStore.getCardTotal(c.id) > 0) count++;
    })
    return count;
})

const visibleCards = computed(() => filteredCards.value.slice(0, visibleCount.value))

// Helpers to know if variants exist
const hasAltArt = (card) => card._versions.length > 1

const hasSigned = (card) => {
    return card._versions.some(v => 
        (v.tags && v.tags.some(t => t.toLowerCase().includes('sign'))) || 
        v.metadata?.signature === true
    )
}

// Map visibleCards to display alternative arts if the user owns them
const displayCards = computed(() => {
  return visibleCards.value.map(baseCard => {
    const qty = collectionStore.items[baseCard.id] || {}
    let activeVersion = baseCard._versions[0] // Default to Normal (index 0 after sort)
    
    const hasAnySigned = qty.signed_qty > 0 || qty.overnumbered_qty > 0 || qty.overnumbered_foil_qty > 0
    const hasAnyAltArt = qty.alt_art_qty > 0 || qty.alt_art_foil_qty > 0
    
    // IF user has Signed copies, show the signed version if it exists
    if (hasAnySigned) {
       const signed = baseCard._versions.find(v => 
          (v.tags?.some(t => t.toLowerCase().includes('sign') || t.toLowerCase().includes('over'))) || 
          v.metadata?.signature === true
       )
       if (signed) activeVersion = signed
    } 
    // ELSE IF user has Alt Art copies, show the first Alt Art version (index 1+)
    else if (hasAnyAltArt && baseCard._versions.length > 1) {
       const altArt = baseCard._versions.find((v, idx) => idx > 0)
       if (altArt) activeVersion = altArt
    }
    
    return {
      ...baseCard,
      media: { ...baseCard.media, image_url: activeVersion.media?.image_url }
    }
  })
})

const hasMore = computed(() => visibleCount.value < filteredCards.value.length)

const hasActiveFilters = computed(() =>
  searchQuery.value.trim() || selectedDomains.value.length > 0 || selectedTypes.value.length > 0 ||
  selectedRarities.value.length > 0 || selectedEnergy.value !== null ||
  showOnlyOwned.value
)

watch([searchQuery, selectedDomains, selectedTypes, selectedRarities, selectedEnergy, showOnlyOwned], () => {
  visibleCount.value = BATCH_SIZE
  nextTick(setupObserver)
}, { deep: true })

// Fetch user collection on Auth change or mount
watch(() => authStore.user, (user) => {
    if (user && !collectionStore.initialized) {
        collectionStore.loadCollection()
    }
}, { immediate: true })

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
  showOnlyOwned.value = false
}

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

async function fetchAllData() {
  loading.value = true
  error.value = null
  try {
    const c = await getCards()
    allCards.value = Array.isArray(c) ? c : []
    
    await nextTick()
    setupObserver()
  } catch (e) {
    error.value = t('common.something_went_wrong')
  } finally {
    loading.value = false
  }
}

onMounted(fetchAllData)
onBeforeUnmount(() => { if (observer) observer.disconnect() })
</script>

<style scoped>
.collection { display: flex; flex-direction: column; gap: 12px; }

/* ── Header ── */
.collection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.collection-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--color-text-primary), var(--color-gold-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.collection-subtitle { color: var(--color-text-secondary); font-size: 0.85rem; margin-top: 4px; }

/* ── Empty auth state ── */
.login-prompt { padding: 60px 20px; text-align: center; display:flex; flex-direction:column; align-items:center; }

/* ── Search & Filters ── */
.collection-search { position: relative; margin-bottom: 12px; }
.search-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--color-text-tertiary); pointer-events: none;
}
.search-input { padding-left: 44px; padding-right: 36px; height: 48px; border-radius: 12px; font-size: 1rem; }
.search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); }

.filter-bar { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.filter-scroll {
  display: flex; gap: 10px; overflow-x: auto;
  -webkit-overflow-scrolling: touch; scrollbar-width: none;
  padding-bottom: 4px;
}
.filter-scroll::-webkit-scrollbar { display: none; }

.filter-pill {
  cursor: pointer; transition: all 0.2s ease;
  opacity: 0.55; white-space: nowrap; flex-shrink: 0;
}
.filter-pill:hover { opacity: 0.8; }
.filter-pill--active { opacity: 1 !important; box-shadow: 0 0 0 1px currentColor; }

.filter-pill-owned {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 4px 12px; border-radius: var(--radius-full);
  font-size: 0.72rem; font-weight: 700;
  background: var(--color-bg-surface); color: var(--color-text-secondary);
  border: 1px solid var(--color-border-subtle);
}
.filter-pill-owned.filter-pill--active {
  background: rgba(34, 197, 94, 0.15); /* Subtle green background */
  color: #fabd2f; /* Premium gold-yellow */
  border-color: rgba(250, 189, 47, 0.6); /* Semi-transparent gold border */
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.1); 
}

.filter-pill-energy {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 4px 10px; border-radius: var(--radius-full);
  font-size: 0.72rem; font-weight: 700;
  background: var(--color-bg-surface); color: var(--color-text-secondary);
  border: 1px solid var(--color-border-subtle);
}
.filter-pill-energy.filter-pill--active {
  background: rgba(74, 127, 255, 0.15); color: var(--color-rift-400); border-color: var(--color-rift-500);
}

.filter-selects {
  display: flex; gap: 6px; flex-wrap: wrap; /* allows multiple dropdowns to fit */
}

.clear-btn { align-self: flex-start; }

/* ── Cards grid ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.card-tile {
  display: flex; flex-direction: column;
  border-radius: var(--radius-md); background: var(--color-bg-raised);
  border: 1px solid var(--color-border-subtle);
  transition: all 0.2s ease; position: relative;
}
.card-tile--champion { border-color: rgba(201, 168, 76, 0.3); }

/* Ownership grayscale toggle */
.collection-unowned {
    opacity: 0.9;
}
.collection-unowned .card-image {
    filter: grayscale(100%) opacity(0.4);
}
.collection-unowned .card-hover-preview img {
    filter: grayscale(100%) opacity(0.8);
}
.collection-unowned .collection-controls {
    opacity: 0.5;
}

.card-image-wrap {
  position: relative; width: 100%; aspect-ratio: 744 / 1039;
  background: var(--color-bg-deep); border-radius: var(--radius-md) var(--radius-md) 0 0;
  overflow: hidden;
}
.card-image-wrap--landscape { aspect-ratio: 1039 / 744; }

/* Foil Glow Effect */
.foil-glow::after {
  content: '';
  position: absolute; inset: 0;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: linear-gradient(
    115deg, 
    transparent 20%, 
    rgba(255, 255, 255, 0.7) 30%, 
    rgba(255, 215, 0, 0.4) 45%, 
    rgba(255, 50, 255, 0.4) 55%, 
    rgba(100, 200, 255, 0.4) 70%, 
    transparent 80%
  );
  mix-blend-mode: color-dodge;
  opacity: 0.75;
  background-size: 200% auto;
  pointer-events: none;
  z-index: 5;
  animation: foil-shine 3s linear infinite;
}

@keyframes foil-shine {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}

.alt-arts-badge {
  position: absolute; bottom: 4px; right: 4px; padding: 2px 6px;
  border-radius: var(--radius-full); background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  font-size: 0.55rem; font-weight: 600; color: var(--color-gold-400); white-space: nowrap;
  z-index: 10;
}
.card-image {
  width: 100%; height: 100%; object-fit: cover;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  transition: filter 0.3s;
}

/* Quick add overlay */
.collection-overlay-actions {
    position: absolute; inset: 0; display:flex; align-items:center; justify-content:center;
    background: rgba(0,0,0,0.4); opacity: 0; transition: opacity 0.2s;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    z-index: 10;
}
.card-image-wrap:hover .collection-overlay-actions {
    opacity: 1;
}
.col-add-btn {
    width: 48px; height: 48px; border-radius: 50%;
    background: var(--color-rift-500); color: white; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transform: scale(0.9); transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(74, 127, 255, 0.4);
}
.col-add-btn:hover { transform: scale(1.05); background: var(--color-rift-400); }

.card-info { padding: 8px 10px 10px; display:flex; flex-direction:column; flex:1; }
.card-name { font-size: 0.8rem; font-weight: 600; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.card-meta { display: flex; align-items: center; gap: 4px; margin-top: 3px; margin-bottom: 12px; }
.card-meta .rarity-badge { font-size: 0.55rem; padding: 1px 5px; }
.card-energy { font-size: 0.65rem; font-weight: 600; color: var(--color-rift-400); }

/* Control panel */
.collection-controls {
    display: flex; flex-direction: column; gap: 4px;
    margin-top: auto; padding-top: 8px; border-top: 1px solid var(--color-border-subtle);
    transition: opacity 0.3s;
}

.manage-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    background: transparent; border: 1px solid var(--color-border-subtle);
    color: var(--color-text-secondary); border-radius: 4px; padding: 4px;
    font-size: 0.65rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
    margin-top: 2px;
}
.manage-btn:hover { background: rgba(255,255,255,0.05); color: var(--color-text-primary); }

.variant-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 3px 6px; border-radius: 4px; background: rgba(0,0,0,0.1);
    transition: background 0.2s;
}
.variant-row--active {
    background: rgba(255,255,255,0.06);
}
.variant-row--disabled {
    opacity: 0.25;
    pointer-events: none;
    filter: grayscale(100%);
}
.variant-label { font-size: 0.6rem; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; }
.variant-row--active .variant-label { color: var(--color-text-primary); }
.variant-row--active .v-foil { color: var(--color-gold-400) !important; text-shadow: 0 0 6px rgba(201,168,76,0.3);}
.variant-row--active .v-alt { color: #d67cf2 !important; }
.variant-row--active .v-sign { color: #50b88a !important; }

.variant-stepper { display: flex; align-items: center; gap: 6px; }
.step-val { font-family: var(--font-display); font-size: 0.75rem; font-weight: 700; width: 14px; text-align: center; }
.variant-row--active .step-val { color: var(--color-text-primary); }
.step-btn {
    width: 20px; height: 20px; border:none; border-radius:3px;
    background: var(--color-bg-surface); color: var(--color-text-secondary);
    display:flex; align-items:center; justify-content:center; font-weight:700; font-family: var(--font-body);
    cursor:pointer; transition:all 0.15s;
}
.step-btn:hover { background: var(--color-border-subtle); color: var(--color-text-primary); }
.step-add { color: var(--color-text-primary); }
.step-add:hover { background: rgba(74, 127, 255, 0.2); color: var(--color-rift-400); }

/* ── Skeleton ── */
.card-skeleton { border-radius: var(--radius-md); background: var(--color-bg-raised); }
.card-skeleton-img { width: 100%; aspect-ratio: 744 / 1039; border-radius: var(--radius-md) var(--radius-md) 0 0;}

/* ── Empty state ── */
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 48px 20px; text-align: center; gap: 10px; }
.empty-icon { font-size: 2.5rem; }
.empty-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.empty-text { color: var(--color-text-secondary); font-size: 0.85rem; max-width: 320px; }

/* ── Manage Variants Modal ── */
.modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
    display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px;
}
.manage-modal {
    background: var(--color-bg-deep); border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-lg); width: 100%; max-width: 360px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5); overflow: hidden;
}
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--color-border-subtle); background: var(--color-bg-surface); }
.modal-header h3 { font-size: 1rem; font-weight: 700; }
.modal-body { padding: 16px; display: flex; flex-direction: column; gap: 16px; max-height: 70vh; overflow-y: auto; }
.manage-group { display: flex; flex-direction: column; gap: 6px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
.manage-group-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); font-weight: 700; margin-bottom: 4px; }
.v-alt { color: #d67cf2 !important; }
.v-sign { color: #50b88a !important; }
.manage-row { display: flex; justify-content: space-between; align-items: center; }
.foil-row { margin-top: 4px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.05); }
.manage-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text-secondary); }
.manage-label-foil { color: var(--color-gold-400); text-shadow: 0 0 6px rgba(201,168,76,0.3); }

/* ── Loading more (infinite scroll) ── */
.loading-more { display: flex; align-items: center; justify-content: center; padding: 24px 0; }
.loading-dots { display: flex; gap: 6px; }
.loading-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-tertiary); animation: dot-pulse 1.2s ease-in-out infinite; }
.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes dot-pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.1); } }

/* ── Desktop enhancements ── */
@media (min-width: 769px) {
  .collection-title { font-size: 1.8rem; }
  .cards-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
}
/* ── Export Modal Specifics ── */
.export-modal {
    max-width: 500px;
    display: flex;
    flex-direction: column;
}
.export-hint {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    margin-bottom: 12px;
}
.export-preview {
    background: var(--color-bg-deep);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    padding: 12px;
    max-height: 300px;
    overflow-y: auto;
}
.export-text {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.75rem;
    line-height: 1.6;
    white-space: pre-wrap;
    margin: 0;
}
.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid var(--color-border-subtle);
}
.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}
.export-trigger svg {
    margin-right: 6px;
}
@media (max-width: 600px) {
    .header-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    .export-trigger {
        width: 100%;
        justify-content: center;
    }
}
</style>
