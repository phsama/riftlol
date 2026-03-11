import axios from 'axios'
import { api as localApi } from '@/services/api'

const api = axios.create({
    baseURL: '/riftcodex-api',
    timeout: 15000,
})

// ── In-memory cache ──
const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

function getCached(key) {
    const entry = cache.get(key)
    if (!entry) return null
    if (Date.now() - entry.ts > CACHE_TTL) {
        cache.delete(key)
        return null
    }
    return entry.data
}

function setCache(key, data) {
    cache.set(key, { data, ts: Date.now() })
}

async function cachedGet(url, params = {}) {
    const key = url + JSON.stringify(params)
    const cached = getCached(key)
    if (cached) return cached

    const { data } = await api.get(url, { params })
    setCache(key, data)
    return data
}

// ── Cards ──
// API returns paginated: { items: [], total, page, size, pages }

export async function getCards() {
    const cacheKey = '__all_cards'
    const cached = getCached(cacheKey)
    if (cached) return cached

    // Nosso DB interno agora cospe o array inteiro direto em `items` num pull só!
    // Usamos axios puro para ignorar interceptor de Auth, permitindo Vercel Edge Caching ⚡
    const { data } = await axios.get('/api/cards', { baseURL: import.meta.env.VITE_API_URL || '' })
    const allItems = data?.items || data || []

    setCache(cacheKey, allItems)
    return allItems
}

export async function searchCards(query) {
    if (!query || query.trim().length < 2) return []
    const data = await cachedGet('/cards/search', { q: query.trim() })
    // API may return paginated or array
    return data.items || data || []
}

export async function getCardByName(name) {
    const data = await cachedGet(`/cards/${encodeURIComponent(name)}`)
    return data
}

// ── Sets ──

export async function getSets() {
    const data = await cachedGet('/sets')
    // API may return paginated or array
    return data.items || data || []
}

export async function getSetById(setId) {
    return cachedGet(`/sets/${encodeURIComponent(setId)}`)
}

// ── Index (domains, keywords, types, rarities, etc.) ──

export async function getIndex(type) {
    return cachedGet(`/index/${type}`)
}

export async function getDomains() {
    return getIndex('domains')
}

export async function getKeywords() {
    return getIndex('keywords')
}

export async function getRarities() {
    return getIndex('rarities')
}

export async function getTypes() {
    return getIndex('types')
}

export async function getSupertypes() {
    return getIndex('supertypes')
}

// ── Prices ──

export async function getCardPrices(cardName, lang = 'pt') {
    // We don't use cachedGet here to ensure fresh prices, 
    // but we could use a shorter cache if needed.
    const { data } = await localApi.get(`/prices/${encodeURIComponent(cardName)}`, { params: { lang } })
    return data
}

export default {
    getCards,
    searchCards,
    getCardByName,
    getSets,
    getSetById,
    getIndex,
    getDomains,
    getKeywords,
    getRarities,
    getTypes,
    getSupertypes,
    getCardPrices,
}
