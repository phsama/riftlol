<template>
  <div class="decks-page fade-in">
    <header class="decks-header">
      <div>
        <h1 class="decks-title">Meus Decks</h1>
        <p class="decks-subtitle" v-if="decksStore.decks.length">
          {{ decksStore.decks.length }} deck{{ decksStore.decks.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <button class="btn btn-primary btn-sm" @click="openCreateModal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Criar deck
      </button>
    </header>

    <!-- Empty state -->
    <div v-if="!decksStore.decks.length" class="empty-state">
      <div class="empty-cards-stack">
        <div class="empty-card-1"></div>
        <div class="empty-card-2"></div>
        <div class="empty-card-3"></div>
      </div>
      <h3 class="empty-title">Nenhum deck ainda</h3>
      <p class="empty-text">Monte seu primeiro deck para organizar suas cartas e exportar listas de compra.</p>
      <button class="btn btn-primary" @click="openCreateModal">Criar meu primeiro deck</button>
    </div>

    <!-- Deck list -->
    <div v-else class="decks-list stagger-enter">
      <div v-for="deck in decksStore.decks" :key="deck.id" class="deck-card">
        <router-link :to="{ name: 'deck-editor', params: { id: deck.id } }" class="deck-card-link">
          <div class="deck-preview">
            <div v-if="deck.cards.length" class="deck-preview-cards">
              <img
                v-for="(c, i) in deck.cards.slice(0, 3)"
                :key="c.cardId"
                :src="c.imageUrl"
                :alt="c.cardName"
                class="deck-preview-img"
                :style="{ transform: `rotate(${(i - 1) * 8}deg) translateX(${(i - 1) * 5}px)`, zIndex: 3 - i }"
                loading="lazy"
              />
            </div>
            <div v-else class="deck-preview-empty">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
          </div>
          <div class="deck-info">
            <h3 class="deck-name">{{ deck.name }}</h3>
            <div class="deck-stats">
              <span>{{ getTotalCards(deck) }} carta{{ getTotalCards(deck) !== 1 ? 's' : '' }}</span>
              <span v-if="deck.sideboard?.length"> · {{ getSideTotal(deck) }} side</span>
            </div>
            <div class="deck-domains" v-if="getDeckDomains(deck).length">
              <span v-for="d in getDeckDomains(deck)" :key="d" class="domain-badge" :class="`domain-${d.toLowerCase()}`">{{ d }}</span>
            </div>
          </div>
          <svg class="deck-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </router-link>
        <div class="deck-actions">
          <button class="btn btn-ghost btn-icon btn-sm" title="Duplicar" @click="decksStore.duplicateDeck(deck.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" title="Excluir" @click="confirmDelete(deck)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Create modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
        <div class="modal glass fade-in">
          <h3 class="modal-title">Criar novo deck</h3>
          <input
            v-model="newDeckName"
            class="input"
            placeholder="Nome do deck — ex: Aggro Chaos, Control Mind..."
            id="new-deck-name"
            @keyup.enter="createDeck"
            ref="newDeckInput"
          />
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="showCreateModal = false">Cancelar</button>
            <button class="btn btn-primary" :disabled="!newDeckName.trim()" @click="createDeck">Criar deck</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal glass fade-in">
          <h3 class="modal-title">Excluir deck</h3>
          <p class="modal-text">Tem certeza que deseja excluir <strong>{{ deckToDelete?.name }}</strong>?</p>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="showDeleteModal = false">Cancelar</button>
            <button class="btn btn-danger" @click="deleteDeck">Excluir</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDecksStore } from '@/stores/decks'

const decksStore = useDecksStore()
const router = useRouter()

const showCreateModal = ref(false)
const newDeckName = ref('')
const newDeckInput = ref(null)
const showDeleteModal = ref(false)
const deckToDelete = ref(null)

function getTotalCards(deck) { return deck.cards.reduce((s, c) => s + c.quantity, 0) }
function getSideTotal(deck) { return (deck.sideboard || []).reduce((s, c) => s + c.quantity, 0) }
function getDeckDomains(deck) {
  const d = new Set()
  ;[...deck.cards, ...(deck.sideboard || [])].forEach((c) => c.domains?.forEach((x) => d.add(x)))
  return [...d]
}

async function openCreateModal() {
  newDeckName.value = ''
  showCreateModal.value = true
  await nextTick()
  newDeckInput.value?.focus()
}
function createDeck() {
  if (!newDeckName.value.trim()) return
  const deck = decksStore.createDeck(newDeckName.value.trim())
  showCreateModal.value = false
  router.push({ name: 'deck-editor', params: { id: deck.id } })
}
function confirmDelete(deck) { deckToDelete.value = deck; showDeleteModal.value = true }
function deleteDeck() {
  if (deckToDelete.value) decksStore.deleteDeck(deckToDelete.value.id)
  showDeleteModal.value = false; deckToDelete.value = null
}
</script>

<style scoped>
.decks-page { display: flex; flex-direction: column; gap: 16px; }

.decks-header { display: flex; align-items: center; justify-content: space-between; }
.decks-title {
  font-family: var(--font-display); font-size: 1.5rem; font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--color-text-primary), var(--color-gold-400));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.decks-subtitle { color: var(--color-text-secondary); font-size: 0.78rem; margin-top: 2px; }

/* ── Empty ── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 20px; text-align: center; gap: 14px;
}
.empty-cards-stack { position: relative; width: 80px; height: 100px; margin-bottom: 4px; }
.empty-cards-stack > div {
  position: absolute; width: 56px; height: 80px;
  border-radius: var(--radius-md); border: 2px dashed var(--color-border-default);
  background: var(--color-bg-raised);
}
.empty-card-1 { top: 0; left: 5px; transform: rotate(-8deg); }
.empty-card-2 { top: 2px; left: 12px; }
.empty-card-3 { top: 4px; left: 19px; transform: rotate(8deg); }
.empty-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.empty-text { color: var(--color-text-secondary); font-size: 0.85rem; max-width: 320px; }

/* ── Deck list (vertical, mobile-friendly) ── */
.decks-list { display: flex; flex-direction: column; gap: 6px; }

.deck-card {
  position: relative; border-radius: var(--radius-md);
  background: var(--color-bg-raised); border: 1px solid var(--color-border-subtle);
  transition: border-color 0.2s;
}
.deck-card:active { background: var(--color-bg-surface); }

.deck-card-link {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; text-decoration: none; color: inherit;
}

.deck-preview {
  flex-shrink: 0; width: 56px; height: 56px;
  border-radius: var(--radius-sm); background: var(--color-bg-deep);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.deck-preview-cards { position: relative; width: 50px; height: 50px; }
.deck-preview-img {
  position: absolute; top: 0; left: 2px; width: 40px; height: 56px;
  object-fit: cover; border-radius: 3px; box-shadow: var(--shadow-sm);
}
.deck-preview-empty { color: var(--color-text-tertiary); }

.deck-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.deck-name { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.deck-stats { font-size: 0.72rem; color: var(--color-text-secondary); }
.deck-domains { display: flex; gap: 3px; flex-wrap: wrap; margin-top: 2px; }
.deck-domains .domain-badge { font-size: 0.55rem; padding: 1px 5px; }

.deck-chevron { flex-shrink: 0; color: var(--color-text-tertiary); }

.deck-actions {
  position: absolute; top: 8px; right: 8px;
  display: flex; gap: 2px; opacity: 0; transition: opacity 0.2s;
}
.deck-card:hover .deck-actions { opacity: 1; }

/* Show actions always on mobile (no hover) */
@media (hover: none) {
  .deck-actions { opacity: 1; }
}

/* ── Modals ── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(6,6,16,0.8); display: flex;
  align-items: flex-end; justify-content: center;
}
.modal {
  width: 100%; max-width: 420px; padding: 24px 20px;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex; flex-direction: column; gap: 14px;
}
.modal-title { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; }
.modal-text { font-size: 0.85rem; color: var(--color-text-secondary); line-height: 1.5; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; }

.btn-danger {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 10px 20px; border: none; border-radius: var(--radius-md);
  font-family: var(--font-body); font-size: 0.85rem; font-weight: 600;
  cursor: pointer; background: rgba(224,85,85,0.15); color: var(--color-domain-body);
  border: 1px solid rgba(224,85,85,0.3); transition: all 0.2s;
}
.btn-danger:hover { background: rgba(224,85,85,0.25); }

@media (min-width: 769px) {
  .decks-title { font-size: 1.8rem; }
  .modal-overlay { align-items: center; padding: 20px; }
  .modal { border-radius: var(--radius-xl); }
}
</style>
