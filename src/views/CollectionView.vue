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
          <button class="btn btn-secondary btn-sm export-trigger" @click="openExport" :disabled="loading || collectionProgress.owned === 0">
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
              @mouseenter="hoveredCard = card"
              @mouseleave="hoveredCard = null"
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
            
            <!-- Matrix Collection Controls with Foil Mode -->
            <div class="collection-controls-matrix">
                <div class="matrix-header">
                    <button 
                        class="foil-toggle-btn" 
                        :class="{ 'foil-active': isFoilMode(card.id) }"
                        @click.prevent="toggleFoilMode(card.id)"
                    >
                        <span>{{ isFoilMode(card.id) ? '⭐ FOIL MODE' : '⭐ REGULAR' }}</span>
                    </button>
                </div>

                <!-- Normal Row -->
                <div class="v-matrix-clean-row">
                    <span class="v-matrix-label">{{ $t('collection.normal') }}</span>
                    <div class="v-matrix-stepper-mini" :class="{ 'mode-foil': isFoilMode(card.id) }">
                        <button class="v-qty-btn" @click="collectionStore.updateItemQty(card.id, isFoilMode(card.id) ? 'foil_qty' : 'normal_qty', -1)">−</button>
                        <span class="v-qty-val">{{ getQty(card.id, isFoilMode(card.id) ? 'foil_qty' : 'normal_qty') }}</span>
                        <button class="v-qty-btn" @click="collectionStore.updateItemQty(card.id, isFoilMode(card.id) ? 'foil_qty' : 'normal_qty', 1)">+</button>
                    </div>
                </div>

                <!-- Alt Art Row -->
                <div class="v-matrix-clean-row" :class="{ 'v-row-disabled': !hasAltArt(card) }">
                    <span class="v-matrix-label v-label-alt">{{ $t('collection.aart') || 'ALT ART' }}</span>
                    <div class="v-matrix-stepper-mini" :class="{ 'mode-foil': isFoilMode(card.id) }">
                        <button class="v-qty-btn" :disabled="!hasAltArt(card)" @click="collectionStore.updateItemQty(card.id, isFoilMode(card.id) ? 'alt_art_foil_qty' : 'alt_art_qty', -1)">−</button>
                        <span class="v-qty-val">{{ getQty(card.id, isFoilMode(card.id) ? 'alt_art_foil_qty' : 'alt_art_qty') }}</span>
                        <button class="v-qty-btn" :disabled="!hasAltArt(card)" @click="collectionStore.updateItemQty(card.id, isFoilMode(card.id) ? 'alt_art_foil_qty' : 'alt_art_qty', 1)">+</button>
                    </div>
                </div>

                <!-- Signature Row -->
                <div class="v-matrix-clean-row" :class="{ 'v-row-disabled': !hasSignature(card) }">
                    <span class="v-matrix-label v-label-sign">{{ $t('collection.signed') || 'SIGN' }}</span>
                    <div class="v-matrix-stepper-mini" :class="{ 'mode-foil': isFoilMode(card.id) }">
                        <button class="v-qty-btn" :disabled="!hasSignature(card)" @click="collectionStore.updateItemQty(card.id, isFoilMode(card.id) ? 'signed_foil_qty' : 'signed_qty', -1)">−</button>
                        <span class="v-qty-val">{{ getQty(card.id, isFoilMode(card.id) ? 'signed_foil_qty' : 'signed_qty') }}</span>
                        <button class="v-qty-btn" :disabled="!hasSignature(card)" @click="collectionStore.updateItemQty(card.id, isFoilMode(card.id) ? 'signed_foil_qty' : 'signed_qty', 1)">+</button>
                    </div>
                </div>

                <!-- Overnumbered Row -->
                <div class="v-matrix-clean-row" :class="{ 'v-row-disabled': !hasOvernumbered(card) }">
                    <span class="v-matrix-label v-label-over">{{ $t('collection.over') || 'OVER' }}</span>
                    <div class="v-matrix-stepper-mini" :class="{ 'mode-foil': isFoilMode(card.id) }">
                        <button class="v-qty-btn" :disabled="!hasOvernumbered(card)" @click="collectionStore.updateItemQty(card.id, isFoilMode(card.id) ? 'overnumbered_foil_qty' : 'overnumbered_qty', -1)">−</button>
                        <span class="v-qty-val">{{ getQty(card.id, isFoilMode(card.id) ? 'overnumbered_foil_qty' : 'overnumbered_qty') }}</span>
                        <button class="v-qty-btn" :disabled="!hasOvernumbered(card)" @click="collectionStore.updateItemQty(card.id, isFoilMode(card.id) ? 'overnumbered_foil_qty' : 'overnumbered_qty', 1)">+</button>
                    </div>
                </div>
                
                <button class="manage-variants-btn-compact" @click.prevent="managingCard = card">
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
              <div class="manage-row-group">
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
                   <div class="variant-stepper foil-stepper">
                      <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'foil_qty', -1)">−</button>
                      <span class="step-val foil-val"><span class="foil-star">⭐</span>{{ getQty(managingCard.id, 'foil_qty') }}</span>
                      <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'foil_qty', 1)">+</button>
                   </div>
                </div>
              </div>
           </div>

           <!-- Alt Art Group -->
           <div class="manage-group" v-if="hasAltArt(managingCard)">
              <h5 class="manage-group-title v-label-alt">{{ $t('collection.alt_art') }}</h5>
              <div class="manage-row-group">
                <div class="manage-row">
                   <span class="manage-label">{{ $t('collection.normal_aart') }}</span>
                   <div class="variant-stepper">
                      <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'alt_art_qty', -1)">−</button>
                      <span class="step-val">{{ getQty(managingCard.id, 'alt_art_qty') }}</span>
                      <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'alt_art_qty', 1)">+</button>
                   </div>
                </div>
                <div class="manage-row foil-row">
                   <span class="manage-label manage-label-foil">{{ $t('collection.aart_foil') || 'Alt Art Foil' }}</span>
                   <div class="variant-stepper foil-stepper">
                      <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'alt_art_foil_qty', -1)">−</button>
                      <span class="step-val foil-val"><span class="foil-star">⭐</span>{{ getQty(managingCard.id, 'alt_art_foil_qty') }}</span>
                      <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'alt_art_foil_qty', 1)">+</button>
                   </div>
                </div>
              </div>
           </div>

           <!-- Signed Group -->
           <div class="manage-group" v-if="hasSigned(managingCard)">
              <h5 class="manage-group-title v-label-sign">{{ $t('collection.signed_art') || 'Signed Art' }}</h5>
              <div class="manage-row-group">
                <div class="manage-row">
                   <span class="manage-label">{{ $t('collection.normal_signed') || 'Regular Signed' }}</span>
                   <div class="variant-stepper">
                      <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'signed_qty', -1)">−</button>
                      <span class="step-val">{{ getQty(managingCard.id, 'signed_qty') }}</span>
                      <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'signed_qty', 1)">+</button>
                   </div>
                </div>
                <div class="manage-row foil-row">
                   <span class="manage-label manage-label-foil">{{ $t('collection.signed_foil') || 'Signed Foil' }}</span>
                   <div class="variant-stepper foil-stepper">
                      <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'signed_foil_qty', -1)">−</button>
                      <span class="step-val foil-val"><span class="foil-star">⭐</span>{{ getQty(managingCard.id, 'signed_foil_qty') }}</span>
                      <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'signed_foil_qty', 1)">+</button>
                   </div>
                </div>
              </div>
           </div>

           <!-- Overnumbered Group -->
           <div class="manage-group" v-if="hasOvernumbered(managingCard)">
              <h5 class="manage-group-title v-label-over">{{ $t('collection.overnumbered_art') || 'Overnumbered Art' }}</h5>
              <div class="manage-row-group">
                <div class="manage-row">
                   <span class="manage-label">{{ $t('collection.normal_over') || 'Regular Over' }}</span>
                   <div class="variant-stepper">
                      <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'overnumbered_qty', -1)">−</button>
                      <span class="step-val">{{ getQty(managingCard.id, 'overnumbered_qty') }}</span>
                      <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'overnumbered_qty', 1)">+</button>
                   </div>
                </div>
                <div class="manage-row foil-row">
                   <span class="manage-label manage-label-foil">{{ $t('collection.over_foil') || 'Overnumbered Foil' }}</span>
                   <div class="variant-stepper foil-stepper">
                      <button class="step-btn" @click="collectionStore.updateItemQty(managingCard.id, 'overnumbered_foil_qty', -1)">−</button>
                      <span class="step-val foil-val"><span class="foil-star">⭐</span>{{ getQty(managingCard.id, 'overnumbered_foil_qty') }}</span>
                      <button class="step-btn step-add" @click="collectionStore.updateItemQty(managingCard.id, 'overnumbered_foil_qty', 1)">+</button>
                   </div>
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
    </Teleport>

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
import { useDebounceFn } from '@vueuse/core'

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
const managingCard = ref(null)
const hoveredCard = ref(null)
const mouseX = ref(0)
const mouseY = ref(0)

const availableDomains = ['Body', 'Calm', 'Chaos', 'Fury', 'Mind', 'Order', 'Colorless']

function getQty(cardId, field) {
    return collectionStore.items[cardId]?.[field] || 0
}

const foilModes = reactive(new Map())
function isFoilMode(cardId) { return foilModes.get(cardId) || false }
function toggleFoilMode(cardId) { foilModes.set(cardId, !isFoilMode(cardId)) }

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
    if (qty.signed_qty > 0 || qty.overnumbered_qty > 0) {
       const signed = baseCard._versions.find(v => v.metadata?.signature === true || (v.tags?.some(t => t.toLowerCase().includes('sign'))))
       if (signed) activeVersion = signed
    } else if ((qty.alt_art_qty > 0 || qty.alt_art_foil_qty > 0) && baseCard._versions.length > 1) {
       const altArt = baseCard._versions.find((v, idx) => idx > 0)
       if (altArt) activeVersion = altArt
    }
    return { ...baseCard, media: { ...baseCard.media, image_url: activeVersion.media?.image_url } }
  })
})

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

watch(hoveredCard, (newCard) => {
  if (!newCard) return
})

function clearFilters() { searchQuery.value = ''; selectedDomains.value = []; selectedTypes.value = []; selectedRarities.value = []; selectedEnergy.value = null; showOnlyOwned.value = false; }
function handleGlobalMouseMove(e) { mouseX.value = e.clientX; mouseY.value = e.clientY; }

const previewPosition = computed(() => {
  if (!hoveredCard.value) return {}
  const width = 340, height = 480, padding = 20
  let left = mouseX.value + padding, top = mouseY.value - (height / 2)
  if (left + width > window.innerWidth) left = mouseX.value - width - padding
  if (top < padding) top = padding
  if (top + height > window.innerHeight) top = window.innerHeight - height - padding
  return { left: `${left}px`, top: `${top}px` }
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

async function fetchAllData() {
  loading.value = true
  error.value = null
  try {
    const c = await riftcodex.getCards()
    allCards.value = Array.isArray(c) ? c : []
    await nextTick()
    setupObserver()
  } catch (e) { error.value = t('common.something_went_wrong') } finally { loading.value = false }
}

onMounted(() => { fetchAllData(); window.addEventListener('mousemove', handleGlobalMouseMove) })
onBeforeUnmount(() => { if (observer) observer.disconnect(); window.removeEventListener('mousemove', handleGlobalMouseMove) })
</script>

<style scoped>
.collection { display: flex; flex-direction: column; gap: 12px; }

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
.filter-pill-energy { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.72rem; font-weight: 700; background: var(--color-bg-surface); color: var(--color-text-secondary); border: 1px solid var(--color-border-subtle); }
.filter-pill-energy.filter-pill--active { background: rgba(74, 127, 255, 0.15); color: var(--color-rift-400); border-color: var(--color-rift-500); }
.filter-selects { display: flex; gap: 6px; flex-wrap: wrap; }

/* ── Cards grid ── */
.cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.card-tile { display: flex; flex-direction: column; border-radius: var(--radius-md); background: var(--color-bg-raised); border: 1px solid var(--color-border-subtle); transition: all 0.2s ease; position: relative; }
.collection-unowned .card-image { filter: grayscale(100%) opacity(0.4); }
.card-image-wrap { position: relative; width: 100%; aspect-ratio: 744 / 1039; overflow: hidden; border-radius: var(--radius-md) var(--radius-md) 0 0; background: #000; }
.card-image-wrap--landscape { aspect-ratio: 1039 / 744; }
.card-image { width: 100%; height: 100%; object-fit: contain; }
.alt-arts-badge { position: absolute; bottom: 4px; right: 4px; padding: 2px 6px; border-radius: var(--radius-full); background: rgba(0,0,0,0.7); font-size: 0.55rem; color: var(--color-gold-400); z-index: 10; }

/* ── Foil Glow ── */
.foil-glow::after { content: ''; position: absolute; inset: 0; background: linear-gradient(115deg, transparent 20%, rgba(255, 255, 255, 0.4) 30%, rgba(255, 215, 0, 0.2) 45%, transparent 80%); mix-blend-mode: color-dodge; opacity: 0.75; animation: foil-shine 3s linear infinite; pointer-events: none; }
@keyframes foil-shine { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }

.card-info { padding: 8px 10px 10px; flex: 1; display: flex; flex-direction: column; }
.card-name { font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-meta { display: flex; align-items: center; gap: 4px; margin-top: 3px; margin-bottom: 8px; }
/* Matrix Collection Styles V4 */
.collection-controls-matrix {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(255, 255, 255, 0.02);
  margin-top: auto;
  border-top: 1px solid var(--color-border-subtle);
}

.matrix-header {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

.foil-toggle-btn {
  width: 100%;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  color: var(--color-text-tertiary);
  font-size: 0.6rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.05em;
}

.foil-toggle-btn.foil-active {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.05));
  border-color: rgba(255, 215, 0, 0.4);
  color: #ffd700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.1);
}

.v-matrix-clean-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 2px 0;
  transition: opacity 0.2s;
}

.v-row-disabled {
  opacity: 0.2;
  pointer-events: none;
  filter: grayscale(1);
}

.v-matrix-label {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  white-space: nowrap;
}

.v-matrix-stepper-mini {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  padding: 1px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s;
}

.v-matrix-stepper-mini.mode-foil {
  background: rgba(255, 215, 0, 0.08);
  border-color: rgba(255, 215, 0, 0.3);
}

.v-qty-btn {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
}

.v-qty-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.v-qty-val {
  min-width: 16px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
}

.mode-foil .v-qty-val {
  color: #ffd700;
}

.manage-variants-btn-compact {
  width: 100%;
  padding: 6px;
  background: transparent;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--color-text-tertiary);
  font-size: 0.65rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 4px;
  transition: all 0.2s;
}

.manage-variants-btn-compact:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
}

/* Modal Variant Design */
.v-label-alt { color: #818cf8; }
.v-label-sign { color: #fbbf24; }
.v-label-over { color: #f472b6; }

/* ── Modals ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
.manage-modal { background: var(--color-bg-deep); border: 1px solid var(--color-border-subtle); border-radius: var(--radius-lg); width: 100%; max-width: 360px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid var(--color-border-subtle); }
.modal-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.manage-group { background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
.manage-group-title { font-size: 0.7rem; color: var(--color-text-tertiary); margin-bottom: 6px; text-transform: uppercase; font-weight: 700; }
.manage-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.manage-row-group { display: flex; flex-direction: column; gap: 2px; }
.foil-row { border-top: 1px dashed rgba(255,255,255,0.05); margin-top: 4px; padding-top: 6px; }

/* ── New Stepper Styling for Variant Grouping ── */
.variant-stepper-group { display: flex; align-items: center; gap: 8px; }
.foil-stepper .step-btn { background: rgba(201, 168, 76, 0.1); color: var(--color-gold-400); border: 1px solid rgba(201, 168, 76, 0.2); }
.foil-stepper .step-add { background: var(--color-gold-500); color: #000; }
.foil-val { color: var(--color-gold-400); display: flex; align-items: center; gap: 1px; width: auto; min-width: 24px; justify-content: center; }
.foil-star { font-size: 0.6rem; margin-right: 1px; }

/* ── Management Modal Styling Refinement ── */
.manage-label-foil { color: var(--color-gold-400); font-weight: 700; display: flex; align-items: center; gap: 4px; }
.manage-label-foil::before { content: '⭐'; font-size: 0.7rem; }

/* ── Preview ── */
.global-card-preview { position: fixed; width: 340px; border-radius: var(--radius-lg); overflow: hidden; z-index: 1000; box-shadow: var(--shadow-2xl); pointer-events: none; }
.global-card-preview img { width: 100%; display: block; }
  .loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@media (max-width: 768px) {
  .global-card-preview { display: none !important; }
  .cards-grid { grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 8px; }
  .export-trigger span { display: none; }
  .card-info { padding: 6px 8px 8px; }
  .card-name { font-size: 0.75rem; }
  
  /* Export Modal Mobile Adjustments */
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
</style>
