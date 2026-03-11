<template>
  <div class="app-layout">
    <Analytics />
    <!-- ── Top bar (mobile: slim, desktop: full) ── -->
    <nav class="app-nav glass">
      <router-link to="/" class="nav-brand">
        <span class="nav-logo">⚔</span>
        <span class="nav-title">Riftbound <span class="nav-title-accent">NIGHTS</span> <span class="nav-title-sub">Deck Manager</span></span>
      </router-link>

      <!-- Desktop nav links -->
      <div class="nav-links-desktop">
        <router-link to="/" class="nav-link" :class="{ 'nav-link--active': $route.name === 'catalog' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span>{{ $t('nav.catalog') }}</span>
        </router-link>
        <router-link to="/scan" class="nav-link" :class="{ 'nav-link--active': $route.name === 'scanner' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <span>{{ $t('nav.scanner') }}</span>
        </router-link>
        <router-link to="/collection" class="nav-link" :class="{ 'nav-link--active': $route.name === 'collection' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          <span>{{ $t('nav.collection') }}</span>
        </router-link>
        <router-link to="/decks" class="nav-link" :class="{ 'nav-link--active': $route.name === 'decks' || $route.name === 'deck-editor' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          <span>{{ $t('nav.decks') }}</span>
        </router-link>
        <router-link to="/how-to-play" class="nav-link" :class="{ 'nav-link--active': $route.name === 'how-to-play' }">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span>{{ $t('nav.how_to_play') }}</span>
        </router-link>
        
        <!-- Custom Language Switcher -->
        <div class="lang-switcher-wrap">
          <button class="lang-trigger glass" @click="showLangDropdown = !showLangDropdown">
            <span class="lang-flag">{{ languages.find(l => l.code === locale).flag }}</span>
            <span class="lang-code">{{ locale.toUpperCase() }}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" :style="{ transform: showLangDropdown ? 'rotate(180deg)' : 'none' }"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          
          <transition name="dropdown">
            <div v-if="showLangDropdown" class="lang-dropdown glass shadow-lg">
              <button 
                v-for="lang in languages" 
                :key="lang.code" 
                class="lang-option"
                :class="{ 'lang-option--active': locale === lang.code }"
                @click="setLang(lang.code)"
              >
                <span class="lang-flag">{{ lang.flag }}</span>
                <span class="lang-label">{{ lang.label }}</span>
                <svg v-if="locale === lang.code" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
          </transition>
        </div>
        
        <!-- Auth Section -->
        <div class="nav-auth" v-if="authStore.isInitialized">
          <template v-if="authStore.user">
            <div class="user-profile">
              <img v-if="authStore.user.user_metadata?.avatar_url" :src="authStore.user.user_metadata.avatar_url" alt="Avatar" class="user-avatar" />
              <div v-else class="user-avatar-placeholder">{{ authStore.user.email?.charAt(0).toUpperCase() }}</div>
              <button class="nav-btn btn-ghost" @click="authStore.signOut" :title="$t('common.logout')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </template>
          <template v-else>
            <button class="nav-btn btn-primary" @click="authStore.openLogin('login')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              {{ $t('common.login') }}
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

      <!-- Global Footer -->
      <footer class="app-footer fade-in" v-if="$route.name !== 'deck-editor'">
        <div class="footer-content">
          <div class="footer-brand">
            <span class="nav-logo">⚔</span>
            <span class="nav-title">Riftbound <span class="nav-title-accent">NIGHTS</span> <span class="nav-title-sub">Deck Manager</span></span>
          </div>
          <p class="footer-rights">{{ $t('footer.rights') }}</p>
          <div class="footer-links">
            <router-link to="/privacy" class="footer-link">{{ $t('footer.privacy') }}</router-link>
            <router-link to="/terms" class="footer-link">{{ $t('footer.terms') }}</router-link>
          </div>
        </div>
      </footer>
    </main>

    <!-- ── Bottom tab bar (mobile only) ── -->
    <nav class="bottom-tabs glass">
      <router-link to="/" class="tab-item" :class="{ 'tab-item--active': $route.name === 'catalog' || $route.name === 'card-detail' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        <span>{{ $t('nav.catalog') }}</span>
      </router-link>
      <router-link to="/scan" class="tab-item" :class="{ 'tab-item--active': $route.name === 'scanner' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        <span>{{ $t('nav.scanner') }}</span>
      </router-link>
      <router-link to="/collection" class="tab-item" :class="{ 'tab-item--active': $route.name === 'collection' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        <span>{{ $t('nav.collection') }}</span>
      </router-link>
      <router-link to="/decks" class="tab-item" :class="{ 'tab-item--active': $route.name === 'decks' || $route.name === 'deck-editor' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <span>{{ $t('nav.decks') }}</span>
      </router-link>
      <router-link to="/how-to-play" class="tab-item" :class="{ 'tab-item--active': $route.name === 'how-to-play' }">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>{{ $t('nav.how_to_play') }}</span>
      </router-link>
    </nav>
    <!-- ── Auth Modal ── -->
    <Teleport to="body">
      <div v-if="authStore.showAuthModal" class="modal-backdrop" @click.self="authStore.showAuthModal = false">
        <div class="modal auth-modal glass">
          <h2 class="modal-title">{{ $t('auth.login_title') }}</h2>
          <p v-if="authError" class="auth-error">{{ authError }}</p>
          <div class="form-group">
            <label class="form-label">E-mail</label>
            <input type="email" v-model="email" class="input" :placeholder="$t('auth.email_placeholder')" @keyup.enter="handleEmailAuth"/>
          </div>
          <div class="form-group">
            <label class="form-label">{{ $t('auth.password') || 'Senha' }}</label>
            <div class="password-input-wrap">
              <input :type="showPassword ? 'text' : 'password'" v-model="password" class="input" placeholder="••••••••" @keyup.enter="handleEmailAuth"/>
              <button class="btn-ghost password-toggle" @click="showPassword = !showPassword" tabindex="-1">
                <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <button class="btn btn-primary auth-submit" :disabled="authLoading" @click="handleEmailAuth">
            {{ authLoading ? $t('common.loading') : $t('common.login') }}
          </button>
          <button class="btn btn-ghost auth-switch" @click="authStore.authMode = authStore.authMode === 'login' ? 'signup' : 'login'">
            {{ authStore.authMode === 'login' ? ($t('auth.signup_link') || 'Signup') : ($t('auth.login_link') || 'Login') }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { Analytics } from '@vercel/analytics/vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { locale, t } = useI18n()
const route = useRoute()

function updateSEO() {
  const seoKey = route.meta?.seoKey || 'default'
  const title = t(`seo.${seoKey}.title`)
  const desc = t(`seo.${seoKey}.desc`)
  
  document.title = title
  
  // Update description meta tag
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.setAttribute('name', 'description')
    document.head.appendChild(metaDesc)
  }
  metaDesc.setAttribute('content', desc)
  
  // Update html lang attribute
  document.documentElement.lang = locale.value === 'pt' ? 'pt-BR' : locale.value
}

// Watch for route or locale changes
watch([() => route.path, locale], () => {
  updateSEO()
}, { immediate: true })

function saveLang() {
  localStorage.setItem('lang', locale.value)
}

// Auth modal state for inputs
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const authLoading = ref(false)
const authError = ref('')

const showLangDropdown = ref(false)
const languages = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' }
]

function setLang(code) {
  locale.value = code
  saveLang()
  showLangDropdown.value = false
}

onMounted(() => {
  authStore.init()
})

async function handleEmailAuth() {
  if (!email.value || !password.value) {
    authError.value = t('auth.empty_fields') || "Preencha e-mail e senha"
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
      authError.value = t('auth.invalid_credentials') || "E-mail ou senha incorretos."
    } else {
      authError.value = err.message || t('common.error')
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
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
  text-transform: uppercase;
}
.nav-title-accent { color: var(--color-gold-400); }
.nav-title-sub { 
  font-size: 0.8rem; 
  color: var(--color-text-secondary); 
  font-weight: 500;
  text-transform: none;
  margin-left: 4px;
}

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
  color: #B0B0B0; /* Visible Silver */
  text-decoration: none;
  font-size: 0.7rem;
  font-weight: 700; /* Bold */
  transition: all 0.2s;
  border-radius: var(--radius-md);
}
.tab-item--active {
  color: var(--color-gold-500); /* Softer Gold */
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

/* ── Lang Switcher ── */
.lang-switcher {
  display: flex;
  align-items: center;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 1px solid var(--color-border-subtle);
}
.lang-select {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}
.lang-select:focus {
  outline: none;
  background: rgba(255,255,255,0.1);
}

/* Custom Lang Switcher Styles */
.lang-switcher-wrap {
  position: relative;
  margin-left: 12px;
  padding-left: 12px;
  border-left: 1px solid var(--color-border-subtle);
}

.lang-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-trigger:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--color-gold-500);
}

.lang-flag { font-size: 1rem; }
.lang-code { letter-spacing: 0.05em; }

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 160px;
  padding: 8px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-subtle);
  background: var(--color-bg-raised);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.lang-option:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
}

.lang-option--active {
  background: rgba(201, 168, 76, 0.1) !important;
  color: var(--color-gold-400) !important;
}

.lang-label { flex: 1; }

.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Footer ── */
.app-footer {
  margin-top: 80px;
  padding: 40px 0;
  border-top: 1px solid var(--color-border-subtle);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.6;
}

.footer-rights {
  font-size: 0.8rem;
  color: var(--color-text-tertiary);
}

.footer-links {
  display: flex;
  gap: 24px;
}

.footer-link {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--color-gold-400);
}

@media (max-width: 768px) {
  .app-footer {
    padding-bottom: 20px; /* Space handled by app-main padding-bottom */
    margin-top: 40px;
  }
  .footer-links {
    gap: 16px;
  }
}
</style>
