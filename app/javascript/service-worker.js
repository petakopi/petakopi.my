import { precacheAndRoute } from 'workbox-precaching'
import { offlineFallback } from 'workbox-recipes'
import { setDefaultHandler } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'

setDefaultHandler(new NetworkOnly())

// offlineFallback()

precacheAndRoute(self.__WB_MANIFEST || [])
