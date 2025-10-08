# PWA Implementation Plan - CremaApp Web

## Overview
This document outlines the plan to implement Progressive Web App (PWA) functionality for petakopi.my with full CremaApp branding consistency.

## Current State Analysis

### ✅ What's Already Implemented
- Service worker built with Workbox (precaching, offline fallback)
- Web manifest file exists (`/public/site.webmanifest`)
- PWA install prompt handler (`beforeinstallprompt` captured)
- Install button with Stimulus controller
- Analytics tracking for PWA events
- Tailwind displaymodes plugin for standalone detection
- Icons: 192x192 and 512x512 PNG files

### ⚠️ Critical Issues
1. **Service worker not registered** - Built but never registered in browser
2. **Naming inconsistency** - Uses "petakopi.my" instead of "CremaApp"
3. **Icon branding** - Generic petakopi icons, not CremaApp branded
4. **Banner UX** - Need banner component for Android (similar to iOS AppBanner)
5. **Platform detection** - Currently uses install button, needs banner approach for Android mobile only

### ❌ Not Implemented (Future)
- Web push notifications (can be added later without affecting existing users)

---

## Implementation Plan: Option B (Full Rebrand)

### Phase 1: Asset Preparation

#### 1.1 Icons Required
Generate from CremaApp icon (`/crema-app/assets/icon.png` - 1024x1024):

**Required Sizes:**
- `android-chrome-192x192.png` - 192x192px (minimum for Android)
- `android-chrome-512x512.png` - 512x512px (recommended for Android)
- `apple-touch-icon.png` - 180x180px (for iOS web clips)
- `favicon-16x16.png` - 16x16px (browser favicon)
- `favicon-32x32.png` - 32x32px (browser favicon)

**Optional (Recommended):**
- `maskable-icon-512x512.png` - 512x512px with safe zone padding for Android adaptive icons
- Additional sizes: 144x144, 256x256, 384x384

**Icon Specifications:**
- Format: PNG with transparency
- Color space: sRGB
- Maskable icons: Include 20% safe zone padding (icons should fit in 80% center area)

#### 1.2 Design Decisions Needed

**App Naming:**
- [ ] PWA `name` (full name shown in install prompt)
  - Suggested: "CremaApp"
  - Alternative: "CremaApp - Coffee Discovery"
- [ ] PWA `short_name` (shown on home screen, max 12 chars)
  - Suggested: "CremaApp"
  - Alternative: "Crema"

**Theme Colors:**
- [ ] `theme_color` (browser chrome/status bar color)
  - Current: `#543626` (brown-600 from petakopi)
  - CremaApp splash: `#F5E6D3` (light beige)
  - Decision: _______________
- [ ] `background_color` (splash screen background)
  - Current: `#ffffff` (white)
  - CremaApp: `#F5E6D3` (light beige)
  - Decision: _______________

**App Description:**
- [ ] Short description for manifest
  - Current: "petakopi.my — Discover authentic coffee anywhere"
  - Suggested: "Discover authentic coffee shops anywhere in Malaysia"
  - Decision: _______________

#### 1.3 Platform Strategy

**Banner Display Behavior:**
- [x] **Android Mobile** (Phone): Show PWA install banner ✅
- [ ] **Android Tablet**: Don't show PWA banner ❌
- [ ] **Desktop Chrome/Edge**: Don't show PWA banner ❌
- [x] **iOS/iPadOS**: Show native app download banner (AppBanner component) ✅

**User Flow:**
1. User visits on Android mobile → See banner promoting PWA installation
2. User clicks "Install" on banner → Triggers native install prompt
3. Banner can be dismissed → Stored in localStorage with cooldown period (similar to iOS AppBanner)

---

### Phase 2: Code Implementation

#### 2.1 Service Worker Registration
**File:** `app/javascript/entrypoints/application.js`

Add service worker registration after PWA configuration:

```javascript
/**
 * Service Worker Registration
 */
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered:', registration)
        })
        .catch((error) => {
          console.log('SW registration failed:', error)
        })
    })
  }
}

// Initialize all configurations
configureTurbo()
configureTurn()
configureAlpine()
configurePWA()
registerServiceWorker() // Add this line
```

**Location:** After line 84 in `app/javascript/entrypoints/application.js`

#### 2.2 Update Web Manifest
**File:** `public/site.webmanifest`

```json
{
  "short_name": "[DECISION NEEDED]",
  "name": "[DECISION NEEDED]",
  "theme_color": "[DECISION NEEDED]",
  "background_color": "[DECISION NEEDED]",
  "start_url": "/?from=homescreen",
  "display": "standalone",
  "scope": "/",
  "description": "[DECISION NEEDED]",
  "categories": [
    "food",
    "lifestyle"
  ],
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/maskable-icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

#### 2.3 Create PWA Install Banner Component
**File:** `app/javascript/components/Home/PwaInstallBanner.jsx` (NEW FILE)

Create a new banner component for Android PWA installation (similar to AppBanner):

```javascript
import React, { useState, useEffect } from "react"
import {
  trackPwaInstallClick,
  trackPwaBannerDismiss,
  trackPwaBannerImpression,
} from "../../utils/analytics"

export default function PwaInstallBanner() {
  const [isVisible, setIsVisible] = useState(false)

  // Check if user is on Android mobile device
  const isAndroidMobile = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    return /android/i.test(userAgent) && /mobile/i.test(userAgent)
  }

  // Check if beforeinstallprompt event has been captured
  useEffect(() => {
    // Only show banner for Android mobile
    if (!isAndroidMobile()) {
      setIsVisible(false)
      return
    }

    const dismissedAt = localStorage.getItem("petakopi_pwa_banner_dismissed_at")
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt)
      const now = new Date()
      const daysSinceDismissed = Math.floor(
        (now - dismissedDate) / (1000 * 60 * 60 * 24)
      )

      // Show banner again after 7 days
      if (daysSinceDismissed < 7) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
    } else {
      // First time visitor on Android mobile
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    trackPwaBannerDismiss()
    setIsVisible(false)
    localStorage.setItem(
      "petakopi_pwa_banner_dismissed_at",
      new Date().toISOString()
    )
  }

  const handleInstallClick = () => {
    if (!window.deferredPrompt) {
      console.log("No deferred prompt available")
      return
    }

    trackPwaInstallClick()

    // Trigger the install prompt
    window.deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    window.deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the PWA install")
        // Hide banner after successful install
        setIsVisible(false)
      }

      // Clear the deferred prompt
      window.deferredPrompt = null
    })
  }

  // Track banner impression when it becomes visible
  useEffect(() => {
    if (isVisible) {
      trackPwaBannerImpression()
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="mt-4 mb-6">
      <div className="bg-gradient-to-r from-white via-brown-50/30 to-white border border-brown-100 rounded-lg max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* App Icon or Emoji */}
            <div className="flex-shrink-0">
              <span className="text-3xl" role="img" aria-label="coffee">
                ☕
              </span>
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brown-800 sm:text-base">
                Install CremaApp
              </p>
              <p className="text-xs sm:text-sm text-brown-500 mt-0.5">
                Add to your home screen for quick access
              </p>
            </div>

            {/* Install Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 transition-colors"
              >
                Install
              </button>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="inline-flex text-brown-300 hover:text-brown-500 focus:outline-none focus:ring-2 focus:ring-brown-500 rounded-md p-1"
              aria-label="Dismiss banner"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 2.4 Add Analytics Tracking
**File:** `app/javascript/utils/analytics.js`

Add PWA tracking functions (if not already present):

```javascript
// Add to existing analytics.js file
export function trackPwaInstallClick() {
  if (window.ahoy) {
    window.ahoy.track("PWA Install Click", {
      platform: "android",
      source: "banner"
    })
  }
}

export function trackPwaBannerDismiss() {
  if (window.ahoy) {
    window.ahoy.track("PWA Banner Dismiss", {
      platform: "android"
    })
  }
}

export function trackPwaBannerImpression() {
  if (window.ahoy) {
    window.ahoy.track("PWA Banner Impression", {
      platform: "android"
    })
  }
}
```

#### 2.5 Mount PWA Banner Component
**File:** `app/views/home/index.html.erb` (or wherever AppBanner is mounted)

Add PwaInstallBanner alongside AppBanner:

```erb
<div data-turbo-mount="Home/AppBanner"></div>
<div data-turbo-mount="Home/PwaInstallBanner"></div>
```

#### 2.6 Remove Old Install Button
**File:** `app/views/home/_homepage_actions.html.erb`

Remove the old install button (lines 19-32):

```erb
<!-- REMOVE THIS SECTION -->
<span data-controller="pwa-install" class="relative inline-flex ml-2 standalone:hidden">
  <%= button_tag type: "button",
    data: {
      pwa_install_target: "button",
      action: "click->pwa-install#install"
    },
    id: "pwaInstallBtn",
    class: "inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500" do %>
    <span class="w-6 mr-2">
      <%= render "components/icons/install" %>
    </span>
    Install
  <% end %>
</span>
<!-- END REMOVE -->
```

**File:** `app/javascript/controllers/pwa_install_controller.js`

This file can be deleted or kept for future use.

#### 2.7 Update Meta Tags (if needed)
**File:** `app/views/layouts/_head.html.erb`

Verify theme color matches manifest:

```erb
<meta name="theme-color" content="[DECISION NEEDED - must match manifest]">
```

**Location:** Line 18

---

### Phase 3: Asset Replacement

#### 3.1 Replace Icon Files
Replace files in `/public/` directory:

```bash
# Files to replace:
/public/android-chrome-192x192.png
/public/android-chrome-512x512.png
/public/apple-touch-icon.png
/public/favicon-16x16.png
/public/favicon-32x32.png
/public/favicon.png

# Optional additions:
/public/maskable-icon-512x512.png
```

#### 3.2 Update Service Worker Build
After replacing icons, rebuild service worker to update precache manifest:

```bash
# Rebuild service worker with new assets
pnpm run build
workbox injectManifest config/workbox.config.js
```

---

### Phase 4: Testing Checklist

#### 4.1 Android Testing
- [ ] Chrome on Android phone
  - [ ] Install button appears
  - [ ] Install prompt shows correct name and icon
  - [ ] App installs to home screen with correct icon
  - [ ] App launches in standalone mode
  - [ ] Theme color applied to status bar
  - [ ] Analytics tracks installation
- [ ] Chrome on Android tablet (if applicable)
  - [ ] Same checks as phone

#### 4.2 iOS Testing
- [ ] Safari on iPhone
  - [ ] Install button hidden
  - [ ] AppBanner component shows for native app download
  - [ ] Web clips use correct apple-touch-icon
- [ ] Safari on iPad
  - [ ] Same checks as iPhone

#### 4.3 Desktop Testing (if applicable)
- [ ] Chrome on desktop
  - [ ] Install button behavior matches platform decision
  - [ ] Install prompt (if enabled) shows correct branding
- [ ] Edge on desktop
  - [ ] Same checks as Chrome

#### 4.4 Service Worker Testing
- [ ] Service worker registers successfully (check DevTools → Application → Service Workers)
- [ ] Offline functionality works
- [ ] Updates deploy correctly (test by changing service worker)

#### 4.5 Manifest Validation
- [ ] Validate manifest using Chrome DevTools → Application → Manifest
- [ ] No errors or warnings
- [ ] Icons load correctly
- [ ] Colors display as expected

---

## Decision Summary Template

**Copy this section and fill in your decisions:**

### Asset Decisions
```
App Name (full): _______________________
App Name (short): _______________________
Theme Color: _______________________
Background Color: _______________________
Description: _______________________
```

### Platform Decisions
```
Show PWA install banner for:
- Android Mobile: [x] Yes (via PwaInstallBanner component)
- Android Tablet: [ ] No
- Desktop Chrome/Edge: [ ] No
- iOS/Safari: [ ] No (will show AppBanner for native app instead)
```

### Icon Checklist
```
Icon source: /crema-app/assets/icon.png (1024x1024)

Generate and provide:
- [ ] android-chrome-192x192.png
- [ ] android-chrome-512x512.png
- [ ] apple-touch-icon.png (180x180)
- [ ] favicon-16x16.png
- [ ] favicon-32x32.png
- [ ] maskable-icon-512x512.png (optional)
```

---

## Files to Modify

### New Files to Create
1. `app/javascript/components/Home/PwaInstallBanner.jsx` - New PWA install banner component

### Code Changes
2. `app/javascript/entrypoints/application.js` - Add service worker registration
3. `app/javascript/utils/analytics.js` - Add PWA tracking functions
4. `public/site.webmanifest` - Update branding and colors
5. `app/views/layouts/_head.html.erb` - Update theme color meta tag (if needed)
6. `app/views/home/index.html.erb` - Mount PwaInstallBanner component
7. `app/views/home/_homepage_actions.html.erb` - Remove old install button

### Files to Remove/Archive
8. `app/javascript/controllers/pwa_install_controller.js` - Can be deleted (replaced by banner)

### Asset Replacements
9. `/public/android-chrome-192x192.png`
10. `/public/android-chrome-512x512.png`
11. `/public/apple-touch-icon.png`
12. `/public/favicon-16x16.png`
13. `/public/favicon-32x32.png`
14. `/public/favicon.png`
15. `/public/maskable-icon-512x512.png` (optional)

---

## Future: Web Push Notifications

### Can Be Added Later Without Issues
- Service worker can be updated anytime
- Existing PWA users will auto-receive updates
- No reinstall needed
- Permission is opt-in

### When Ready to Implement
1. Add `web-push` gem to Rails
2. Generate VAPID keys
3. Add push event listeners to service worker
4. Create subscription management API
5. Build notification permission UI
6. Implement notification sending backend

**Reference:** Web Push implementation can be added as a separate feature update.

---

## Next Steps

1. **Fill in Decision Summary** with your preferences
2. **Generate icons** from CremaApp source (`/crema-app/assets/icon.png`)
3. **Provide icons** to development team
4. **Review and approve** code changes
5. **Deploy and test** on target devices

---

## Questions or Concerns?

Contact: [Your contact info]

Last Updated: 2025-10-08
