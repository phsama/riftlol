<template>
  <div class="app-layout">
    <!-- ── Top bar (mobile: slim, desktop: full) ── -->
    <nav class="app-nav glass">
      <router-link to="/" class="nav-brand">
        <span class="nav-logo">⚔</span>
        <span class="nav-title">Riftbound <span class="nav-title-accent">Deck Manager</span></span>
      </router-link>

      <!-- Desktop nav links -->
      <div class="nav-links-desktop">
        <router-link to="/" class="nav-link" :class="{ 'nav-link--active': $route.name === 'catalog' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>Catálogo</span>
        </router-link>
        <router-link to="/decks" class="nav-link" :class="{ 'nav-link--active': $route.name === 'decks' || $route.name === 'deck-editor' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <span>Meus Decks</span>
        </router-link>
      </div>
    </nav>

    <!-- ── Main content ── -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- ── Bottom tab bar (mobile only) ── -->
    <nav class="bottom-tabs glass">
      <router-link to="/" class="tab-item" :class="{ 'tab-item--active': $route.name === 'catalog' || $route.name === 'card-detail' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>Catálogo</span>
      </router-link>
      <router-link to="/decks" class="tab-item" :class="{ 'tab-item--active': $route.name === 'decks' || $route.name === 'deck-editor' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <span>Decks</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* ── Top Nav ── */
.app-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-primary);
  text-decoration: none;
}
.nav-logo { font-size: 1.2rem; }
.nav-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}
.nav-title-accent { color: var(--color-gold-400); }

.nav-links-desktop {
  display: flex;
  gap: 4px;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}
.nav-link:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.04);
}
.nav-link--active {
  color: var(--color-gold-400) !important;
  background: rgba(201, 168, 76, 0.08) !important;
}

/* ── Main ── */
.app-main {
  flex: 1;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px;
}

/* ── Bottom tabs (mobile) ── */
.bottom-tabs {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-top: 1px solid var(--color-border-subtle);
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0));
  justify-content: space-around;
}
.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 16px;
  color: var(--color-text-tertiary);
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 600;
  transition: color 0.2s;
  border-radius: var(--radius-md);
}
.tab-item--active {
  color: var(--color-gold-400);
}

/* ── Page transition ── */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.page-enter-from { opacity: 0; transform: translateY(6px); }
.page-leave-to  { opacity: 0; transform: translateY(-4px); }

/* ── Mobile ── */
@media (max-width: 768px) {
  .app-nav {
    padding: 0 16px;
    height: 48px;
  }
  .nav-links-desktop { display: none; }

  .bottom-tabs { display: flex; }

  .app-main {
    padding: 16px;
    padding-bottom: 80px; /* space for bottom tabs */
  }
}
</style>
