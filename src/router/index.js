import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'catalog',
            component: () => import('@/views/CatalogView.vue'),
        },
        {
            path: '/card/:name',
            name: 'card-detail',
            component: () => import('@/views/CardDetailView.vue'),
            props: true,
        },
        {
            path: '/decks',
            name: 'decks',
            component: () => import('@/views/DecksView.vue'),
        },
        {
            path: '/collection',
            name: 'collection',
            component: () => import('@/views/CollectionView.vue'),
        },
        {
            path: '/deck/:id',
            name: 'deck-editor',
            component: () => import('@/views/DeckEditorView.vue'),
            props: true,
        },
        {
            path: '/scan',
            name: 'scanner',
            component: () => import('@/views/ScannerView.vue'),
        },
    ],
    scrollBehavior() {
        return { top: 0 }
    },
})

export default router
