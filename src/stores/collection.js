import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useCollectionStore = defineStore('collection', () => {
    const items = ref({}) // key: card_id, value: { normal_qty, foil_qty, alt_art_qty, signed_qty, overnumbered_qty }
    const isLoading = ref(false)
    const error = ref(null)
    const initialized = ref(false)

    async function loadCollection() {
        const authStore = useAuthStore()
        if (!authStore.user) {
            items.value = {}
            initialized.value = false
            return
        }

        if (isLoading.value) return
        isLoading.value = true
        error.value = null

        try {
            const { data } = await api.get('/api/collection')
            const newItems = {}
            data.forEach(item => {
                newItems[item.card_id] = {
                    normal_qty: item.normal_qty,
                    foil_qty: item.foil_qty,
                    alt_art_qty: item.alt_art_qty,
                    signed_qty: item.signed_qty,
                    overnumbered_qty: item.overnumbered_qty
                }
            })
            items.value = newItems
            initialized.value = true
        } catch (err) {
            console.error('Failed to load collection:', err)
            error.value = 'Houve um erro ao carregar sua coleção.'
        } finally {
            isLoading.value = false
        }
    }

    async function updateItemQty(cardId, field, delta) {
        const authStore = useAuthStore()
        if (!authStore.user) return

        const current = items.value[cardId] || {
            normal_qty: 0, foil_qty: 0, alt_art_qty: 0, signed_qty: 0, overnumbered_qty: 0
        }

        const newValue = Math.max(0, current[field] + delta)

        // Optimistic update
        items.value[cardId] = {
            ...current,
            [field]: newValue
        }

        try {
            await api.post(`/api/collection/${encodeURIComponent(cardId)}`, {
                [field]: newValue
            })
        } catch (err) {
            console.error('Failed to update collection item:', err)
            // Revert on failure
            items.value[cardId] = current
        }
    }

    function getCardTotal(cardId) {
        const item = items.value[cardId]
        if (!item) return 0
        return item.normal_qty + item.foil_qty + item.alt_art_qty + item.signed_qty + item.overnumbered_qty
    }

    return {
        items,
        isLoading,
        error,
        initialized,
        loadCollection,
        updateItemQty,
        getCardTotal
    }
})
