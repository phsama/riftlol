import axios from 'axios'

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

    // Fetch all pages
    const firstPage = await cachedGet('/cards', { page: 1, size: 100 })
    let allItems = [...(firstPage.items || [])]
    const totalPages = firstPage.pages || 1

    // Fetch remaining pages in parallel
    if (totalPages > 1) {
        const promises = []
        for (let p = 2; p <= totalPages; p++) {
            promises.push(cachedGet('/cards', { page: p, size: 100 }))
        }
        const results = await Promise.all(promises)
        results.forEach((res) => {
            if (res.items) allItems = allItems.concat(res.items)
        })
    }

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
}
