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
        <router-link to="/scan" class="nav-link" :class="{ 'nav-link--active': $route.name === 'scanner' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <span>Scan</span>
        </router-link>
        <router-link to="/collection" class="nav-link" :class="{ 'nav-link--active': $route.name === 'collection' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          <span>Coleção</span>
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
            <button class="nav-btn btn-primary" @click="authStore.openLogin('login')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
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
      <router-link to="/scan" class="tab-item" :class="{ 'tab-item--active': $route.name === 'scanner' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        <span>Scan</span>
      </router-link>
      <router-link to="/collection" class="tab-item" :class="{ 'tab-item--active': $route.name === 'collection' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        <span>Coleção</span>
      </router-link>
      <router-link to="/decks" class="tab-item" :class="{ 'tab-item--active': $route.name === 'decks' || $route.name === 'deck-editor' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <span>Decks</span>
      </router-link>
    </nav>
    <!-- ── Auth Modal ── -->
    <Teleport to="body">
      <div v-if="authStore.showAuthModal" class="modal-backdrop" @click.self="authStore.showAuthModal = false">
        <div class="modal auth-modal glass">
          <h2 class="modal-title">{{ authStore.authMode === 'login' ? 'Acessar Conta' : 'Criar Conta' }}</h2>
          <p v-if="authError" class="auth-error">{{ authError }}</p>
          <div class="form-group">
            <label class="form-label">E-mail</label>
            <input type="email" v-model="email" class="input" placeholder="seu@email.com" @keyup.enter="handleEmailAuth"/>
          </div>
          <div class="form-group">
            <label class="form-label">Senha</label>
            <div class="password-input-wrap">
              <input :type="showPassword ? 'text' : 'password'" v-model="password" class="input" placeholder="••••••••" @keyup.enter="handleEmailAuth"/>
              <button class="btn-ghost password-toggle" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <button class="btn btn-primary auth-submit" :disabled="authLoading" @click="handleEmailAuth">
            {{ authLoading ? 'Aguarde...' : (authStore.authMode === 'login' ? 'Entrar' : 'Cadastrar') }}
          </button>
          <button class="btn btn-ghost auth-switch" @click="authStore.authMode = authStore.authMode === 'login' ? 'signup' : 'login'">
            {{ authStore.authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre' }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Auth modal state for inputs
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const authLoading = ref(false)
const authError = ref('')

onMounted(() => {
  authStore.init()
})

async function handleEmailAuth() {
  if (!email.value || !password.value) {
    authError.value = "Preencha e-mail e senha"
    return
  }
  authLoading.value = true
  authError.value = ''
  try {
    if (authStore.authMode === 'login') {
      await authStore.signInWithEmail(email.value, password.value)
    } else {
      await authStore.signUp(email.value, password.value)
    }
    authStore.showAuthModal = false
    email.value = ''
    password.value = ''
  } catch (err) {
    if (err.message.includes('Invalid login credentials')) {
      authError.value = "E-mail ou senha incorretos."
    } else {
      authError.value = err.message || "Erro de autenticação"
    }
  } finally {
    authLoading.value = false
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

/* ── Auth Modal ── */
.auth-modal {
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}
.auth-error {
  color: #ff5e5e; font-size: 0.85rem; font-weight: 600; text-align: center;
  background: rgba(255, 94, 94, 0.1); padding: 8px; border-radius: var(--radius-sm);
}
.password-input-wrap { position: relative; display: flex; align-items: center; }
.password-input-wrap .input { padding-right: 40px; }
.password-toggle {
  position: absolute; right: 4px; border: none; background: transparent;
  color: var(--color-text-tertiary); padding: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-sm); transition: color 0.2s;
}
.password-toggle:hover { color: var(--color-text-primary); background: rgba(255,255,255,0.05); }
.auth-submit { margin-top: 8px; justify-content: center; }
.auth-switch { font-size: 0.8rem; }
</style>
