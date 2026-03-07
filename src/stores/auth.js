import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/services/supabase'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const session = ref(null)
    const isInitialized = ref(false)
    const showAuthModal = ref(false)
    const authMode = ref('login')

    function openLogin(mode = 'login') {
        authMode.value = mode
        showAuthModal.value = true
    }

    async function init() {
        const { data } = await supabase.auth.getSession()
        session.value = data.session
        user.value = data.session?.user || null
        isInitialized.value = true

        supabase.auth.onAuthStateChange((_event, newSession) => {
            session.value = newSession
            user.value = newSession?.user || null
        })
    }

    async function signInWithEmail(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    async function signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    async function signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            }
        })
        if (error) throw error
        return data
    }

    async function signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        user.value = null
        session.value = null
    }

    return {
        user,
        session,
        isInitialized,
        showAuthModal,
        authMode,
        init,
        openLogin,
        signInWithEmail,
        signUp,
        signInWithGoogle,
        signOut
    }
})
