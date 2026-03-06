import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

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
    const decks = ref(loadFromStorage())

    // Auto-save on every change
    watch(decks, (val) => saveToStorage(val), { deep: true })

    function createDeck(name) {
        const deck = {
            id: generateId(),
            name,
            cards: [],      // Main deck: [{ cardId, cardName, quantity, imageUrl, ... }]
            sideboard: [],   // Sideboard: same structure
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        decks.value.push(deck)
        return deck
    }

    function getDeck(id) {
        return decks.value.find((d) => d.id === id) || null
    }

    function deleteDeck(id) {
        const idx = decks.value.findIndex((d) => d.id === id)
        if (idx !== -1) decks.value.splice(idx, 1)
    }

    function renameDeck(id, newName) {
        const deck = getDeck(id)
        if (deck) {
            deck.name = newName
            deck.updatedAt = new Date().toISOString()
        }
    }

    function duplicateDeck(id) {
        const original = getDeck(id)
        if (!original) return null
        const copy = {
            ...JSON.parse(JSON.stringify(original)),
            id: generateId(),
            name: `${original.name} (cópia)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        decks.value.push(copy)
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
        deck.updatedAt = new Date().toISOString()
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
            deck.updatedAt = new Date().toISOString()
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
            deck.updatedAt = new Date().toISOString()
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

        deck.updatedAt = new Date().toISOString()
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

    return {
        decks,
        createDeck,
        getDeck,
        deleteDeck,
        renameDeck,
        duplicateDeck,
        addCard,
        removeCard,
        setCardQuantity,
        importFromText,
        getTotalCards,
        getSideboardTotal,
        getDomains,
    }
})
