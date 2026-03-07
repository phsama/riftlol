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
        
        <!-- Auth Section -->
        <div class="nav-auth" v-if="authStore.isInitialized">
          <template v-if="authStore.user">
            <div class="user-profile">
              <img v-if="authStore.user.user_metadata?.avatar_url" :src="authStore.user.user_metadata.avatar_url" alt="Avatar" class="user-avatar" />
              <div v-else class="user-avatar-placeholder">{{ authStore.user.email?.charAt(0).toUpperCase() }}</div>
              <button class="nav-btn btn-ghost" @click="authStore.signOut" title="Sair">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </template>
          <template v-else>
            <button class="nav-btn btn-primary" @click="handleLoginGoogle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Entrar
            </button>
          </template>
        </div>
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
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})

async function handleLoginGoogle() {
  try {
    await authStore.signInWithGoogle()
  } catch (err) {
    console.error("Login Error:", err)
    alert("Houve um erro ao tentar logar com o Google.")
  }
}
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

/* ── Auth Secion ── */
.nav-auth {
  display: flex;
  align-items: center;
  margin-left: 12px;
  padding-left: 16px;
  border-left: 1px solid var(--color-border-subtle);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}
.btn-primary {
  background: var(--color-text-primary);
  color: var(--color-bg-base);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}
.btn-primary:active { transform: scale(0.96); }
.btn-ghost {
  background: transparent;
  color: var(--color-text-tertiary);
  padding: 6px 8px;
}
.btn-ghost:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border-subtle);
}
.user-avatar-placeholder {
  width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: var(--color-rift-500); color: #fff; font-weight: 700; font-size: 0.9rem;
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
