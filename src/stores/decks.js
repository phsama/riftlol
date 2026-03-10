import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { api } from '@/services/api'
import { getCards } from '@/services/riftcodex'
import { useAuthStore } from '@/stores/auth'
import debounce from 'lodash-es/debounce'

const STORAGE_KEY = 'riftbound-decks'

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function saveToStorage(decks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export const useDecksStore = defineStore('decks', () => {
    const decks = ref([])
    const authStore = useAuthStore()
    const loading = ref(false)

    // Sync down from API
    async function fetchDecks() {
        if (!authStore.user) {
            decks.value = loadFromStorage()
            return
        }
        loading.value = true
        try {
            const { data } = await api.get('/decks')
            
            const allCards = await getCards()
            const cardMap = new Map((allCards || []).map(c => [c.id, c]))

            // O backend retorna DeckOut, vamos mapear para como o app espera
            decks.value = data.map(d => ({
                id: d.id,
                name: d.name,
                mainChampionId: d.main_champion_id,
                createdAt: d.created_at,
                updatedAt: d.updated_at,
                cards: d.cards.filter(c => !c.is_sideboard).map(c => {
                    const fullCard = cardMap.get(c.card_id)
                    if (fullCard) {
                        const entry = _buildCardEntry(fullCard)
                        entry.quantity = c.quantity
                        return entry
                    }
                    return { cardId: c.card_id, quantity: c.quantity }
                }),
                sideboard: d.cards.filter(c => c.is_sideboard).map(c => {
                    const fullCard = cardMap.get(c.card_id)
                    if (fullCard) {
                        const entry = _buildCardEntry(fullCard)
                        entry.quantity = c.quantity
                        return entry
                    }
                    return { cardId: c.card_id, quantity: c.quantity }
                })
            }))
        } catch (e) {
            // fallback silently
            decks.value = loadFromStorage() // fallback
        } finally {
            loading.value = false
        }
    }

    // Auto-save debounced handler for API
    const saveToApiDebounced = debounce(async (deck) => {
        if (!authStore.user) return
        try {
            const payload = {
                name: deck.name,
                main_champion_id: deck.mainChampionId,
                cards: [
                    ...deck.cards.map(c => ({ card_id: c.cardId, quantity: c.quantity, is_sideboard: false })),
                    ...(deck.sideboard || []).map(c => ({ card_id: c.cardId, quantity: c.quantity, is_sideboard: true }))
                ]
            }
            await api.put(`/decks/${deck.id}`, payload)
        } catch (e) {
            // auth or net failure silently skipped
        }
    }, 1000)

    // Global save handler
    function _handleDeckChange(deck) {
        deck.updatedAt = new Date().toISOString()
        saveToStorage(decks.value) // local fallback
        if (authStore.user) {
            saveToApiDebounced(deck)
        }
    }

    watch(() => authStore.user, () => {
        fetchDecks()
    }, { immediate: true })

    async function createDeck(name) {
        const deckId = generateId()
        const deck = {
            id: deckId,
            name,
            cards: [],
            sideboard: [],
            mainChampionId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        decks.value.push(deck)
        saveToStorage(decks.value)
        if (authStore.user) {
            try {
                // Post API expects different structure (cards: []) e vai retornar uuid
                const { data } = await api.post('/decks/', { name, cards: [] })
                deck.id = data.id // Atualiza o ID fake pelo do DB
            } catch (e) { 
                // silently fallback to local fake UUID
            }
        }
        return deck
    }

    function getDeck(id) {
        return decks.value.find((d) => d.id === id) || null
    }

    function deleteDeck(id) {
        const idx = decks.value.findIndex((d) => d.id === id)
        if (idx !== -1) {
            decks.value.splice(idx, 1)
            saveToStorage(decks.value)
            if (authStore.user) {
                api.delete(`/decks/${id}`).catch(() => {})
            }
        }
    }

    function renameDeck(id, newName) {
        const deck = getDeck(id)
        if (deck) {
            deck.name = newName
            _handleDeckChange(deck)
        }
    }

    async function duplicateDeck(id) {
        const original = getDeck(id)
        if (!original) return null
        const copy = await createDeck(`${original.name} (cópia)`)
        copy.cards = JSON.parse(JSON.stringify(original.cards))
        copy.sideboard = JSON.parse(JSON.stringify(original.sideboard || []))
        copy.mainChampionId = original.mainChampionId
        _handleDeckChange(copy)
        return copy
    }

    function _buildCardEntry(card) {
        return {
            cardId: card.id,
            cardName: card.name,
            quantity: 1,
            imageUrl: card.media?.image_url || '',
            publicCode: card.public_code || '',
            setId: card.set?.id || '',
            setLabel: card.set?.label || '',
            collectorNumber: card.collector_number || 0,
            rarity: card.classification?.rarity || '',
            type: card.classification?.type || '',
            supertype: card.classification?.supertype || '',
            domains: card.classification?.domain || [],
            energy: card.attributes?.energy ?? null,
            might: card.attributes?.might ?? null,
            description: card.text?.raw || card.description?.raw || '',
            artist: card.artist || '',
        }
    }

    function addCard(deckId, card, isSideboard = false) {
        const deck = getDeck(deckId)
        if (!deck) return

        // Ensure sideboard array exists (backward compat)
        if (!deck.sideboard) deck.sideboard = []

        const list = isSideboard ? deck.sideboard : deck.cards
        const existing = list.find((c) => c.cardId === card.id)
        if (existing) {
            existing.quantity++
        } else {
            const entry = _buildCardEntry(card)
            list.push(entry)
        }
        _handleDeckChange(deck)
    }

    function removeCard(deckId, cardId, isSideboard = false) {
        const deck = getDeck(deckId)
        if (!deck) return
        if (!deck.sideboard) deck.sideboard = []

        const list = isSideboard ? deck.sideboard : deck.cards
        const idx = list.findIndex((c) => c.cardId === cardId)
        if (idx !== -1) {
            if (list[idx].quantity > 1) {
                list[idx].quantity--
            } else {
                list.splice(idx, 1)
            }
            _handleDeckChange(deck)
        }
    }

    function setCardQuantity(deckId, cardId, qty, isSideboard = false) {
        const deck = getDeck(deckId)
        if (!deck) return
        if (!deck.sideboard) deck.sideboard = []

        if (qty <= 0) {
            removeCard(deckId, cardId, isSideboard)
            return
        }

        const list = isSideboard ? deck.sideboard : deck.cards
        const card = list.find((c) => c.cardId === cardId)
        if (card) {
            card.quantity = qty
            _handleDeckChange(deck)
        }
    }

    /**
     * Import a deck from text.
     * Format: "{qty} {card_name}" per line, "Sideboard:" divider.
     * allCards: array of all card objects from API.
     */
    function importFromText(deckId, text, allCards) {
        const deck = getDeck(deckId)
        if (!deck) return { matched: 0, unmatched: [] }

        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
        let isSideboard = false
        const unmatchedNames = []
        let matchCount = 0

        // Clear existing cards
        deck.cards = []
        deck.sideboard = []

        // Build name lookup (case-insensitive, clean_name aware)
        const cardByName = new Map()
        allCards.forEach((c) => {
            // Only store first occurrence per name (skip alt arts)
            const key = c.name.toLowerCase()
            if (!cardByName.has(key)) cardByName.set(key, c)
            if (c.metadata?.clean_name) {
                const cleanKey = c.metadata.clean_name.toLowerCase()
                if (!cardByName.has(cleanKey)) cardByName.set(cleanKey, c)
            }
        })

        /**
         * Try to find a card by name using multiple strategies:
         * 1. Exact match (case-insensitive)
         * 2. Clean name match
         * 3. "Legend, CardName" → try just "CardName" (Riftbound legend naming)
         * 4. Partial match (name ends with the search term)
         */
        function findCard(name) {
            const lower = name.toLowerCase()

            // 1) Exact match
            if (cardByName.has(lower)) return cardByName.get(lower)

            // 2) Try part after comma: "Fiora, Grand Duelist" → "Grand Duelist"
            if (name.includes(',')) {
                const afterComma = name.split(',').slice(1).join(',').trim().toLowerCase()
                if (afterComma && cardByName.has(afterComma)) return cardByName.get(afterComma)
            }

            // 3) Try part before comma: "Grand Duelist, Fiora" → "Grand Duelist"
            if (name.includes(',')) {
                const beforeComma = name.split(',')[0].trim().toLowerCase()
                if (beforeComma && cardByName.has(beforeComma)) return cardByName.get(beforeComma)
            }

            // 4) Partial match — find card whose name matches the end of the input
            for (const [key, card] of cardByName) {
                if (key.endsWith(lower) || lower.endsWith(key)) return card
            }

            return null
        }

        for (const line of lines) {
            // Detect sideboard separator
            if (/^sideboard\s*:/i.test(line)) {
                isSideboard = true
                continue
            }

            // Parse "qty cardname"
            const match = line.match(/^(\d+)\s+(.+)$/)
            if (!match) continue

            const qty = parseInt(match[1], 10)
            const name = match[2].trim()

            const card = findCard(name)
            if (card) {
                const entry = _buildCardEntry(card)
                entry.quantity = qty
                const list = isSideboard ? deck.sideboard : deck.cards
                list.push(entry)
                matchCount++
            } else {
                unmatchedNames.push(name)
            }
        }

        _handleDeckChange(deck)
        return { matched: matchCount, unmatched: unmatchedNames }
    }

    function getTotalCards(deckId) {
        const deck = getDeck(deckId)
        if (!deck) return 0
        return deck.cards.reduce((sum, c) => sum + c.quantity, 0)
    }

    function getSideboardTotal(deckId) {
        const deck = getDeck(deckId)
        if (!deck || !deck.sideboard) return 0
        return deck.sideboard.reduce((sum, c) => sum + c.quantity, 0)
    }

    function getDomains(deckId) {
        const deck = getDeck(deckId)
        if (!deck) return []
        const domains = new Set()
        const allEntries = [...deck.cards, ...(deck.sideboard || [])]
        allEntries.forEach((c) => {
            if (c.domains) c.domains.forEach((d) => domains.add(d))
        })
        return [...domains]
    }

    function setMainChampion(deckId, cardId) {
        const deck = getDeck(deckId)
        if (deck) {
            deck.mainChampionId = deck.mainChampionId === cardId ? null : cardId
            _handleDeckChange(deck)
        }
    }

    return {
        decks,
        loading,
        fetchDecks,
        createDeck,
        getDeck,
        deleteDeck,
        renameDeck,
        duplicateDeck,
        addCard,
        removeCard,
        setCardQuantity,
        importFromText,
        setMainChampion,
        getTotalCards,
        getSideboardTotal,
        getDomains,
    }
})
