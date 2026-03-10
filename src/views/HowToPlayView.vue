<template>
  <div class="how-to-play-view fade-in">
    <div class="guide-container">
      <!-- Sidebar Navigation (Desktop) -->
      <aside class="guide-sidebar glass">
        <h2 class="sidebar-title">{{ $t('how_to_play.title') }}</h2>
        <nav class="sidebar-nav">
          <a v-for="section in sections" 
             :key="section.id" 
             :href="`#${section.id}`"
             class="nav-anchor"
             :class="{ 'nav-anchor--active': activeSection === section.id }"
             @click.prevent="scrollTo(section.id)">
            {{ $t(`how_to_play.${section.id}.title`) }}
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="guide-content">
        <!-- Intro Section -->
        <section id="intro" class="guide-section" ref="section_intro">
          <header class="section-header">
            <div class="section-number">01</div>
            <h2 class="section-title">{{ $t('how_to_play.intro.title') }}</h2>
          </header>
          <div class="section-body">
            <p class="guide-text" v-html="formatMarkdown($t('how_to_play.intro.p1'))"></p>
            <div class="infographic goal-box glass">
              <span class="goal-icon">🏆</span>
              <p class="guide-text highlighted" v-html="formatMarkdown($t('how_to_play.intro.p2'))"></p>
            </div>
          </div>
        </section>

        <!-- Deckbuilding Section -->
        <section id="deckbuilding" class="guide-section" ref="section_deckbuilding">
          <header class="section-header">
            <div class="section-number">02</div>
            <h2 class="section-title">{{ $t('how_to_play.deckbuilding.title') }}</h2>
          </header>
          <div class="section-body">
            <p class="guide-text" v-html="formatMarkdown($t('how_to_play.deckbuilding.p1'))"></p>
            <p class="guide-text" v-html="formatMarkdown($t('how_to_play.deckbuilding.p2'))"></p>
            <div class="card-types-grid">
               <div class="type-card glass">
                 <span class="type-icon">👤</span>
                 <span class="type-label">Legend</span>
               </div>
               <div class="type-card glass">
                 <span class="type-icon">🛡️</span>
                 <span class="type-label">Unit</span>
               </div>
               <div class="type-card glass">
                 <span class="type-icon">✨</span>
                 <span class="type-label">Spell</span>
               </div>
            </div>
          </div>
        </section>

        <!-- Resources Section -->
        <section id="resources" class="guide-section" ref="section_resources">
          <header class="section-header">
            <div class="section-number">03</div>
            <h2 class="section-title">{{ $t('how_to_play.resources.title') }}</h2>
          </header>
          <div class="section-body">
            <p class="guide-text" v-html="formatMarkdown($t('how_to_play.resources.p1'))"></p>
            <div class="rune-mechanics glass">
               <div class="mechanic-item">
                  <span class="mech-badge">Exhaust</span>
                  <p class="guide-text small" v-html="formatMarkdown($t('how_to_play.resources.p2').split(') ou ')[0] + ')')"></p>
               </div>
               <div class="mechanic-divider"></div>
               <div class="mechanic-item">
                  <span class="mech-badge sac">Sacrifice</span>
                  <p class="guide-text small" v-html="formatMarkdown($t('how_to_play.resources.p2').split(') ou ')[1])"></p>
               </div>
            </div>
          </div>
        </section>

        <!-- Combat Section -->
        <section id="combat" class="guide-section" ref="section_combat">
          <header class="section-header">
            <div class="section-number">04</div>
            <h2 class="section-title">{{ $t('how_to_play.combat.title') }}</h2>
          </header>
          <div class="section-body">
            <p class="guide-text" v-html="formatMarkdown($t('how_to_play.combat.p1'))"></p>
            <div class="domains-grid">
               <div v-for="d in ['Body', 'Mind', 'Calm', 'Chaos', 'Order', 'Fury']" :key="d" :class="['domain-pill', `domain-${d.toLowerCase()}`]">
                  {{ d }}
               </div>
            </div>
            <p class="guide-text mt-4" v-html="formatMarkdown($t('how_to_play.combat.p2'))"></p>
          </div>
        </section>

        <!-- Keywords Section (High Emphasis) -->
        <section id="keywords" class="guide-section keywords-special-section" ref="section_keywords">
          <header class="section-header centered">
            <div class="mastery-crown">👑</div>
            <h2 class="section-title mastery-title">{{ $t('how_to_play.keywords.title') }}</h2>
            <p class="mastery-subtitle">{{ $t('how_to_play.keywords.subtitle') }}</p>
          </header>
          
          <div class="keywords-grid">
            <div v-for="(kw, key) in tm('how_to_play.keywords.list')" :key="key" class="keyword-card glass-premium">
               <div class="keyword-header">
                 <span class="keyword-name">[{{ kw.name }}]</span>
               </div>
               <p class="keyword-desc" v-html="formatMarkdown(kw.desc)"></p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { tm } = useI18n()

function formatMarkdown(text) {
  if (!text) return ''
  // Replace **text** with <strong>text</strong>
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

const activeSection = ref('intro')
const sections = [
  { id: 'intro' },
  { id: 'deckbuilding' },
  { id: 'resources' },
  { id: 'combat' },
  { id: 'keywords' }
]

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
  const scrollPos = window.scrollY + 100
  for (const section of sections) {
    const el = document.getElementById(section.id)
    if (el && scrollPos >= el.offsetTop && scrollPos < el.offsetTop + el.offsetHeight) {
      activeSection.value = section.id
    }
  }
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
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--color-gold-500);
  opacity: 0.5;
  letter-spacing: 0.1em;
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

.guide-text.small { font-size: 0.85rem; }

.highlighted {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* ── UI Components ── */
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

.card-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.type-card {
  padding: 20px;
  text-align: center;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: transform 0.2s;
}
.type-card:hover { transform: translateY(-4px); }
.type-icon { font-size: 1.5rem; }
.type-label { font-weight: 700; font-size: 0.85rem; text-transform: uppercase; color: var(--color-text-primary); }

.rune-mechanics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-radius: var(--radius-lg);
  margin-top: 20px;
}

.mech-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--color-rift-500);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.mech-badge.sac { background: var(--color-domain-fury); }

.mechanic-divider {
  height: 1px;
  background: var(--color-border-subtle);
  width: 100%;
}

.domains-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.domain-pill {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
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
.mastery-subtitle {
  color: var(--color-text-tertiary);
  font-style: italic;
  font-size: 1.1rem;
}

.keywords-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.keyword-card {
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-premium {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}

.keyword-card:hover {
  transform: translateY(-8px) scale(1.02);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(201, 168, 76, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(201, 168, 76, 0.1);
}

.keyword-header {
  margin-bottom: 12px;
}

.keyword-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-gold-400);
}

.keyword-desc {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
}

/* ── Tablet/Desktop ── */
@media (min-width: 769px) {
  .guide-sidebar { display: block; }
  .guide-content { max-width: 800px; }
  .rune-mechanics { flex-direction: row; align-items: stretch; }
  .mechanic-divider { width: 1px; height: auto; }
}

@media (max-width: 768px) {
  .section-title { font-size: 1.4rem; }
  .mastery-title { font-size: 1.6rem; }
  .keywords-grid { grid-template-columns: 1fr; }
}

.mt-4 { margin-top: 1rem; }
</style>
