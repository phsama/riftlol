<template>
  <div class="card-detail fade-in" v-if="card">
    <!-- Back -->
    <router-link to="/" class="back-link">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Voltar
    </router-link>

    <div class="detail-layout">
      <!-- Card image -->
      <div class="detail-image-wrap">
        <img :src="card.media?.image_url" :alt="card.name" class="detail-image" />
        <div v-if="isChampion" class="champion-badge">⭐ Lenda</div>
        
        <!-- Alt arts slider -->
        <div v-if="cardVersions.length > 1" class="art-slider-controls">
           <button class="slider-btn" @click="prevArt" :disabled="currentVersionIndex === 0">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
           </button>
           <div class="slider-dots">
               <span v-for="(v, idx) in cardVersions" :key="v.id" class="slider-dot" :class="{ 'slider-dot--active': idx === currentVersionIndex }" @click="setArt(idx)"></span>
           </div>
           <button class="slider-btn" @click="nextArt" :disabled="currentVersionIndex === cardVersions.length - 1">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
           </button>
        </div>
      </div>

      <!-- Card info -->
      <div class="detail-info">
        <h1 class="detail-name">{{ card.name }}</h1>

        <div class="detail-classification">
          <span class="detail-type">{{ card.classification?.supertype ? `${card.classification.supertype} ` : '' }}{{ card.classification?.type }}</span>
          <span v-if="card.classification?.rarity" class="rarity-badge" :class="`rarity-${card.classification.rarity.toLowerCase()}`">{{ card.classification.rarity }}</span>
        </div>

        <div class="detail-domains" v-if="card.classification?.domain?.length">
          <span v-for="d in card.classification.domain" :key="d" class="domain-badge" :class="`domain-${d.toLowerCase()}`">{{ d }}</span>
        </div>

        <!-- Attributes -->
        <div class="detail-attributes" v-if="hasAttributes">
          <div class="attr-chip" v-if="card.attributes?.energy != null">
            <span class="attr-label">Energia</span>
            <span class="attr-value attr-energy">{{ card.attributes.energy }}</span>
          </div>
          <div class="attr-chip" v-if="card.attributes?.might != null">
            <span class="attr-label">Might</span>
            <span class="attr-value attr-might">{{ card.attributes.might }}</span>
          </div>
          <div class="attr-chip" v-if="card.attributes?.power != null">
            <span class="attr-label">Power</span>
            <span class="attr-value attr-power">{{ card.attributes.power }}</span>
          </div>
        </div>

        <!-- Card text -->
        <div class="detail-text" v-if="card.text?.rich" v-html="formatCardText(card.text.rich)"></div>
        <div class="detail-text" v-else-if="card.text?.plain" v-html="formatCardText(card.text.plain)"></div>

        <!-- Meta -->
        <div class="detail-meta-row" v-if="card.set">
          <span class="meta-label">Set:</span> {{ card.set.label }} ({{ card.set.id }})
        </div>
        <div class="detail-meta-row" v-if="card.media?.artist">
          <span class="meta-label">Artista:</span> {{ card.media.artist }}
        </div>
        <div class="detail-meta-row" v-if="card.public_code">
          <span class="meta-label">Código:</span> {{ card.public_code }}
        </div>

        <div class="detail-tags" v-if="card.tags?.length">
          <span v-for="tag in card.tags" :key="tag" class="tag-chip">{{ tag }}</span>
        </div>

        <!-- Metadata badges -->
        <div class="detail-badges" v-if="card.metadata?.alternate_art || card.metadata?.signature || card.metadata?.overnumbered">
          <span v-if="card.metadata.alternate_art" class="meta-badge meta-alt">Arte Alternativa</span>
          <span v-if="card.metadata.signature" class="meta-badge meta-sig">Assinada</span>
          <span v-if="card.metadata.overnumbered" class="meta-badge meta-over">Overnumbered</span>
        </div>

        <!-- Add to deck (sticky on mobile) -->
        <div class="detail-actions">
          <div class="deck-selector" v-if="decksStore.decks.length">
            <select v-model="selectedDeckId" class="input" id="deck-select">
              <option value="" disabled>Selecionar deck...</option>
              <option v-for="deck in decksStore.decks" :key="deck.id" :value="deck.id">{{ deck.name }}</option>
            </select>
            <button class="btn btn-primary" :disabled="!selectedDeckId" @click="addToDeck">Adicionar</button>
          </div>
          <router-link v-else to="/decks" class="btn btn-secondary" style="width:100%;">Criar seu primeiro deck</router-link>
        </div>
      </div>
    </div>

    <div v-if="showToast" class="toast toast-success">✓ Carta adicionada!</div>
  </div>

  <!-- Loading -->
  <div v-else-if="loading" class="detail-loading fade-in">
    <div class="skeleton" style="width: 100%; max-width: 280px; aspect-ratio: 744/1039; border-radius: var(--radius-lg); margin: 0 auto;"></div>
    <div class="skeleton" style="width: 60%; height: 28px; margin: 16px auto 0;"></div>
  </div>

  <!-- Error -->
  <div v-else class="empty-state fade-in">
    <div style="font-size: 2.5rem;">😔</div>
    <h3 class="empty-title">Carta não encontrada</h3>
    <p class="empty-text">{{ error || 'Não foi possível carregar essa carta.' }}</p>
    <router-link to="/" class="btn btn-primary">Voltar ao catálogo</router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCards, searchCards } from '@/services/riftcodex'
import { useDecksStore } from '@/stores/decks'

const props = defineProps({ name: String })
const route = useRoute()
const decksStore = useDecksStore()

const card = ref(null)
const loading = ref(true)
const error = ref(null)
const selectedDeckId = ref('')
const showToast = ref(false)

const cardVersions = ref([])
const currentVersionIndex = ref(0)

const isChampion = computed(() => card.value?.classification?.type === 'Legend')
const hasAttributes = computed(() => {
  const a = card.value?.attributes
  return a && (a.energy != null || a.might != null || a.power != null)
})

function formatCardText(text) {
  if (!text) return ''
  let formatted = text
  
  // Custom format: Bold bracketed keywords like [Action], [Repeat], [Deflect X]
  formatted = formatted.replace(/\[(.*?)\]/g, '<strong>[$1]</strong>')

  // Energy cost parser: :rb_energy_1:
  formatted = formatted.replace(/:rb_energy_(\d+):/g, '<span class="inline-icon cost-energy"><span>$1</span></span>')
  
  // Rune cost parser: :rb_rune_mind:
  formatted = formatted.replace(/:rb_rune_([a-zA-Z]+):/g, (match, runeGroup) => {
      const rune = runeGroup.toLowerCase()
      let symbol = ''
      if (rune === 'mind') symbol = '🧠'
      else if (rune === 'fury') symbol = '🔥'
      else if (rune === 'body') symbol = '💪'
      else if (rune === 'calm') symbol = '🌊'
      else if (rune === 'chaos') symbol = '🌀'
      else if (rune === 'order') symbol = '🛡️'
      else if (rune === 'rainbow') symbol = '🌈'
      else symbol = '✨'
      
      // We capitalize the text
      const runeName = rune.charAt(0).toUpperCase() + rune.slice(1)
      return `<span class="inline-icon cost-rune cost-${rune}" title="${runeName}"> ${symbol}</span>`
  })

  // Keep line breaks
  return formatted.replace(/\n/g, '<br>')
}

function prevArt() {
  if (currentVersionIndex.value > 0) {
    currentVersionIndex.value--
    card.value = cardVersions.value[currentVersionIndex.value]
  }
}
function nextArt() {
  if (currentVersionIndex.value < cardVersions.value.length - 1) {
    currentVersionIndex.value++
    card.value = cardVersions.value[currentVersionIndex.value]
  }
}
function setArt(idx) {
  currentVersionIndex.value = idx
  card.value = cardVersions.value[idx]
}

function addToDeck() {
  if (!selectedDeckId.value || !card.value) return
  decksStore.addCard(selectedDeckId.value, card.value)
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}

onMounted(async () => {
  loading.value = true
  try {
    const cardName = decodeURIComponent(props.name || route.params.name).trim()
    console.log("Loading card:", cardName)
    const allCards = await getCards()
    
    // Use a more relaxed name matching to handle potential encoding/apostrophe issues
    const normalizedTarget = cardName.toLowerCase().replace(/['’]/g, "'")
    let versions = allCards.filter((c) => {
      const normalizedCardName = c.name.toLowerCase().replace(/['’]/g, "'")
      return normalizedCardName === normalizedTarget
    })

    if (versions.length === 0) {
      const searchResult = await searchCards(cardName)
      const results = Array.isArray(searchResult) ? searchResult : (searchResult?.items || [])
      versions = results.filter((c) => {
        const normalizedCardName = c.name.toLowerCase().replace(/['’]/g, "'")
        return normalizedCardName === normalizedTarget
      })
      if (versions.length === 0 && results.length > 0) {
        versions = [results[0]]
      }
    }
    
    if (versions.length > 0) {
      // Sort versions: Normal/Standard first, then others
      versions.sort((a, b) => {
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
      
      cardVersions.value = versions
      currentVersionIndex.value = 0
      card.value = cardVersions.value[0]
    } else {
      error.value = 'Carta não encontrada no catálogo.'
    }
  } catch (e) {
    error.value = 'Erro ao carregar a carta.'
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.card-detail { max-width: 960px; margin: 0 auto; }

.back-link {
  display: inline-flex; align-items: center; gap: 4px;
  color: var(--color-text-secondary); font-size: 0.82rem; font-weight: 500;
  margin-bottom: 12px; transition: color 0.2s;
}
.back-link:hover { color: var(--color-text-primary); }

/* ── Layout: stacked mobile, side-by-side desktop ── */
.detail-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-image-wrap {
  position: relative;
  max-width: 280px;
  margin: 0 auto;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg), var(--shadow-glow-gold);
}
.detail-image { width: 100%; height: auto; display: block; border-radius: var(--radius-lg); }
.champion-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: rgba(201, 168, 76, 0.9);
  color: var(--color-text-inverse);
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
}

/* Alt arts slider */
.art-slider-controls {
  position: absolute;
  bottom: 0px; left: 0; right: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 12px 16px;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
}
.slider-btn {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.slider-btn:hover:not(:disabled) {
  background: var(--color-gold-400); color: black; border-color: var(--color-gold-500);
}
.slider-btn:disabled {
  opacity: 0.3; cursor: not-allowed;
}
.slider-dots {
  display: flex; gap: 6px;
}
.slider-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer; transition: all 0.2s;
}
.slider-dot--active {
  background: var(--color-gold-400); transform: scale(1.2); box-shadow: 0 0 6px var(--color-gold-500);
}

.detail-info { display: flex; flex-direction: column; gap: 12px; }

.detail-name {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.detail-classification { display: flex; align-items: center; gap: 8px; }
.detail-type { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 500; }
.detail-domains { display: flex; gap: 6px; flex-wrap: wrap; }

.detail-attributes { display: flex; gap: 8px; }
.attr-chip {
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 14px; background: var(--color-bg-raised);
  border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md);
  min-width: 64px;
}
.attr-label {
  font-size: 0.6rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--color-text-tertiary);
}
.attr-value { font-family: var(--font-display); font-size: 1.3rem; font-weight: 800; }
.attr-energy { color: var(--color-rift-400); }
.attr-might  { color: var(--color-domain-fury); }
.attr-power  { color: var(--color-gold-400); }

.detail-text {
  padding: 16px; background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--color-border-subtle); border-radius: var(--radius-md);
  font-size: 0.88rem; line-height: 1.6; color: var(--color-text-secondary);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.2);
}
.detail-text :deep(em) { color: var(--color-text-tertiary); font-style: italic; }
.detail-text :deep(strong) { color: var(--color-text-primary); font-weight: 700; }

/* Inline icon styling for card text parser */
.detail-text :deep(.inline-icon) {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 50%; width: 18px; height: 18px;
    font-size: 0.65rem; font-weight: 800; font-family: var(--font-display);
    margin: 0 2px; vertical-align: middle;
    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.detail-text :deep(.inline-icon.cost-energy) { background: var(--color-bg-deep); border: 1px solid var(--color-rift-500); color: var(--color-rift-400); }
.detail-text :deep(.inline-icon.cost-rune) { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); }
.detail-text :deep(.cost-mind) { box-shadow: 0 0 8px rgba(139, 111, 212, 0.4); }
.detail-text :deep(.cost-fury) { box-shadow: 0 0 8px rgba(215, 60, 60, 0.4);   }
.detail-text :deep(.cost-rainbow) { box-shadow: 0 0 8px rgba(255, 215, 0, 0.4); background: linear-gradient(135deg, rgba(215,60,60,0.5), rgba(74,127,255,0.5), rgba(80,184,138,0.5)); border: none;}

.detail-meta-row { font-size: 0.78rem; color: var(--color-text-secondary); }
.meta-label { font-weight: 600; color: var(--color-text-tertiary); margin-right: 4px; }

.detail-tags { display: flex; gap: 4px; flex-wrap: wrap; }
.tag-chip {
  padding: 2px 7px; background: var(--color-bg-surface);
  border-radius: var(--radius-full); font-size: 0.68rem; color: var(--color-text-secondary);
}

.detail-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.meta-badge {
  padding: 3px 8px; border-radius: var(--radius-full);
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
}
.meta-alt  { background: rgba(201, 168, 76, 0.15); color: var(--color-gold-400); }
.meta-sig  { background: rgba(139, 111, 212, 0.15); color: var(--color-domain-mind); }
.meta-over { background: rgba(74, 127, 255, 0.15); color: var(--color-rift-400); }

/* ── Add to deck ── */
.detail-actions {
  margin-top: 4px; padding-top: 12px;
  border-top: 1px solid var(--color-border-subtle);
}
.deck-selector { display: flex; gap: 8px; }
.deck-selector .input { flex: 1; }

/* ── States ── */
.detail-loading { padding: 20px; }
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 20px; text-align: center; gap: 10px;
}
.empty-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; }
.empty-text { color: var(--color-text-secondary); font-size: 0.85rem; }

/* ── Desktop ── */
@media (min-width: 769px) {
  .detail-layout {
    flex-direction: row;
    gap: 36px;
    align-items: flex-start;
  }
  .detail-image-wrap {
    flex-shrink: 0;
    width: 320px;
    max-width: 320px;
    margin: 0;
  }
  .detail-name { font-size: 2rem; }
}
</style>
