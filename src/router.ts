import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import PlayerView from './views/PlayerView.vue'
import CollectionView from './views/CollectionView.vue'
import { series } from './data/series'
import { shows } from './data/shows'
import { watchlist } from './data/watchlist'

export const router = createRouter({
  // GitHub Pages does not provide SPA rewrites for arbitrary paths.
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/watch/:channelId', name: 'player', component: PlayerView },
    {
      path: '/series',
      name: 'series',
      component: CollectionView,
      props: {
        title: 'Seriály',
        items: series,
        browseItem: { id: 'all-series', name: 'Všetky seriály', url: 'https://uzi.la/serialy' },
      },
    },
    { path: '/shows', name: 'shows', component: CollectionView, props: { title: 'Shows', items: shows } },
    {
      path: '/watchlist',
      name: 'watchlist',
      component: CollectionView,
      props: { title: 'Watchlist', items: watchlist },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
})
