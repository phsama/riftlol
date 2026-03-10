import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'catalog',
            component: () => import('@/views/CatalogView.vue'),
            meta: { seoKey: 'catalog' }
        },
        {
            path: '/card/:name',
            name: 'card-detail',
            component: () => import('@/views/CardDetailView.vue'),
            props: true,
            meta: { seoKey: 'catalog' }
        },
        {
            path: '/decks',
            name: 'decks',
            component: () => import('@/views/DecksView.vue'),
            meta: { seoKey: 'decks' }
        },
        {
            path: '/collection',
            name: 'collection',
            component: () => import('@/views/CollectionView.vue'),
            meta: { seoKey: 'collection' }
        },
        {
            path: '/deck/:id',
            name: 'deck-editor',
            component: () => import('@/views/DeckEditorView.vue'),
            props: true,
            meta: { seoKey: 'decks' }
        },
        {
            path: '/scan',
            name: 'scanner',
            component: () => import('@/views/ScannerView.vue'),
            meta: { seoKey: 'scanner' }
        },
        {
            path: '/how-to-play',
            name: 'how-to-play',
            component: () => import('@/views/HowToPlayView.vue'),
            meta: { seoKey: 'how_to_play' }
        },
        {
            path: '/privacy',
            name: 'privacy',
            component: () => import('@/views/LegalView.vue'),
            props: { type: 'privacy' },
            meta: { seoKey: 'privacy' }
        },
        {
            path: '/terms',
            name: 'terms',
            component: () => import('@/views/LegalView.vue'),
            props: { type: 'terms' },
            meta: { seoKey: 'terms' }
        },
    ],
    scrollBehavior() {
        return { top: 0 }
    },
})

export default router
