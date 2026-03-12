<template>
  <div class="how-to-play-view fade-in">
    <div class="guide-container">
      
      <!-- Sidebar Navigation (Desktop) -->
      <aside class="guide-sidebar glass">
        <h2 class="sidebar-title">{{ content.meta.title.split('|')[0] }}</h2>
        <nav class="sidebar-nav">
          <a v-for="section in content.sections" 
             :key="section.id" 
             :href="`#${section.id}`"
             class="nav-anchor"
             :class="{ 'nav-anchor--active': activeSection === section.id }"
             @click.prevent="scrollTo(section.id)">
            {{ section.title }}
          </a>
          <a href="#faq"
             class="nav-anchor"
             :class="{ 'nav-anchor--active': activeSection === 'faq' }"
             @click.prevent="scrollTo('faq')">
            FAQ
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="guide-content">
        <!-- Hero Section -->
        <header class="guide-hero">
          <span class="hero-eyebrow">{{ content.hero.eyebrow }}</span>
          <h1 class="hero-title">{{ content.hero.title }}</h1>
          <p class="hero-subtitle">{{ content.hero.subtitle }}</p>
          <div class="hero-actions">
            <button class="btn btn-primary" @click="scrollTo('overview')">{{ content.hero.primaryCta }}</button>
            <button class="btn btn-secondary glass" @click="scrollTo('keywords')">{{ content.hero.secondaryCta }}</button>
          </div>
        </header>

        <!-- Dynamic Sections -->
        <section v-for="(section, index) in content.sections" 
                 :key="section.id" 
                 :id="section.id" 
                 class="guide-section" 
                 :class="{ 'keywords-special-section': section.id === 'keywords' }"
                 ref="sectionRefs">
          <header class="section-header" :class="{ 'centered': section.id === 'keywords' }">
            <div v-if="section.id !== 'keywords'" class="section-number">{{ String(index + 1).padStart(2, '0') }}</div>
            <div v-if="section.id === 'keywords'" class="mastery-crown">👑</div>
            <h2 class="section-title" :class="{ 'mastery-title': section.id === 'keywords' }">{{ section.title }}</h2>
          </header>

          <div class="section-body">
            <!-- Simple Body Text -->
            <p v-if="section.body" class="guide-text" v-html="formatMarkdown(section.body)"></p>

            <!-- Numbered Steps -->
            <div v-if="section.steps" class="steps-list glass">
              <div v-for="(step, i) in section.steps" :key="i" class="step-item">
                <div class="step-num">{{ i + 1 }}</div>
                <div class="step-text">{{ step }}</div>
              </div>
            </div>

            <!-- Bullet Items -->
            <ul v-if="section.items && section.id !== 'keywords'" class="bullet-list">
              <li v-for="(item, i) in section.items" :key="i" class="guide-text"><span class="list-bullet">◆</span> {{ item }}</li>
            </ul>

            <!-- Layout with Blocks -->
            <div v-if="section.blocks" class="blocks-grid" :class="`blocks-${section.id}`">
              <div v-for="(block, i) in section.blocks" :key="i" class="info-card glass">
                <h4 class="info-card-title">{{ block.title }}</h4>
                <p class="info-card-body">{{ block.body }}</p>
              </div>
            </div>

            <!-- Asset Wrapper (Images) -->
            <div v-if="section.asset" class="section-asset-wrapper glass">
              <img :src="section.asset" :alt="section.title" class="section-asset fade-in" loading="lazy" />
            </div>

            <!-- Keywords Special Grid -->
            <div v-if="section.id === 'keywords'" class="keywords-grid">
              <div v-for="(kw, i) in section.items" :key="i" class="keyword-pill glass-premium">
                <span class="keyword-name">{{ kw }}</span>
              </div>
            </div>

            <!-- Important Note -->
            <div v-if="section.note" class="infographic goal-box glass">
              <span class="goal-icon">💡</span>
              <p class="guide-text highlighted" v-html="formatMarkdown(section.note)"></p>
            </div>
          </div>
        </section>

        <!-- FAQ Section -->
        <section id="faq" class="guide-section" ref="sectionRefs">
          <header class="section-header">
            <div class="section-number">FAQ</div>
            <h2 class="section-title">Perguntas Frequentes</h2>
          </header>
          <div class="faq-list">
            <div v-for="q in content.faq" :key="q.id" class="faq-item glass" :class="{ 'faq-open': openFaq === q.id }">
              <button class="faq-question" @click="toggleFaq(q.id)">
                <span>{{ q.q }}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="faq-answer-wrap" :style="{ maxHeight: openFaq === q.id ? '200px' : '0px' }">
                <p class="faq-answer guide-text">{{ q.a }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Final CTA Section -->
        <section class="final-cta-section glass-premium">
          <h2 class="cta-title">{{ content.finalCta.title }}</h2>
          <p class="cta-body guide-text">{{ content.finalCta.body }}</p>
          <div class="cta-buttons">
            <router-link v-for="(btn, i) in content.finalCta.buttons" :key="i" :to="btn.link" class="btn" :class="i === 0 ? 'btn-primary' : 'btn-secondary'">
              {{ btn.label }}
            </router-link>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import contentData from '@/assets/data/how_to_play.json'

const content = ref(contentData)
const activeSection = ref('overview')
const openFaq = ref(null)

function toggleFaq(id) {
  openFaq.value = openFaq.value === id ? null : id
}

function formatMarkdown(text) {
  if (!text) return ''
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    window.scrollTo({
      top: el.offsetTop - 80,
      behavior: 'smooth'
    })
    activeSection.value = id
  }
}

function handleScroll() {
  const scrollPos = window.scrollY + 120
  let currentId = activeSection.value

  for (const section of content.value.sections) {
    const el = document.getElementById(section.id)
    if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
      currentId = section.id
    }
  }
  
  const faqEl = document.getElementById('faq')
  if (faqEl && scrollPos >= faqEl.offsetTop) {
    currentId = 'faq'
  }

  activeSection.value = currentId
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.how-to-play-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.guide-container {
  display: flex;
  gap: 40px;
  position: relative;
}

/* ── Sidebar ── */
.guide-sidebar {
  width: 260px;
  position: sticky;
  top: 80px;
  height: fit-content;
  padding: 24px;
  border-radius: var(--radius-lg);
  display: none;
}

.sidebar-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: var(--color-gold-400);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-anchor {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
}

.nav-anchor:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.04);
}

.nav-anchor--active {
  color: var(--color-gold-400);
  background: rgba(201, 168, 76, 0.08);
  border-left-color: var(--color-gold-500);
}

/* ── Main Content ── */
.guide-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 60px;
}

/* ── Hero ── */
.guide-hero {
  padding: 40px 20px;
  text-align: center;
  border-radius: var(--radius-xl);
  background: radial-gradient(circle at top, rgba(201, 168, 76, 0.1) 0%, transparent 60%);
}
.hero-eyebrow {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(201, 168, 76, 0.15);
  color: var(--color-gold-500);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}
.hero-title {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin-bottom: 16px;
}
.hero-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}
.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* ── Sections ── */
.guide-section {
  scroll-margin-top: 100px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.section-number {
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--color-gold-500);
  opacity: 0.5;
  letter-spacing: 0.1em;
  background: rgba(201, 168, 76, 0.1);
  padding: 4px 10px;
  border-radius: 6px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.guide-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}

.highlighted {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* ── UI Components ── */
.bullet-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.list-bullet {
  color: var(--color-gold-500);
  margin-right: 8px;
  font-size: 0.8rem;
}

.steps-list {
  padding: 24px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 20px 0;
}
.step-item {
  display: flex;
  align-items: center;
  gap: 16px;
}
.step-num {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gold-500);
  color: var(--color-bg-base);
  font-weight: 800;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  flex-shrink: 0;
}
.step-text {
  color: var(--color-text-primary);
  font-weight: 500;
}

.blocks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.info-card {
  padding: 20px;
  border-radius: var(--radius-md);
  border-top: 2px solid transparent;
  transition: all 0.2s;
}
.info-card:hover {
  border-top-color: var(--color-gold-400);
  transform: translateY(-2px);
}
.info-card-title {
  font-family: var(--font-display);
  color: var(--color-gold-400);
  margin-bottom: 8px;
  font-size: 1.1rem;
}
.info-card-body {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.infographic {
  padding: 24px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin: 20px 0;
  background: linear-gradient(135deg, rgba(201, 168, 76, 0.1), transparent);
}
.goal-icon { font-size: 2rem; }

/* ── Assets (Images) ── */
.section-asset-wrapper {
  margin: 32px 0;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background: var(--color-bg-elevated);
  display: flex;
  justify-content: center;
  padding: 24px;
}
.section-asset {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* ── FAQ ── */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.faq-item {
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all 0.3s;
}
.faq-question {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text-primary);
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
}
.faq-question svg {
  transition: transform 0.3s;
  color: var(--color-text-tertiary);
}
.faq-open .faq-question svg {
  transform: rotate(180deg);
  color: var(--color-gold-400);
}
.faq-answer-wrap {
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}
.faq-answer {
  padding: 0 20px 20px;
  margin: 0;
}

/* ── Keywords Special Section ── */
.keywords-special-section {
  margin-top: 40px;
  padding: 48px 24px;
  background: radial-gradient(circle at top, rgba(201, 168, 76, 0.15) 0%, transparent 70%);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(201, 168, 76, 0.2);
}
.section-header.centered {
  flex-direction: column;
  text-align: center;
  gap: 8px;
}
.mastery-crown { font-size: 3rem; margin-bottom: 12px; }
.mastery-title { color: var(--color-gold-400); font-size: 2.25rem; }

.keywords-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}
.keyword-pill {
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}
.keyword-pill:hover {
  background: rgba(201, 168, 76, 0.15);
  border-color: var(--color-gold-500);
  transform: translateY(-2px);
}

/* ── CTA Final ── */
.final-cta-section {
  margin-top: 60px;
  padding: 48px;
  border-radius: var(--radius-xl);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.cta-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-gold-400);
}
.cta-buttons {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

/* ── Tablet/Desktop ── */
@media (min-width: 769px) {
  .guide-sidebar { display: block; }
  .guide-content { max-width: 840px; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.2rem; }
  .hero-actions { flex-direction: column; }
  .section-header { 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    text-align: center; 
    gap: 12px;
  }
  .section-body { text-align: center; }
  .section-title { font-size: 1.5rem; }
  .mastery-title { font-size: 1.6rem; }
  .bullet-list { text-align: left; }
  .info-card { text-align: left; }
  .infographic { flex-direction: column; align-items: center; text-align: center; }
  .cta-buttons { flex-direction: column; width: 100%; }
}
</style>
