<template>
  <div class="deck-editor fade-in" v-if="deck">
    <!-- ── Header ── -->
    <header class="editor-header">
      <div class="editor-header-left">
        <router-link to="/decks" class="back-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </router-link>
        <div class="editor-title-wrap">
          <input
            v-if="isRenaming"
            v-model="renameValue"
            class="input editor-rename-input"
            @blur="finishRename"
            @keyup.enter="finishRename"
            @keyup.escape="cancelRename"
            ref="renameInput"
          />
          <h1 v-else class="editor-title" @click="startRename">{{ deck.name }}</h1>
        </div>
      </div>
      <div class="editor-actions">
        <button class="btn btn-secondary btn-sm" @click="showImportModal = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Importar
        </button>
        <button class="btn btn-secondary btn-sm" @click="showExportModal = true" :disabled="!deck.cards.length">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Exportar
        </button>
      </div>
    </header>

    <!-- ── Stats bar ── -->
    <div class="stats-bar glass">
      <div class="stat">
        <span class="stat-value">{{ totalCards }}</span>
        <span class="stat-label">Main</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <span class="stat-value">{{ sideboardTotal }}</span>
        <span class="stat-label">Side</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <div class="stat-domains">
          <span v-for="d in deckDomains" :key="d" class="domain-badge" :class="`domain-${d.toLowerCase()}`">{{ d }}</span>
          <span v-if="!deckDomains.length" class="stat-value" style="font-size:0.8rem;">—</span>
        </div>
        <span class="stat-label">Domínios</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat">
        <div class="energy-curve">
          <div v-for="bar in energyCurve" :key="bar.cost" class="energy-bar-wrap" :title="`${bar.cost}⚡: ${bar.count}`">
            <div class="energy-bar" :style="{ height: `${bar.pct}%` }"></div>
            <span class="energy-bar-label">{{ bar.cost }}</span>
          </div>
        </div>
        <span class="stat-label">Energia</span>
      </div>
    </div>

    <!-- ── Quick add search ── -->
    <div class="quick-add">
      <div class="quick-add-search">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          v-model="searchQuery"
          type="text"
          class="input input-sm search-input"
          placeholder="Adicionar (buscar por nome, mecânica...)"
          id="editor-card-search"
          @focus="showSearchResults = true"
        />
      </div>
      <div v-if="showSearchResults && uniqueSearchResults.length" class="search-results glass">
        <button
          v-for="card in uniqueSearchResults.slice(0, 8)"
          :key="card.id"
          class="search-result-item"
          @click="addCard(card)"
        >
          <img 
             :src="card.media?.image_url" 
             :alt="card.name" 
             class="search-result-img" 
             :class="{'search-result-img--landscape': card.orientation === 'landscape' || card.classification?.type === 'Battlefield'}"
             loading="lazy" 
          />
          <div class="search-result-info">
            <span class="search-result-name">{{ card.name }}</span>
            <span class="search-result-meta">
              {{ card.classification?.type }}
              <span v-if="card.attributes?.energy != null"> · ⚡{{ card.attributes.energy }}</span>
              <span v-if="card._altCount > 1" class="search-alt-hint"> · 🎨 {{ card._altCount }}</span>
            </span>
          </div>
          <span class="search-result-add">+</span>
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════ -->
    <!-- MAIN DECK                                   -->
    <!-- ═══════════════════════════════════════════ -->
    <section class="deck-section" v-if="deck.cards.length || !deck.sideboard?.length">
      <h2 class="section-title">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        Main Deck
        <span class="section-count">{{ totalCards }}</span>
      </h2>

      <!-- Lendas (type=Legend) -->
      <div v-if="mainLegends.length" class="legend-group">
        <h3 class="group-label group-label--legend">
          <span>⭐</span> Lendas
        </h3>
        <div class="card-entries card-entries--grid">
          <div v-for="entry in mainLegends" :key="entry.cardId" class="card-entry card-entry--legend">
            <div class="entry-img-link" :class="{'entry-img-link--landscape': entry.type === 'Battlefield'}">
              <img :src="entry.imageUrl" :alt="entry.cardName" class="entry-img" loading="lazy" />
              <div class="entry-hover-preview" :class="{'entry-hover-preview--landscape': entry.type === 'Battlefield'}">
                <img :src="entry.imageUrl" :alt="entry.cardName" />
              </div>
            </div>
            <div class="entry-info">
              <router-link :to="{ name: 'card-detail', params: { name: entry.cardName } }" class="entry-name entry-name--legend">{{ entry.cardName }}</router-link>
              <div class="entry-meta">
                <span class="rarity-badge" :class="`rarity-${entry.rarity.toLowerCase()}`">{{ entry.rarity }}</span>
                <span v-if="entry.energy != null" class="entry-energy">⚡{{ entry.energy }}</span>
              </div>
            </div>
            <div class="entry-qty">
              <button class="qty-btn" @click="decksStore.removeCard(deck.id, entry.cardId)">−</button>
              <span class="qty-value">{{ entry.quantity }}</span>
              <button class="qty-btn" @click="decksStore.setCardQuantity(deck.id, entry.cardId, entry.quantity + 1)">+</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Champion (user-selected) -->
      <div v-if="mainChampionEntry" class="champion-hero-group">
        <h3 class="group-label group-label--champion">
          <span>🛡️</span> Campeão Principal
        </h3>
        <div class="card-entry card-entry--main-champion">
          <div class="entry-img-link" :class="{'entry-img-link--landscape': mainChampionEntry.type === 'Battlefield'}">
            <img :src="mainChampionEntry.imageUrl" :alt="mainChampionEntry.cardName" class="entry-img" loading="lazy" />
            <div class="entry-hover-preview" :class="{'entry-hover-preview--landscape': mainChampionEntry.type === 'Battlefield'}">
              <img :src="mainChampionEntry.imageUrl" :alt="mainChampionEntry.cardName" />
            </div>
          </div>
          <div class="entry-info">
            <router-link :to="{ name: 'card-detail', params: { name: mainChampionEntry.cardName } }" class="entry-name entry-name--champion">{{ mainChampionEntry.cardName }}</router-link>
            <div class="entry-meta">
              <span class="rarity-badge" :class="`rarity-${mainChampionEntry.rarity.toLowerCase()}`">{{ mainChampionEntry.rarity }}</span>
              <span v-if="mainChampionEntry.energy != null" class="entry-energy">⚡{{ mainChampionEntry.energy }}</span>
            </div>
          </div>
          <div class="entry-qty">
            <button class="qty-btn" @click="decksStore.removeCard(deck.id, mainChampionEntry.cardId)">−</button>
            <span class="qty-value">{{ mainChampionEntry.quantity }}</span>
            <button class="qty-btn" @click="decksStore.setCardQuantity(deck.id, mainChampionEntry.cardId, mainChampionEntry.quantity + 1)">+</button>
          </div>
        </div>
      </div>

      <!-- Other cards (2-col grid) -->
      <div v-if="mainOthers.length" class="card-entries card-entries--grid">
        <div v-for="entry in mainOthers" :key="entry.cardId" class="card-entry" :class="{ 'card-entry--champion-selectable': entry.supertype === 'Champion' }">
          <div class="entry-img-link" :class="{'entry-img-link--landscape': entry.type === 'Battlefield'}">
            <img :src="entry.imageUrl" :alt="entry.cardName" class="entry-img" loading="lazy" />
            <div class="entry-hover-preview" :class="{'entry-hover-preview--landscape': entry.type === 'Battlefield'}">
              <img :src="entry.imageUrl" :alt="entry.cardName" />
            </div>
          </div>
          <div class="entry-info">
            <router-link :to="{ name: 'card-detail', params: { name: entry.cardName } }" class="entry-name">{{ entry.cardName }}</router-link>
            <div class="entry-meta">
              <span v-if="entry.rarity" class="rarity-badge" :class="`rarity-${entry.rarity.toLowerCase()}`">{{ entry.rarity }}</span>
              <span v-if="entry.energy != null" class="entry-energy">⚡{{ entry.energy }}</span>
            </div>
          </div>
          <div class="entry-actions">
            <button
              v-if="entry.supertype === 'Champion'"
              class="star-btn"
              :class="{ 'star-btn--active': deck.mainChampionId === entry.cardId }"
              @click="decksStore.setMainChampion(deck.id, entry.cardId)"
              title="Definir como Campeão Principal"
            >★</button>
            <div class="entry-qty">
              <button class="qty-btn" @click="decksStore.removeCard(deck.id, entry.cardId)">−</button>
              <span class="qty-value">{{ entry.quantity }}</span>
              <button class="qty-btn" @click="decksStore.setCardQuantity(deck.id, entry.cardId, entry.quantity + 1)">+</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!deck.cards.length" class="section-empty">
        <p>Use a busca acima ou importe uma lista para montar seu deck.</p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════ -->
    <!-- SIDEBOARD                                    -->
    <!-- ═══════════════════════════════════════════ -->
    <section class="deck-section" v-if="deck.sideboard?.length">
      <h2 class="section-title section-title--side">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3"/></svg>
        Sideboard
        <span class="section-count">{{ sideboardTotal }}</span>
      </h2>
      <div class="card-entries card-entries--grid">
        <div v-for="entry in deck.sideboard" :key="entry.cardId" class="card-entry" :class="{ 'card-entry--legend': entry.type === 'Legend' }">
          <div class="entry-img-link" :class="{'entry-img-link--landscape': entry.type === 'Battlefield'}">
            <img :src="entry.imageUrl" :alt="entry.cardName" class="entry-img" loading="lazy" />
            <div class="entry-hover-preview" :class="{'entry-hover-preview--landscape': entry.type === 'Battlefield'}">
              <img :src="entry.imageUrl" :alt="entry.cardName" />
            </div>
          </div>
          <div class="entry-info">
            <router-link :to="{ name: 'card-detail', params: { name: entry.cardName } }" class="entry-name" :class="{ 'entry-name--legend': entry.type === 'Legend' }">{{ entry.cardName }}</router-link>
            <div class="entry-meta">
              <span v-if="entry.rarity" class="rarity-badge" :class="`rarity-${entry.rarity.toLowerCase()}`">{{ entry.rarity }}</span>
              <span v-if="entry.energy != null" class="entry-energy">⚡{{ entry.energy }}</span>
            </div>
          </div>
          <div class="entry-qty">
            <button class="qty-btn" @click="decksStore.removeCard(deck.id, entry.cardId, true)">−</button>
            <span class="qty-value">{{ entry.quantity }}</span>
            <button class="qty-btn" @click="decksStore.setCardQuantity(deck.id, entry.cardId, entry.quantity + 1, true)">+</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════ -->
    <!-- IMPORT MODAL                                 -->
    <!-- ═══════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
        <div class="modal glass fade-in">
          <h3 class="modal-title">Importar lista de cartas</h3>
          <p class="modal-hint">Cole sua decklist no formato: <code>3 Carta Nome</code><br/>Use <code>Sideboard:</code> para separar o sideboard.</p>
          <textarea
            v-model="importText"
            class="input import-textarea"
            placeholder="1 Fiora, Worthy
3 Sett, Brawler
2 B.F. Sword
6 Order Rune
Sideboard:
1 Warmog's Armor
2 Unyielding Spirit"
            rows="10"
            id="import-textarea"
            ref="importTextarea"
          ></textarea>

          <div v-if="importResult" class="import-result" :class="importResult.unmatched.length ? 'import-result--warn' : 'import-result--ok'">
            <span v-if="!importResult.unmatched.length">✓ {{ importResult.matched }} carta{{ importResult.matched !== 1 ? 's' : '' }} importada{{ importResult.matched !== 1 ? 's' : '' }} com sucesso!</span>
            <span v-else>
              ✓ {{ importResult.matched }} importada{{ importResult.matched !== 1 ? 's' : '' }}.
              ⚠ {{ importResult.unmatched.length }} não encontrada{{ importResult.unmatched.length !== 1 ? 's' : '' }}:
              <strong>{{ importResult.unmatched.join(', ') }}</strong>
            </span>
          </div>

          <div class="modal-actions">
            <button class="btn btn-ghost" @click="showImportModal = false; importResult = null">Fechar</button>
            <button class="btn btn-primary" :disabled="!importText.trim()" @click="doImport">Importar deck</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════════════════════════════════════ -->
    <!-- EXPORT MODAL                                 -->
    <!-- ═══════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="showExportModal" class="modal-overlay" @click.self="showExportModal = false">
        <div class="modal glass fade-in">
          <h3 class="modal-title">Exportar lista do deck</h3>
          <div class="export-formats">
            <button v-for="fmt in EXPORT_FORMATS" :key="fmt.id" class="export-format-btn" :class="{ 'export-format-active': selectedFormat === fmt.id }" @click="selectedFormat = fmt.id">
              <span class="export-format-name">{{ fmt.label }}</span>
              <span class="export-format-desc">{{ fmt.description }}</span>
            </button>
          </div>
          <div class="export-preview">
            <pre class="export-text">{{ exportedText }}</pre>
          </div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="showExportModal = false">Fechar</button>
            <button class="btn btn-primary" @click="copyExport">{{ copyLabel }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <div v-if="showToast" class="toast toast-success">{{ toastMessage }}</div>
  </div>

  <!-- Not found -->
  <div v-else class="empty-state fade-in" style="padding: 60px 20px; text-align: center;">
    <div style="font-size: 2.5rem;">🔍</div>
    <h3 class="empty-title">Deck não encontrado</h3>
    <router-link to="/decks" class="btn btn-primary" style="margin-top: 12px;">Ver todos os decks</router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useDecksStore } from '@/stores/decks'
import { getCards } from '@/services/riftcodex'
import { EXPORT_FORMATS, copyToClipboard } from '@/composables/useDeckExport'

const props = defineProps({ id: String })
const decksStore = useDecksStore()

const deck = computed(() => decksStore.getDeck(props.id))

// ── Rename ──
const isRenaming = ref(false)
const renameValue = ref('')
const renameInput = ref(null)
function startRename() {
  renameValue.value = deck.value.name
  isRenaming.value = true
  nextTick(() => renameInput.value?.focus())
}
function finishRename() { if (renameValue.value.trim()) decksStore.renameDeck(props.id, renameValue.value.trim()); isRenaming.value = false }
function cancelRename() { isRenaming.value = false }

// ── Stats ──
const totalCards = computed(() => deck.value ? deck.value.cards.reduce((s, c) => s + c.quantity, 0) : 0)
const sideboardTotal = computed(() => deck.value?.sideboard ? deck.value.sideboard.reduce((s, c) => s + c.quantity, 0) : 0)

const deckDomains = computed(() => {
  if (!deck.value) return []
  const d = new Set()
  ;[...deck.value.cards, ...(deck.value.sideboard || [])].forEach((c) => { c.domains?.forEach((x) => d.add(x)) })
  return [...d]
})

const energyCurve = computed(() => {
  if (!deck.value) return []
  const b = {}; for (let i = 0; i <= 6; i++) b[i] = 0
  deck.value.cards.forEach((c) => { if (c.energy != null) b[Math.min(c.energy, 6)] += c.quantity })
  const max = Math.max(1, ...Object.values(b))
  return Object.entries(b).map(([cost, count]) => ({ cost: cost === '6' ? '6+' : cost, count, pct: (count / max) * 100 }))
})

// ── Separated card lists ──
const mainLegends = computed(() => deck.value?.cards.filter((c) => c.type === 'Legend') || [])
const mainChampionEntry = computed(() => {
  if (!deck.value?.mainChampionId) return null
  return deck.value.cards.find((c) => c.cardId === deck.value.mainChampionId) || null
})
const mainOthers = computed(() => {
  if (!deck.value) return []
  return deck.value.cards.filter((c) =>
    c.type !== 'Legend' && c.cardId !== deck.value.mainChampionId
  )
})

// ── Quick add ──
const allCards = ref([])
const searchQuery = ref('')
const showSearchResults = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

const searchResults = computed(() => {
  if (!searchQuery.value.trim() || searchQuery.value.trim().length < 2) return []
  const q = searchQuery.value.trim().toLowerCase()
  return allCards.value.filter((c) => {
    return c.name.toLowerCase().includes(q) ||
           c.text?.raw?.toLowerCase().includes(q) ||
           c.text?.rich?.toLowerCase().includes(q) ||
           c.description?.raw?.toLowerCase().includes(q) ||
           c.description?.rich?.toLowerCase().includes(q) ||
           c.classification?.supertype?.toLowerCase().includes(q) ||
           c.classification?.subtype?.toLowerCase().includes(q) ||
           c.tags?.some((t) => t.toLowerCase().includes(q))
  })
})

// Deduplicate search results by name
const uniqueSearchResults = computed(() => {
  const seen = new Map()
  for (const card of searchResults.value) {
    if (seen.has(card.name)) {
      seen.get(card.name)._altCount++
    } else {
      seen.set(card.name, { ...card, _altCount: 1 })
    }
  }
  return [...seen.values()]
})

function addCard(card) {
  decksStore.addCard(props.id, card)
  showToast.value = true
  toastMessage.value = `${card.name} adicionada!`
  setTimeout(() => { showToast.value = false }, 2500)
}

function handleClickOutside(e) { if (!e.target.closest('.quick-add')) showSearchResults.value = false }
onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  try { const data = await getCards(); allCards.value = Array.isArray(data) ? data : [] } catch (e) { console.error(e) }
})
onBeforeUnmount(() => { document.removeEventListener('click', handleClickOutside) })

// ── Import ──
const showImportModal = ref(false)
const importText = ref('')
const importResult = ref(null)
const importTextarea = ref(null)

function doImport() {
  if (!importText.value.trim()) return
  const result = decksStore.importFromText(props.id, importText.value, allCards.value)
  importResult.value = result
  if (!result.unmatched.length) {
    setTimeout(() => { showImportModal.value = false; importResult.value = null }, 1500)
  }
}

// ── Export ──
const showExportModal = ref(false)
const selectedFormat = ref('generic')
const copyLabel = ref('Copiar para clipboard')

const exportedText = computed(() => {
  if (!deck.value) return ''
  const fmt = EXPORT_FORMATS.find((f) => f.id === selectedFormat.value)
  return fmt ? fmt.fn(deck.value.cards, deck.value.sideboard || []) : ''
})
async function copyExport() {
  const ok = await copyToClipboard(exportedText.value)
  copyLabel.value = ok ? '✓ Copiado!' : 'Falha'
  setTimeout(() => { copyLabel.value = 'Copiar para clipboard' }, 2500)
}
</script>

<style scoped>
.deck-editor { display: flex; flex-direction: column; gap: 14px; }

/* ── Header ── */
.editor-header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px; flex-wrap: wrap;
}
.editor-header-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
.back-link {
  flex-shrink: 0; display: flex; align-items: center;
  color: var(--color-text-secondary); transition: color 0.2s;
}
.back-link:hover { color: var(--color-text-primary); }
.editor-title-wrap { min-width: 0; }
.editor-title {
  font-family: var(--font-display); font-size: 1.2rem; font-weight: 800;
  letter-spacing: -0.02em; white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis; cursor: pointer;
}
.editor-rename-input { font-size: 1.1rem; font-weight: 700; font-family: var(--font-display); max-width: 280px; }

.editor-actions { display: flex; gap: 6px; flex-shrink: 0; }
.editor-actions .btn { font-size: 0.75rem; padding: 6px 10px; }

/* ── Stats bar ── */
.stats-bar {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px; border-radius: var(--radius-lg);
  overflow-x: auto; scrollbar-width: none;
}
.stats-bar::-webkit-scrollbar { display: none; }
.stat { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0; }
.stat-value { font-family: var(--font-display); font-size: 1.2rem; font-weight: 800; color: var(--color-gold-400); }
.stat-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-tertiary); white-space: nowrap; }
.stat-divider { width: 1px; height: 28px; background: var(--color-border-subtle); flex-shrink: 0; }
.stat-domains { display: flex; gap: 3px; flex-wrap: nowrap; }
.stat-domains .domain-badge { font-size: 0.55rem; padding: 1px 5px; }

.energy-curve { display: flex; align-items: flex-end; gap: 3px; height: 32px; }
.energy-bar-wrap { display: flex; flex-direction: column; align-items: center; gap: 1px; width: 14px; height: 100%; justify-content: flex-end; }
.energy-bar { width: 100%; background: linear-gradient(to top, var(--color-rift-500), var(--color-rift-300)); border-radius: 2px 2px 0 0; min-height: 2px; transition: height 0.3s; }
.energy-bar-label { font-size: 0.5rem; color: var(--color-text-tertiary); font-weight: 600; }

/* ── Quick add ── */
.quick-add { position: relative; }
.quick-add-search { position: relative; }
.quick-add .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-tertiary); pointer-events: none; }
.quick-add .search-input { padding-left: 34px; }
.search-results {
  position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px;
  z-index: 50; border-radius: var(--radius-md); overflow: hidden; max-height: 320px; overflow-y: auto;
}
.search-result-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  width: 100%; background: transparent; border: none; color: inherit;
  font-family: var(--font-body); cursor: pointer; text-align: left; transition: background 0.15s;
}
.search-result-item:hover, .search-result-item:active { background: rgba(255,255,255,0.04); }
.search-result-img { width: 32px; height: 44px; object-fit: cover; border-radius: 3px; flex-shrink: 0; }
.search-result-img--landscape { width: 44px; height: 32px; }
.search-result-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.search-result-name { font-size: 0.82rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.search-result-meta { font-size: 0.68rem; color: var(--color-text-secondary); }
.search-result-add { flex-shrink: 0; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); font-size: 1.1rem; font-weight: 700; color: var(--color-gold-400); }
.search-alt-hint { color: var(--color-gold-400); font-weight: 600; }

/* ═══════════════════════════════════════════ */
/* DECK SECTIONS                               */
/* ═══════════════════════════════════════════ */
.deck-section { margin-top: 4px; }
.section-title {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-display); font-size: 0.9rem; font-weight: 700;
  color: var(--color-text-primary); padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border-subtle); margin-bottom: 6px;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.section-title--side { color: var(--color-rift-400); border-color: rgba(74,127,255,0.2); }
.section-count {
  font-size: 0.7rem; padding: 1px 7px; border-radius: var(--radius-full);
  background: var(--color-bg-surface); color: var(--color-text-secondary); font-weight: 700;
}

/* Group labels */
.legend-group, .champion-hero-group { margin-bottom: 10px; }
.group-label {
  display: flex; align-items: center; gap: 4px;
  font-size: 0.72rem; font-weight: 700;
  margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em;
}
.group-label--legend { color: var(--color-gold-400); }
.group-label--champion { color: var(--color-rift-400); }

/* ── Card entries: 2-column grid ── */
.card-entries { display: flex; flex-direction: column; gap: 2px; }
.card-entries--grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
}

.card-entry {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px; border-radius: var(--radius-md);
  background: var(--color-bg-raised); border: 1px solid var(--color-border-subtle);
  transition: border-color 0.2s; min-width: 0;
}
.card-entry:active { background: var(--color-bg-surface); }
.card-entry--legend {
  border-color: rgba(201, 168, 76, 0.3);
  background: linear-gradient(135deg, var(--color-bg-raised) 0%, rgba(201, 168, 76, 0.06) 100%);
}
.card-entry--main-champion {
  border-color: rgba(74, 127, 255, 0.3);
  background: linear-gradient(135deg, var(--color-bg-raised) 0%, rgba(74, 127, 255, 0.06) 100%);
}

/* ── Thumbnail with hover preview ── */
.entry-img-link { flex-shrink: 0; position: relative; }
.entry-img-link--landscape .entry-img { width: 44px; height: 32px; }
.entry-img { width: 32px; height: 44px; object-fit: cover; border-radius: 3px; cursor: pointer; }
.entry-hover-preview {
  display: none; position: absolute; z-index: 100;
  top: 50%; left: 110%; transform: translateY(-50%);
  width: 440px; border-radius: var(--radius-lg); overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 20px rgba(201,168,76,0.12);
  pointer-events: none;
  animation: preview-pop 0.12s ease-out;
}
.entry-hover-preview img { width: 100%; height: auto; display: block; }

@keyframes preview-pop {
  from { opacity: 0; transform: translateY(-50%) scale(0.9); }
  to   { opacity: 1; transform: translateY(-50%) scale(1); }
}

.entry-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.entry-name {
  font-size: 0.75rem; font-weight: 600; color: var(--color-text-primary);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-decoration: none;
}
.entry-name:hover { color: var(--color-gold-400); }
.entry-name--legend { color: var(--color-gold-400); font-weight: 700; }
.entry-name--legend:hover { color: var(--color-gold-300); }
.entry-name--champion { color: var(--color-rift-400); font-weight: 700; }
.entry-name--champion:hover { color: var(--color-rift-300); }
.entry-meta { display: flex; align-items: center; gap: 3px; }
.entry-meta .rarity-badge { font-size: 0.5rem; padding: 0 4px; }
.entry-energy { font-size: 0.6rem; font-weight: 600; color: var(--color-rift-400); }

/* ── Star button (Main Champion selector) ── */
.entry-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.star-btn {
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: var(--radius-sm); background: transparent;
  color: var(--color-text-tertiary); font-size: 0.85rem;
  cursor: pointer; transition: all 0.2s; padding: 0;
}
.star-btn:hover { color: var(--color-rift-400); transform: scale(1.15); }
.star-btn--active { color: var(--color-rift-400) !important; text-shadow: 0 0 8px rgba(74,127,255,0.4); }

.entry-qty { display: flex; align-items: center; gap: 1px; flex-shrink: 0; }
.qty-btn {
  width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: var(--radius-sm); background: var(--color-bg-surface);
  color: var(--color-text-secondary); font-size: 0.85rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s; font-family: var(--font-body);
}
.qty-btn:hover { background: var(--color-bg-overlay); color: var(--color-text-primary); }
.qty-btn:active { transform: scale(0.9); }
.qty-value { font-family: var(--font-display); font-size: 0.85rem; font-weight: 700; min-width: 16px; text-align: center; }

.section-empty { padding: 28px 16px; text-align: center; font-size: 0.85rem; color: var(--color-text-secondary); }

/* ═══════════════════════════════════════════ */
/* MODALS                                      */
/* ═══════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(6,6,16,0.8); display: flex;
  align-items: flex-end; justify-content: center; padding: 0;
}
.modal {
  width: 100%; max-width: 520px; max-height: 90dvh; overflow-y: auto;
  padding: 24px 20px; border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex; flex-direction: column; gap: 14px;
}
.modal-title { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; }
.modal-hint { font-size: 0.78rem; color: var(--color-text-secondary); line-height: 1.5; }
.modal-hint code { background: var(--color-bg-surface); padding: 1px 5px; border-radius: 3px; font-size: 0.72rem; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }

.import-textarea {
  width: 100%; resize: vertical; min-height: 160px;
  font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.78rem; line-height: 1.5;
}
.import-result {
  padding: 10px 12px; border-radius: var(--radius-md);
  font-size: 0.78rem; font-weight: 500;
}
.import-result--ok { background: rgba(80,184,138,0.12); color: var(--color-domain-order); }
.import-result--warn { background: rgba(224,112,53,0.12); color: var(--color-domain-chaos); }

.export-formats { display: flex; gap: 6px; }
.export-format-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 8px; border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md);
  background: var(--color-bg-surface); cursor: pointer; transition: all 0.2s;
  color: var(--color-text-secondary); font-family: var(--font-body);
}
.export-format-btn:hover { border-color: var(--color-border-default); }
.export-format-active { border-color: var(--color-gold-400) !important; background: rgba(201,168,76,0.06); }
.export-format-name { font-size: 0.78rem; font-weight: 600; color: var(--color-text-primary); }
.export-format-desc { font-size: 0.6rem; }
.export-preview {
  background: var(--color-bg-deep); border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md); padding: 12px; max-height: 180px; overflow-y: auto;
}
.export-text { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.75rem; line-height: 1.6; white-space: pre-wrap; margin: 0; }

/* ── Empty / toast ── */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.empty-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); padding: 10px 20px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 600; z-index: 1000; animation: toast-in 0.3s ease-out; }
.toast-success { background: rgba(80,184,138,0.9); color: #fff; }
@keyframes toast-in { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

/* ── Desktop ── */
@media (min-width: 769px) {
  .editor-title { font-size: 1.5rem; }
  .editor-actions .btn { font-size: 0.8rem; padding: 8px 14px; }
  .modal-overlay { align-items: center; padding: 20px; }
  .modal { border-radius: var(--radius-xl); max-height: 85vh; }
  .entry-img { width: 36px; height: 50px; }

  /* Hover preview only on desktop */
  .entry-img-link:hover .entry-hover-preview { display: block; }
}
</style>
