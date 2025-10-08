# Google Analytics 4 Setup Guide for App Banner Conversion Tracking

This guide shows how to set up and track conversion metrics for the app download banner in Google Analytics 4.

## Overview

The app banner tracks three key events:
- **`app_banner_impression`** - When the banner is shown to users
- **`app_download_click`** - When users click the Download button
- **`app_banner_dismiss`** - When users dismiss the banner

## Step 1: Access Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property: **petakopi.my** (G-14JBBQZVQR)

## Step 2: View Events (Verify Tracking is Working)

1. Navigate to: **Reports** → **Engagement** → **Events**
2. Wait for data to populate (can take 24-48 hours for first events)
3. Look for these events:
   - `app_banner_impression` - Banner was shown
   - `app_download_click` - Download button clicked
   - `app_banner_dismiss` - Banner was dismissed

## Step 3: Mark Download as Conversion

1. Go to: **Admin** (bottom left gear icon)
2. Under **Property** column → Click **Events**
3. Find `app_download_click` in the list
4. Toggle the **Mark as conversion** switch to ON
5. Save changes

## Step 4: Create Custom Reports for Conversion Rate

### Option A: Exploration Report (Recommended)

1. Go to: **Explore** (left sidebar)
2. Click **Create a new exploration** → **Free form**
3. Configure:
   - **Dimensions**: Add `Event name`
   - **Metrics**: Add `Event count`
   - **Rows**: Drag `Event name`
   - **Values**: Drag `Event count`
4. Filter to show only banner events:
   - Click **Filters** → Add filter
   - Dimension: `Event name`
   - Condition: `contains` → `app_banner`
5. Save as: "App Banner Conversion Funnel"

### Option B: Funnel Exploration

1. Go to: **Explore** → **Funnel exploration**
2. Set up funnel steps:
   - **Step 1**: `app_banner_impression` (Banner shown)
   - **Step 2**: `app_download_click` (Download clicked)
3. This shows drop-off rate automatically

## Step 5: View Conversion Data

1. Go to: **Reports** → **Engagement** → **Conversions**
2. You'll see `app_download_click` listed with:
   - Total conversions
   - Conversion rate
   - Revenue (if configured)

## Step 6: Calculate Conversion Metrics

**Formula:**
```
Impression to Click Rate = (app_download_click / app_banner_impression) × 100
```

**Example:**
- Impressions: 100 banner views
- Downloads: 10 download clicks
- Conversion Rate: 10%

**View in Realtime:**
- Go to: **Reports** → **Realtime**
- See events as they happen (useful for testing)

## Step 7: Custom Dashboard (Optional)

1. Go to: **Reports** → **Library**
2. Click **Create new report**
3. Add these metrics:
   - Banner Impressions: `app_banner_impression`
   - Download Clicks: `app_download_click`
   - Dismissals: `app_banner_dismiss`
   - Click-through Rate: `(Downloads / Impressions) × 100`

## Event Parameters Tracked

Each event includes these parameters:

- `event_category`: "app_banner"
- `device_type`: iPhone, iPad, iPod, or Mac
- `ios_version`: iOS version number (e.g., "17.2")
- `browser`: Safari, Chrome, Firefox, etc.
- `user_agent`: Full user agent string
- `event_label`: Human-readable action description

## Example Insights You Can Get

- "10 downloads from 100 impressions = 10% conversion rate"
- "iPhone users have 15% conversion, iPad users 8%"
- "Safari users convert better than Chrome users"
- "iOS 17 users have higher conversion than iOS 16"
- "Banner reappearances after 7 days have 5% conversion"

## Testing

1. Visit https://petakopi.my on an Apple device in production
2. View banner → Should trigger `app_banner_impression` event
3. Click Download → Should trigger `app_download_click` event
4. Click dismiss (X) → Should trigger `app_banner_dismiss` event
5. Check **Realtime** reports in GA4 (updates within seconds)

**Note:** Events only fire in production for non-admin users (see `app/views/layouts/_head.html.erb`)

## Troubleshooting

### Events not showing up?

1. **Check if GA is loaded**: Open browser console, type `window.gtag` - should be a function
2. **Check user role**: Admin users don't send events
3. **Check device**: Only Apple devices show the banner
4. **Check ad blockers**: Disable ad blockers when testing
5. **Wait**: Events can take 24-48 hours to appear in reports (use Realtime for immediate feedback)

### No impression events but click events work?

- The banner might not be visible (dismissed more than 7 days ago, or wrong device)
- Check browser console for JavaScript errors

## Technical Implementation

Events are tracked using:
- **Utility**: `app/javascript/utils/analytics.js`
- **Component**: `app/javascript/components/Home/AppBanner.jsx`
- **GA Setup**: `app/views/layouts/_head.html.erb`

The tracking safely handles cases where:
- GA is blocked by ad blockers
- User is in development environment
- User is an admin (no tracking)
