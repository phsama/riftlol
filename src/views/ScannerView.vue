
<template>
  <div class="scanner-view fade-in">
    <header class="scanner-header">
      <h1 class="scanner-title">Scanear Carta</h1>
      <p class="scanner-subtitle">Aponte a câmera para uma carta física para identificá-la.</p>
    </header>

    <div class="scanner-container">
      <!-- Camera Preview -->
      <div class="camera-wrapper" :class="{ 'camera-active': isCameraOpen }">
        <video ref="video" autoplay playsinline class="camera-video"></video>
        <canvas ref="canvas" style="display: none;"></canvas>
        
        <!-- Overlay for card alignment -->
        <div class="camera-overlay">
          <div class="scan-frame"></div>
          <div class="scan-line"></div>
        </div>

        <!-- Initial Start Button -->
        <div v-if="!isCameraOpen" class="camera-placeholder">
          <div class="placeholder-icon">📸</div>
          <button class="btn btn-primary" @click="startCamera">Abrir Câmera</button>
        </div>

        <!-- Loading / Processing state -->
        <div v-if="processing" class="processing-overlay">
          <div class="spinner"></div>
          <span>Identificando carta...</span>
        </div>
      </div>

      <!-- Controls -->
      <div class="scanner-controls" v-if="isCameraOpen && !processing">
        <button class="btn btn-ghost btn-icon-large" @click="stopCamera">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        
        <button class="capture-btn" @click="capturePhoto">
          <div class="capture-btn-inner"></div>
        </button>

        <button class="btn btn-ghost btn-icon-large" @click="switchCamera">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>
    </div>

    <!-- Results Area -->
    <div v-if="resultCard" class="scan-result fade-in">
       <div class="result-header">
         <span>Carta Identificada:</span>
         <button class="btn-ghost btn-sm" @click="resultCard = null">Limpar</button>
       </div>
       <router-link :to="{ name: 'card-detail', params: { name: resultCard.name } }" class="result-card-link">
         <img :src="resultCard.media?.image_url" :alt="resultCard.name" class="result-thumb" />
         <div class="result-info">
           <h3 class="result-name">{{ resultCard.name }}</h3>
           <span class="rarity-badge" :class="`rarity-${resultCard.classification?.rarity?.toLowerCase()}`">
             {{ resultCard.classification?.rarity }}
           </span>
         </div>
       </router-link>

        <div class="collection-controls scan-controls-panel">
            <h4 class="scan-controls-title">Adicionar à Coleção</h4>
            
           <!-- Normal Group -->
           <div class="manage-group">
              <h5 class="manage-group-title">Arte Padrão</h5>
              <div class="manage-row">
                 <span class="manage-label">Normal</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(resultCard.id, 'normal_qty', -1)">−</button>
                    <span class="step-val">{{ getQty('normal_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(resultCard.id, 'normal_qty', 1)">+</button>
                 </div>
              </div>
              <div class="manage-row foil-row">
                 <span class="manage-label manage-label-foil">⭐ Foil Brilhante</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(resultCard.id, 'foil_qty', -1)">−</button>
                    <span class="step-val">{{ getQty('foil_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(resultCard.id, 'foil_qty', 1)">+</button>
                 </div>
              </div>
           </div>

           <!-- AArt Group -->
           <div class="manage-group" v-if="hasAltArt">
              <h5 class="manage-group-title v-alt">Arte Alternativa</h5>
              <div class="manage-row">
                 <span class="manage-label">Normal AArt</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(resultCard.id, 'alt_art_qty', -1)">−</button>
                    <span class="step-val">{{ getQty('alt_art_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(resultCard.id, 'alt_art_qty', 1)">+</button>
                 </div>
              </div>
              <div class="manage-row foil-row">
                 <span class="manage-label manage-label-foil">⭐ AArt Foil</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(resultCard.id, 'alt_art_foil_qty', -1)">−</button>
                    <span class="step-val">{{ getQty('alt_art_foil_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(resultCard.id, 'alt_art_foil_qty', 1)">+</button>
                 </div>
              </div>
           </div>

           <!-- Overnumbered Group -->
           <div class="manage-group" v-if="hasSigned">
              <h5 class="manage-group-title v-sign">📈 Overnumbered</h5>
              <div class="manage-row">
                 <span class="manage-label">Normal Over</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(resultCard.id, 'overnumbered_qty', -1)">−</button>
                    <span class="step-val">{{ getQty('overnumbered_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(resultCard.id, 'overnumbered_qty', 1)">+</button>
                 </div>
              </div>
              <div class="manage-row foil-row">
                 <span class="manage-label manage-label-foil">⭐ Over Foil</span>
                 <div class="variant-stepper">
                    <button class="step-btn" @click="collectionStore.updateItemQty(resultCard.id, 'overnumbered_foil_qty', -1)">−</button>
                    <span class="step-val">{{ getQty('overnumbered_foil_qty') }}</span>
                    <button class="step-btn step-add" @click="collectionStore.updateItemQty(resultCard.id, 'overnumbered_foil_qty', 1)">+</button>
                 </div>
              </div>
           </div>
        </div>

       <button class="btn btn-primary" style="width: 100%; margin-top: 12px;" @click="goToCard">Ver Detalhes</button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { createWorker } from 'tesseract.js'
import riftcodexService from '@/services/riftcodex'
import { useCollectionStore } from '@/stores/collection'

const router = useRouter()
const collectionStore = useCollectionStore()
const video = ref(null)
const canvas = ref(null)
const isCameraOpen = ref(false)
const processing = ref(false)
const resultCard = ref(null)
const stream = ref(null)
const facingMode = ref('environment') // Default to back camera
const allCardsData = ref([])

function getQty(field) { return collectionStore.items[resultCard.value?.id]?.[field] || 0 }

const recognizedCardVersions = computed(() => {
  if (!resultCard.value) return []
  return allCardsData.value.filter(c => c.name === resultCard.value.name)
})
const hasAltArt = computed(() => recognizedCardVersions.value.length > 1)
const hasSigned = computed(() => {
  return recognizedCardVersions.value.some(v => 
        (v.tags && v.tags.some(t => t.toLowerCase().includes('sign') || t.toLowerCase().includes('over'))) || 
        v.metadata?.signature === true
    )
})

async function startCamera() {
  try {
    const constraints = {
      video: { facingMode: facingMode.value }
    }
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (video.value) {
      video.value.srcObject = stream.value
      isCameraOpen.value = true
    }
  } catch (err) {
    console.error("Error accessing camera:", err)
    alert("Não foi possível acessar a câmera. Verifique as permissões.")
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
  }
  isCameraOpen.value = false
}

async function switchCamera() {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
  stopCamera()
  await startCamera()
}

async function capturePhoto() {
  if (!video.value || !canvas.value) return

  processing.value = true
  const context = canvas.value.getContext('2d')
  
  // Scale up the canvas 2.5x to give Tesseract a much higher resolution image to parse
  const SCALE = 2.5; 
  canvas.value.width = video.value.videoWidth * SCALE
  canvas.value.height = video.value.videoHeight * SCALE
  
  // Disable smoothing for OCR to keep edges sharp
  context.imageSmoothingEnabled = false;
  
  // Apply harsh binarization-like filters to make white-on-yellow contrast readable
  context.filter = 'grayscale(100%) contrast(350%) brightness(85%)';
  
  context.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height)
  
  // Reset filter
  context.filter = 'none';

  const imageData = canvas.value.toDataURL('image/jpeg', 0.9)
  
  try {
    // 1. Run local OCR with Tesseract
    const worker = await createWorker('eng')
    const { data: { text } } = await worker.recognize(imageData)
    await worker.terminate()
    
    console.log("OCR Raw Text:", text)
    
    // 2. Local search against cached cards
    const allCards = await riftcodexService.getCards()
    allCardsData.value = allCards // Cache for computed properties
    const stringSimilarity = (await import('string-similarity')).default;
    
    // Clean and split ALL OCR text into an array of words
    const allOcrWords = text
      .toLowerCase()
      .replace(/['`’]/g, "'")
      .replace(/[^a-z0-9'\s]/g, "") // remove punctuation for cleaner matches
      .split(/\s+/)
      .filter(w => w.length > 0);
      
    let bestMatch = null;
    let highestScore = 0;
    
    // Evaluate sliding window over the OCR words to find the best fuzzy substring match
    for (const card of allCards) {
      const cardNameClean = card.name.toLowerCase().replace(/['`’]/g, "'").replace(/[^a-z0-9'\s]/g, "");
      const cardWords = cardNameClean.split(/\s+/).filter(w => w.length > 0);

      // Direct exact match (shortcut)
      if (allOcrWords.join(" ").includes(cardNameClean)) {
        highestScore = 1.0;
        bestMatch = card;
        break; // Perfect match found!
      }

      // Sliding window
      if (allOcrWords.length >= cardWords.length) {
        for (let i = 0; i <= allOcrWords.length - cardWords.length; i++) {
          const windowText = allOcrWords.slice(i, i + cardWords.length).join(' ');
          const score = stringSimilarity.compareTwoStrings(cardNameClean, windowText);
          if (score > highestScore) {
            highestScore = score;
            bestMatch = card;
          }
        }
      } else if (allOcrWords.length > 0) {
        const score = stringSimilarity.compareTwoStrings(cardNameClean, allOcrWords.join(' '));
        if (score > highestScore) {
          highestScore = score;
          bestMatch = card;
        }
      }
    }
    
    console.log(`Best OCR Match: ${bestMatch?.name} (Score: ${highestScore.toFixed(2)})`)
    
    // Threshold of 0.60 is safe now since sliding window isolates the exact name tokens
    if (bestMatch && highestScore >= 0.60) {
      resultCard.value = bestMatch;
    } else {
      alert("Não foi possível identificar a carta com precisão. Aproxime a câmera, melhore a luz e tente novamente.");
    }
  } catch (err) {
    console.error("Scan error:", err)
    alert("Erro ao processar imagem.");
  } finally {
    processing.value = false
  }
}

function goToCard() {
  if (resultCard.value) {
    router.push({ name: 'card-detail', params: { name: resultCard.value.name } })
  }
}

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<style scoped>
.scanner-view {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 40px;
}

.scanner-header { text-align: center; }
.scanner-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; }
.scanner-subtitle { color: var(--color-text-secondary); font-size: 0.85rem; }

.scanner-container {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  background: black;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
}

.camera-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 10;
}
.placeholder-icon { font-size: 3rem; opacity: 0.5; }

.camera-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  width: 70%;
  aspect-ratio: 744 / 1039;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.3);
}

.scan-line {
  position: absolute;
  top: 15%;
  left: 15%;
  right: 15%;
  height: 2px;
  background: var(--color-gold-400);
  box-shadow: 0 0 10px var(--color-gold-400);
  animation: scan-move 2.5s ease-in-out infinite;
  opacity: 0.8;
}

@keyframes scan-move {
  0%, 100% { top: 15%; }
  50% { top: 85%; }
}

.processing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: white;
  z-index: 20;
}

.scanner-controls {
  position: absolute;
  bottom: 24px;
  left: 0; right: 0;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  z-index: 15;
}

.capture-btn {
  width: 64px; height: 64px;
  border-radius: 50%;
  background: white;
  border: 4px solid rgba(255,255,255,0.3);
  padding: 4px;
  cursor: pointer;
  transition: transform 0.2s;
}
.capture-btn:active { transform: scale(0.9); }
.capture-btn-inner {
  width: 100%; height: 100%;
  border-radius: 50%;
  border: 2px solid black;
}

.btn-icon-large {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  color: white;
}

/* Results */
.scan-result {
  background: var(--color-bg-raised);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-lg);
}

.result-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
  margin-bottom: 12px;
  text-transform: uppercase;
  font-weight: 700;
}

.result-card-link {
  display: flex;
  gap: 16px;
  text-decoration: none;
  color: inherit;
  padding: 8px;
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.03);
  transition: background 0.2s;
}
.result-card-link:hover { background: rgba(255,255,255,0.06); }

.result-thumb {
  width: 60px;
  aspect-ratio: 744 / 1039;
  object-fit: cover;
  border-radius: 4px;
}

.result-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.result-name { font-size: 1.1rem; font-weight: 700; }

.spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--color-gold-400);
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}
@keyframes rotate { to { transform: rotate(360deg); } }

/* Controls Panel Detailed */
.scan-controls-panel {
    background: rgba(0,0,0,0.2);
    border-radius: var(--radius-md);
    padding: 12px;
    margin-top: 12px;
}
.scan-controls-title { font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; text-align: center; }
.collection-controls { display: flex; flex-direction: column; gap: 12px; }

.manage-group { display: flex; flex-direction: column; gap: 6px; background: rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
.manage-group-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-tertiary); font-weight: 700; margin-bottom: 4px; }
.v-alt { color: #d67cf2 !important; }
.v-sign { color: #50b88a !important; }
.manage-row { display: flex; justify-content: space-between; align-items: center; }
.foil-row { margin-top: 4px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.05); }
.manage-label { font-size: 0.85rem; font-weight: 600; color: var(--color-text-secondary); }
.manage-label-foil { color: var(--color-gold-400); text-shadow: 0 0 6px rgba(201,168,76,0.3); }

.variant-stepper { display: flex; align-items: center; gap: 8px; }
.step-val { font-family: var(--font-display); font-size: 0.9rem; font-weight: 700; width: 18px; text-align: center; color: var(--color-text-primary); }
.step-btn { width: 28px; height: 28px; border:none; border-radius:4px; background: rgba(255,255,255,0.1); color: var(--color-text-secondary); display:flex; align-items:center; justify-content:center; font-weight:700; font-family: var(--font-body); cursor:pointer; transition:all 0.15s; }
.step-btn:hover { background: var(--color-border-subtle); color: var(--color-text-primary); }
.step-add { color: var(--color-text-primary); background: rgba(255,255,255,0.15); }
.step-add:hover { background: rgba(74, 127, 255, 0.3); color: var(--color-rift-400); }
</style>
