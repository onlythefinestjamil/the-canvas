# Meta Ads Implementation Guide — Jamil Johnson / Momentum Labs

**Owner:** Jamil Mateen Johnson  
**Businesses:** Athos Peaks · Juke The Movement · Only The Finest (OTF) · Herm's Heavy Hauling · Big Brother Property Solutions  
**Hosting:** DigitalOcean droplet `129.212.181.255`  
**Creative asset pipeline:** `C:/Users/Tap/the-canvas`  
**Last updated:** 2026-11-02

> This is a practical, step-by-step execution document. Follow it top-to-bottom to get every campaign live.

---

## Table of Contents

1. [Meta Business Manager Setup](#1-meta-business-manager-setup)
2. [Campaign Structures by Business](#2-campaign-structures-by-business)
   - 2.1 [Athos Peaks](#21-athos-peaks)
   - 2.2 [Juke The Movement](#22-juke-the-movement)
   - 2.3 [Only The Finest (OTF)](#23-only-the-finest-otf)
   - 2.4 [Herm's Heavy Hauling](#24-herms-heavy-hauling)
   - 2.5 [Big Brother Property Solutions](#25-big-brother-property-solutions)
3. [Meta Pixel Installation](#3-meta-pixel-installation)
4. [Conversions API (CAPI) Setup](#4-conversions-api-capi-setup)
5. [Audience Creation Instructions](#5-audience-creation-instructions)
6. [Creative Asset Specifications](#6-creative-asset-specifications)
7. [Campaign Launch Sequence](#7-campaign-launch-sequence)
8. [Budget Pacing Schedule (30-Day)](#8-budget-pacing-schedule-30-day)
9. [Tracking & Measurement Setup](#9-tracking--measurement-setup)
10. [Daily Management Cheat Sheet](#10-daily-management-cheat-sheet)

---

## 1. Meta Business Manager Setup

### 1.1 Create / Verify Business Manager

1. Go to **https://business.facebook.com** → log in with Jamil's Facebook account.
2. Click **Create Account** (or confirm the existing Momentum Labs / Illustrators Ent LLC business).
3. **Business Name:** `Momentum Labs` (or `Illustrators Ent LLC` if already created).
4. **Your Name:** Jamil Johnson.
5. **Business Email:** Use a dedicated email (e.g., `ads@momentumlabs.co` or Jamil's existing business email).
6. Complete **Business Verification** (Settings → Business Settings → Security Center → Business Verification):
   - Upload LLC formation document (Illustrators Ent LLC).
   - Confirm business phone and address (West Palm Beach, FL).
   - Verify domain ownership for each property you'll advertise (see §1.3).

### 1.2 Set Up Ad Accounts — One Per Business (5 total)

Create a separate ad account for each business so budgets, billing, and reporting stay clean.

1. In Business Settings → **Accounts** → **Ad Accounts** → **Add** → **Create a New Ad Account**.
2. Create these 5 ad accounts:

| Ad Account Name | Purpose | Billing Method |
|---|---|---|
| `Athos Peaks Ads` | Fitness app install / subscription campaigns | Credit card on file |
| `Juke The Movement Ads` | Music streaming / smart-link / merch | Credit card on file |
| `Only The Finest Ads` | Shopify e-commerce (streetwear) | Credit card on file |
| `Herm's Heavy Hauling Ads` | Junk removal lead gen (Palm Beach County) | Credit card on file |
| `Big Brother Property Solutions Ads` | Property services lead gen (Palm Beach County) | Credit card on file |

3. Add Jamil as **Admin** on each ad account. Add a backup admin if desired.
4. Set **Spend Limit** per ad account under **Business Settings → Ad Account → Spend Limit**:
   - Start conservative: $50/day default cap per account during testing.

### 1.3 Verify Domains (REQUIRED for iOS 14.5+ tracking & Conversions API)

1. Go to **Business Settings → Brand Safety → Domains** → **Add**.
2. Add and verify each domain by uploading the Meta-provided `verification` HTML file to the site root or adding the `meta` tag to the `<head>`:

| Business | Domain | Verification Method |
|---|---|---|
| OTF | `shoponlythefinest.com` | DNS TXT record or meta tag in Shopify theme |
| OTF App | `app.shoponlythefinest.com` | Meta tag in app `<head>` (Base44) |
| Athos Peaks | `athospeaks.com` (or app domain) | DNS TXT record |
| Herm's Heavy Hauling | `hermsheavyhauling.com` (or DigitalOcean-hosted site) | Meta tag in `index.html` `<head>` |
| Big Brother Property Solutions | `bigbrotherpropertysolutions.com` (or Base44 app domain) | Meta tag in Base44 `<head>` |
| Juke The Movement | `jukethemovement.com` (smart-link landing page domain) | DNS TXT record |

3. After adding the tag/file, click **Verify** in Meta. Green checkmark = verified.

### 1.4 Connect Meta Pixel & Conversions API per Property

1. **Events Manager** → **Connect Data Source** → **Web**.
2. Create one **Pixel** per business (5 pixels total). Name them:
   - `OTF Pixel` (assign to Only The Finest Ads account)
   - `Athos Pixel` (assign to Athos Peaks Ads account)
   - `Juke Pixel` (assign to Juke The Movement Ads account)
   - `Herm's Pixel` (assign to Herm's Heavy Hauling Ads account)
   - `BigBrother Pixel` (assign to Big Brother Property Solutions Ads account)
3. After each pixel is created, also set up the **Conversions API** connection (see §4).

> **Important:** OTF already has a Pixel partially implemented in `C:/Users/Tap/otf-staging/src/lib/metaPixel.js`. Use that Pixel ID for the OTF Pixel.

---

## 2. Campaign Structures by Business

> **Naming convention** — keep it consistent so reporting is readable:
> `BU_CampaignObjective_AudienceType_Order`
> (e.g., `OTF_ProSales_ProspRetarget_01`, `HERMS_Lead_PBC_geo_01`)

---

### 2.1 Athos Peaks

**Business type:** Fitness app (mobile, Base44 + React Native/Expo). In 90-day free beta.  
**Primary objective:** App installs → eventual subscription conversion.  
**Target user:** Health-conscious 18–45, iOS + Android, fitness-curious.

#### Campaign 1: `ATHOS_AppInstalls_Broad`

| Setting | Value |
|---|---|
| Campaign objective | App Promotion |
| Buying type | Auction |
| Daily budget | $20/day |
| Campaign budget optimization (CBO) | ON |

**Ad Set 1: `ATHOS_AS_Broad_18_44_US`**
- Locations: United States (or Florida + top 10 metros if budget constrained)
- Age: 18–44
- Gender: All
- Placements: Auto (Advantage+ placements) — Instagram Feed, Stories, Reels, Facebook Feed
- Optimization event: App Install (or `ActivateApp` if available)
- Bid strategy: Lowest Cost

**Creative specs (see §6 for full detail):**
- 3× square (1080×1080) app UI screenshots + benefit headline
- 2× vertical (1080×1920) Reels/Stories — workout/training clip
- 1× carousel — "Day in the life with Athos" swipe-through

#### Campaign 2: `ATHOS_Engagement_Insta`

| Setting | Value |
|---|---|
| Campaign objective | Engagement |
| Daily budget | $10/day |

**Ad Set 1: `ATHOS_AS_Insta_Engage`**
- Locations: United States
- Age: 18–44
- Interests: Fitness, nutrition tracking, Apple Health, Fitbit, health-conscious
- Placements: Instagram Feed, Stories, Reels only
- Optimization: Post Engagement

---

### 2.2 Juke The Movement

**Business type:** Music (beats, songs, streaming). Smart-link landing pages on DigitalOcean droplet.  
**Primary objective:** Drive traffic to smart-link pages → Spotify streams / Beatstars sales.  
**Target user:** Hip-hop/R&B fans 16–34, music discovery, playlist culture.

#### Campaign 1: `JUKE_Traffic_SmartLink`

| Setting | Value |
|---|---|
| Campaign objective | Traffic |
| Daily budget | $15/day |
| CBO | ON |

**Ad Set 1: `JUKE_AS_Broad_Music_16_34`**
- Locations: United States (or Atlanta, Miami, NYC, LA, Houston if geo-targeting)
- Age: 16–34
- Interests: Hip-hop, R&B, SoundCloud, Beatstars, Spotify, music production, rap
- Placements: Auto (Instagram + Facebook Feed, Stories, Reels)
- Optimization: Link Clicks → smart-link landing page URL

**Ad Set 2: `JUKE_AS_Retarget_90d`**
- Custom audience: People who visited smart-link landing pages in last 90 days
- Optimization: Link Clicks
- Daily budget: $5/day

#### Campaign 2: `JUKE_Engagement_Insta_Reels`

| Setting | Value |
|---|---|
| Campaign objective | Engagement |
| Daily budget | $10/day |

**Ad Set 1: `JUKE_AS_Reels_Music`**
- Age: 16–34
- Interests: Hip-hop, music videos, rap
- Placements: Instagram Reels only
- Creative: 15–30s audio clips with visualizer (see §6)

---

### 2.3 Only The Finest (OTF)

**Business type:** Shopify streetwear e-commerce. Domain: `shoponlythefinest.com`.  
**Primary objective:** Sales/ROAS. Pixel already partially integrated (`metaPixel.js`).  
**Target user:** Streetwear enthusiasts 18–34, fashion-conscious.

#### Campaign 1: `OTF_ProSales_Broad`

| Setting | Value |
|---|---|
| Campaign objective | Sales (Conversions) |
| Buying type | Auction |
| Daily budget | $30/day |
| CBO | ON |
| Pixel | OTF Pixel |

**Ad Set 1: `OTF_AS_Broad_18_34_US`**
- Locations: United States
- Age: 18–34
- Gender: All
- Detailed targeting: Interests — streetwear, Hypebeast, sneaker culture, urban fashion, hip-hop fashion
- Placements: Auto (Advantage+)
- Optimization event: Purchase
- Bid strategy: Lowest Cost

#### Campaign 2: `OTF_ProSales_Retarget`

| Setting | Value |
|---|---|
| Campaign objective | Sales (Conversions) |
| Daily budget | $15/day |
| CBO | ON |

**Ad Set 1: `OTF_AS_Retarget_ATC_30d`**
- Custom audience: Added to cart but didn't purchase (last 30 days)
- Exclusion: Purchasers (last 30 days)
- Optimization: Purchase
- Placements: Auto

**Ad Set 2: `OTF_AS_Retarget_ViewContent_7d`**
- Custom audience: Viewed content (product pages) but didn't add to cart (last 7 days)
- Optimization: AddToCart
- Placements: Auto

#### Campaign 3: `OTF_Catalog_Sales` (Advantage+ Shopping Campaign)

| Setting | Value |
|---|---|
| Campaign objective | Sales |
| Sub-type | Advantage+ Shopping Campaign (ASC) |
| Daily budget | $20/day |
| Pixel | OTF Pixel |
| Product catalog | Connect Shopify catalog to Meta |

> ASC uses Meta's AI to find buyers automatically. Requires a connected Shopify product catalog (see §3.1).

---

### 2.4 Herm's Heavy Hauling

**Business type:** Junk removal, Palm Beach County FL. Phone: `561-254-6104`. Staging site on DigitalOcean.  
**Primary objective:** Lead generation (calls, form submissions, quotes).  
**Target user:** Homeowners, property managers, realtors, contractors in Palm Beach County FL. Job size $3K–$10K.

#### Campaign 1: `HERMS_Lead_PBC`

| Setting | Value |
|---|---|
| Campaign objective | Leads (Lead Generation) |
| Buying type | Auction |
| Daily budget | $25/day |
| Lead form | Custom Instant Form (see below) |

**Ad Set 1: `HERMS_AS_PBC_Geo_25_65`**
- Locations: Palm Beach County, FL — all ZIP codes (or radius around West Palm Beach)
- Age: 25–65 (homeowners/property decision-makers)
- Gender: All
- Interests: Home improvement, real estate, property management, foreclosure, estate sales, home renovation, cleanup
- Placements: Auto (Facebook + Instagram Feed + Stories)
- Optimization: Leads
- Bid strategy: Lowest Cost

**Custom Instant Form:**
- Form name: `Herm's Heavy Hauling — Get a Quote`
- Fields: Name, Phone (required), Email, Service Address ZIP, Type of Job (dropdown: Residential / Foreclosure/Estate / Construction / Commercial), Description of items, Preferred date
- Privacy policy URL: Herm's site privacy page
- CTA: "Get My Free Quote"
- Intro text: "Tell us what needs to go. We'll review and get you a free, no-pressure quote within 24 hours."

#### Campaign 2: `HERMS_Call_Ads`

| Setting | Value |
|---|---|
| Campaign objective | Leads → Click-to-Call |
| Daily budget | $10/day |

**Ad Set 1: `HERMS_AS_Call_PBC`**
- Locations: Palm Beach County, FL
- Age: 25–65
- Optimization: Phone Call Connects
- Phone number: `561-254-6104`
- Placements: Facebook + Instagram Feed

---

### 2.5 Big Brother Property Solutions

**Business type:** Property services (Palm Beach County FL). Base44 app.  
**Primary objective:** Lead generation.  
**Target user:** Property managers, landlords, realtors, HOAs, investors, contractors in Palm Beach County FL.

#### Campaign 1: `BIGBRO_Lead_PBC`

| Setting | Value |
|---|---|
| Campaign objective | Leads |
| Daily budget | $20/day |

**Ad Set 1: `BIGBRO_AS_PBC_PropMgr_30_65`**
- Locations: Palm Beach County, FL
- Age: 30–65
- Interests: Property management, real estate investing, landlord, HOA, rental properties, real estate
- Placements: Auto (Facebook + Instagram Feed)
- Optimization: Leads

**Custom Instant Form:**
- Form name: `Big Brother Property Solutions — Request a Quote`
- Fields: Name, Phone (required), Email, Property Type (dropdown: Single-family / Multi-family / Commercial / HOA), Service Needed (dropdown: Maintenance / Turnover / Repairs / Landscaping / Full service), Number of Units, ZIP
- CTA: "Get a Quote"

#### Campaign 2: `BIGBRO_Awareness_PBC`

| Setting | Value |
|---|---|
| Campaign objective | Engagement (Reach) |
| Daily budget | $8/day |

**Ad Set 1: `BIGBRO_AS_PBC_Reach`**
- Locations: Palm Beach County, FL
- Age: 30–65
- Optimization: Reach
- Placements: Facebook Feed + Instagram Feed

---

## 3. Meta Pixel Installation

### 3.1 OTF — Shopify (Pixel already partially implemented)

**Status:** `metaPixel.js` exists at `C:/Users/Tap/otf-staging/src/lib/metaPixel.js` with ViewContent, AddToCart, InitiateCheckout, Purchase events. This is the **staging/app Pixel**. For the **Shopify storefront**, use Shopify's native Meta integration:

1. In **Shopify Admin** → **Online Store** → **Preferences** → **Facebook Pixel** → paste the OTF Pixel ID.
2. Shopify automatically fires PageView, ViewContent, AddToCart, InitiateCheckout, Purchase.
3. For enhanced matching, in Shopify → **Settings** → **Customer Accounts** — ensure customer email is collected at checkout.
4. **Connect Shopify Product Catalog to Meta:**
   - Shopify App Store → install **Meta & Instagram** (formerly Facebook) app.
   - Connect the OTF ad account and Pixel.
5. Verify events in **Meta Events Manager → Test Events** tab after 24h.

> **Current env var:** `VITE_META_PIXEL_ID` must be set to the real OTF Pixel ID in `C:/Users/Tap/otf-staging/.env.local`.

### 3.2 Athos Peaks — Base44 App

1. In **Base44** (the platform hosting Athos), go to the app's **Settings** or **Custom Code / Head** section.
2. Add the Meta Pixel base code to the global `<head>`:

```html
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'ATHOS_PIXEL_ID_HERE');
  fbq('track', 'PageView');
</script>
```

3. Replace `ATHOS_PIXEL_ID_HERE` with the real Athos Pixel ID.
4. If Base44 allows custom JS events, also fire:
   - `fbq('track', 'Lead')` on registration completion
   - `fbq('track', 'CompleteRegistration')` after signup
   - `fbq('trackCustom', 'AppInstall')` if install tracking is available from the app
5. For the **React Native/Expo** mobile app, use the `react-native-fbsdk-next` package:
   ```
   npm install react-native-fbsdk-next
   ```
6. In `App.tsx` or `_layout.tsx`:
   ```typescript
   import { Settings, AppEventsLogger } from 'react-native-fbsdk-next';
   Settings.setAppID('ATHOS_APP_ID');
   Settings.initializeSDK();
   AppEventsLogger.logEvent('AppInstalled');
   ```

### 3.3 Big Brother Property Solutions — Base44 App

Same approach as Athos (§3.2). Use the **BigBrother Pixel ID** in the `<head>` code.

Fire these events:
- `PageView` (automatic)
- `Lead` on form submission
- `Contact` on phone/quote request

### 3.4 Juke The Movement — Smart-Link Landing Pages

Smart-link landing pages are hosted on the DigitalOcean droplet (`129.212.181.255`).

1. SSH into the droplet:
   ```bash
   ssh root@129.212.181.255
   ```
2. Find the smart-link landing page HTML files (likely in `/var/www/` or similar).
3. Add the Juke Pixel base code to each landing page's `<head>` (same snippet as §3.2, using `JUKE_PIXEL_ID_HERE`).
4. Fire these events:
   - `PageView` (automatic on load)
   - `ViewContent` when a song/beat card is displayed
   - `InitiateCheckout` when "Buy" or "Stream" is clicked
   - `Lead` on email capture / pre-save signup
5. If the landing pages are single-page apps (React/Vue), ensure the Pixel fires on route changes.

### 3.5 Herm's Heavy Hauling — DigitalOcean Website

The staging site is at `C:/Users/Tap/herms-heavy-hauling-staging/index.html`.

1. Add the Herm's Pixel base code to the `<head>` of the production `index.html` (on the DigitalOcean droplet):
   ```html
   <script>
     !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
     n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
     n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
     t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
     document,'script','https://connect.facebook.net/en_US/fbevents.js');
     fbq('init', 'HERMS_PIXEL_ID_HERE');
     fbq('track', 'PageView');
   </script>
   ```
2. Replace `HERMS_PIXEL_ID_HERE` with the real Herm's Pixel ID.
3. Fire these events:
   - `PageView` (automatic)
   - `Lead` when the quote form is submitted (add to the `submit` event handler in `app.js`)
   - `Contact` when the phone number `561-254-6104` is clicked (tel: link)
4. In the Herm's `app.js`, add to the form submission handler:
   ```javascript
   if (window.fbq) { window.fbq('track', 'Lead', { content_name: 'Quote Request' }); }
   ```

---

## 4. Conversions API (CAPI) Setup

The Conversions API sends events **server-side**, which is more reliable than the browser Pixel (ad blockers, iOS limitations). Set it up in parallel with the Pixel for **dual-tracking with deduplication**.

### 4.1 OTF — Shopify (Easiest — Shopify Native)

1. Shopify Admin → **Settings** → **Customer Events** → **Web Pixel** (or Meta app's Conversions API toggle).
2. In the **Meta & Instagram** Shopify app → enable **Conversions API**.
3. Shopify automatically sends Purchase, InitiateCheckout, AddToCart server-side.
4. Deduplication is handled automatically by Shopify when both Pixel and CAPI are enabled.

### 4.2 Athos & Big Brother — Base44 (via Meta CAPI Gateway or Custom)

**Option A: Meta CAPI Gateway (recommended for Base44 apps)**
1. In Events Manager → select the Athos (or BigBrother) Pixel → **Settings** → **Conversions API**.
2. Choose **Partner Integration** → select your platform (or "Other").
3. If Base44 supports server-side webhooks, configure the event webhook to post to Meta's CAPI endpoint.

**Option B: Custom CAPI via DigitalOcean (backend)**
1. On the DigitalOcean droplet, create a Node.js or Python service that POSTs events to:
   ```
   https://graph.facebook.com/v20.0/{PIXEL_ID}/events?access_token={CAPI_TOKEN}
   ```
2. Generate the CAPI token in **Events Manager → Settings → Conversions API → Generate Access Token**.
3. Send the same `event_id` as the Pixel event for deduplication.
4. Payload structure (JSON):
   ```json
   {
     "data": [{
       "event_name": "Lead",
       "event_time": 1735430400,
       "event_id": "Lead-12345",
       "user_data": {
         "em": ["hashed_email"],
         "ph": ["hashed_phone"]
       },
       "action_source": "website",
       "event_source_url": "https://app.athospeaks.com"
     }]
     ,
     "access_token": "CAPI_TOKEN"
   }
   ```
5. Set up a cron job or event queue to fire this on each form submission.

### 4.3 Juke — Smart-Link Landing Pages

1. The landing pages are static HTML on DigitalOcean. For CAPI, add a lightweight backend endpoint:
   ```bash
   # On the droplet, create a Node.js/Express endpoint
   mkdir -p /opt/juke-capi && cd /opt/juke-capi
   npm init -y && npm install express axios
   ```
2. Create `server.js`:
   ```javascript
   const express = require('express');
   const axios = require('axios');
   const app = express();
   app.use(express.json());

   app.post('/api/track', async (req, res) => {
     const { event_name, event_id, event_source_url } = req.body;
     try {
       await axios.post(`https://graph.facebook.com/v20.0/${process.env.JUKE_PIXEL_ID}/events`, {
         data: [{ event_name, event_time: Math.floor(Date.now()/1000), event_id, action_source: 'website', event_source_url }],
         access_token: process.env.JUKE_CAPI_TOKEN
       });
       res.json({ ok: true });
     } catch (e) { res.status(500).json({ error: e.message }); }
   });
   app.listen(3001, () => console.log('Juke CAPI on 3001'));
   ```
3. Call this endpoint from the landing page's "Stream" / "Buy" button click handlers:
   ```javascript
   fetch('/api/track', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ event_name: 'InitiateCheckout', event_id: '...', event_source_url: window.location.href }) });
   ```

### 4.4 Herm's Heavy Hauling — DigitalOcean

1. The Herm's staging/production site runs on DigitalOcean. Add the same kind of CAPI endpoint (see §4.3) but for Herm's events:
2. On form submission, send a `Lead` event server-side.
3. On phone click (tel:5612546104), send a `Contact` event.
4. Use the Herm's CAPI token and Pixel ID.

### 4.5 Deduplication Rule (All Properties)

When both Pixel and CAPI fire the same event:
- Use the **same `event_id`** for both.
- Include the same `event_name` and `event_time` (within 5 minutes).
- Meta will deduplicate automatically. Do not send different event IDs.

---

## 5. Audience Creation Instructions

### 5.1 Custom Audiences (Retargeting)

Create these in **Audiences → Create Audience → Custom Audience**:

#### OTF (Only The Finest)
| Audience Name | Source | Rule | Retention |
|---|---|---|---|
| `OTF - All Visitors 30d` | Website (OTF Pixel) | Anyone who visited in 30 days | 30 days |
| `OTF - ViewContent 14d` | Website | ViewContent event, 14 days | 14 days |
| `OTF - AddToCart 30d` | Website | AddToCart, 30 days | 30 days |
| `OTF - InitiatedCheckout 14d` | Website | InitiateCheckout, 14 days | 14 days |
| `OTF - Purchasers 90d` | Website | Purchase, 90 days | 90 days |
| `OTF - Engaged IG 90d` | Engagement | Instagram engagement, 90 days | 90 days |

#### Athos Peaks
| Audience Name | Source | Rule | Retention |
|---|---|---|---|
| `Athos - App Visitors 30d` | Website/App | PageView, 30 days | 30 days |
| `Athos - Registrations 90d` | Website/App | CompleteRegistration, 90 days | 90 days |
| `Athos - Video Viewers 30d` | Engagement | Video 50% viewed, 30 days | 30 days |
| `Athos - Engaged IG 90d` | Engagement | Instagram engagement, 90 days | 90 days |

#### Juke The Movement
| Audience Name | Source | Rule | Retention |
|---|---|---|---|
| `Juke - Landing Page 90d` | Website | All visitors to smart-link pages, 90 days | 90 days |
| `Juke - Stream Clicks 30d` | Website | InitiateCheckout on stream links, 30 days | 30 days |
| `Juke - Email Signups 90d` | Website | Lead event, 90 days | 90 days |
| `Juke - IG Engaged 90d` | Engagement | Instagram engagement, 90 days | 90 days |

#### Herm's Heavy Hauling
| Audience Name | Source | Rule | Retention |
|---|---|---|---|
| `Herm's - Site Visitors 60d` | Website | All visitors, 60 days | 60 days |
| `Herm's - Quote Form Started 60d` | Website | Lead event, 60 days | 60 days |
| `Herm's - Phone Clicks 60d` | Website | Contact event, 60 days | 60 days |
| `Herm's - IG/FB Engaged 90d` | Engagement | FB + IG engagement, 90 days | 90 days |

#### Big Brother Property Solutions
| Audience Name | Source | Rule | Retention |
|---|---|---|---|
| `BigBro - Site Visitors 60d` | Website | All visitors, 60 days | 60 days |
| `BigBro - Quote Form 60d` | Website | Lead event, 60 days | 60 days |
| `BigBro - IG/FB Engaged 90d` | Engagement | FB + IG engagement, 90 days | 90 days |

### 5.2 Lookalike Audiences

Create these in **Audiences → Create Audience → Lookalike Audience**:

| Lookalike Name | Source | Size | Ad Account |
|---|---|---|---|
| `OTF - LAA Purchasers 1%` | OTF Purchasers 90d | 1% (US) | Only The Finest Ads |
| `OTF - LAA ATC 1%` | OTF AddToCart 30d | 1% (US) | Only The Finest Ads |
| `OTF - LAA Purchasers 3%` | OTF Purchasers 90d | 3% (US) | Only The Finest Ads |
| `Athos - LAA Registrations 1%` | Athos Registrations 90d | 1% (US) | Athos Peaks Ads |
| `Juke - LAA Stream Clicks 1%` | Juke Stream Clicks 30d | 1% (US) | Juke The Movement Ads |
| `Herm's - LAA Leads 1% (FL)` | Herm's Quote Form 60d | 1% (Florida) | Herm's Heavy Hauling Ads |
| `BigBro - LAA Leads 1% (FL)` | BigBro Quote Form 60d | 1% (Florida) | Big Brother Property Solutions Ads |

> **Rule:** Start with 1% lookalikes for precision. Expand to 3–5% only after 1% has been tested for 7+ days and is profitable.

### 5.3 Saved Audiences (Core Targeting)

Create these in **Ad Set → Saved Audience** for reuse:

| Saved Audience | Config |
|---|---|
| `SA - US 18-34 Streetwear` | US, 18-34, interests: streetwear, Hypebeast, sneaker culture |
| `SA - US 18-44 Fitness` | US, 18-44, interests: fitness, Apple Health, Fitbit, nutrition |
| `SA - US 16-34 Hip-Hop` | US, 16-34, interests: hip-hop, R&B, SoundCloud, Beatstars |
| `SA - PBC 25-65 Homeowner` | Palm Beach County FL, 25-65, interests: home improvement, real estate |
| `SA - PBC 30-65 Property Mgr` | Palm Beach County FL, 30-65, interests: property management, landlord, HOA |

---

## 6. Creative Asset Specifications

All creative assets should be generated/edited using the Canvas project (`C:/Users/Tap/the-canvas`) and stored in a shared folder. Use the `assets/` directory in each project or a central `C:/Users/Tap/MetaAdsCreative/` folder.

### 6.1 OTF (Only The Finest) — Streetwear

| Asset Type | Dimensions | Format | Qty | Purpose |
|---|---|---|---|---|
| Square feed image | 1080×1080 | PNG/JPG | 4 | Product hero shots (existing Dropbox `Only The Finest Assets`) |
| Vertical (Stories/Reels) | 1080×1920 | PNG/JPG or MP4 | 3 | Lifestyle / product flatlay |
| Carousel | 1080×1080 per card | PNG/JPG | 1 set (5 cards) | "Best sellers" / "New arrivals" |
| Video ad | 1080×1080 or 1080×1920 | MP4 (≤30s) | 2 | Unboxing / try-on / behind the scenes |
| Collection ad | 1080×1080 | PNG | 1 | Shopify catalog connected |

**Headline conventions:**
- "Only The Finest — Built Different"
- "Streetwear that speaks for itself"
- "New drop. Don't sleep."

**CTA:** Shop Now

### 6.2 Athos Peaks — Fitness App

| Asset Type | Dimensions | Format | Qty | Purpose |
|---|---|---|---|---|
| Square | 1080×1080 | PNG | 3 | App UI screenshots (dashboard, workout, nutrition) |
| Vertical | 1080×1920 | MP4 (15-30s) | 2 | Reels — workout/training montage |
| Carousel | 1080×1080 | PNG | 1 set (4 cards) | "Your fitness ecosystem" — swipe through features |
| Story | 1080×1920 | PNG | 2 | "Track everything. Train smarter." |

**Headline conventions:**
- "Athos Peaks — Your Body, Tracked Honestly"
- "Train smarter. Recover better."
- "The honest fitness app"

**CTA:** Download / Install

### 6.3 Juke The Movement — Music

| Asset Type | Dimensions | Format | Qty | Purpose |
|---|---|---|---|---|
| Square | 1080×1080 | JPG + MP4 | 3 | Album/single artwork with audio clip (Beatstars, Suno Songs) |
| Vertical | 1080×1920 | MP4 (15-30s) | 2 | Audio visualizer with cover art (for Reels/Stories) |
| Carousel | 1080×1080 | JPG | 1 set (5 cards) | "New drops" — multi-track carousel |

**Source material:**
- Existing tracks in `C:/Users/Tap/Downloads/Juke The Movement/Suno Songs/` (The Space Between.mp3, You Get To Me.mp3)
- Beat catalog in `C:/Users/Tap/Dropbox/Alliance Beats bih/` and `C:/Users/Tap/Dropbox/Beat Reproduction/`

**Headline conventions:**
- "Juke The Movement — New Drop"
- "Stream now. Link in bio."
- "Fresh beats, every week."

**CTA:** Listen Now / Stream

### 6.4 Herm's Heavy Hauling — Junk Removal

| Asset Type | Dimensions | Format | Qty | Purpose |
|---|---|---|---|---|
| Square | 1080×1080 | JPG | 3 | Before/after cleanup photos, truck + trailer |
| Vertical | 1080×1920 | JPG | 2 | Before/after Stories |
| Carousel | 1080×1080 | JPG | 1 set (4 cards) | Service types (residential, foreclosure, construction, estate) |

**Headline conventions:**
- "Herm's Heavy Hauling — We'll Haul Anything"
- "Junk gone in 24 hours. Palm Beach County."
- "Free quotes. No pressure. 561-254-6104"

**CTA:** Get a Quote / Call Now

### 6.5 Big Brother Property Solutions — Property Services

| Asset Type | Dimensions | Format | Qty | Purpose |
|---|---|---|---|---|
| Square | 1080×1080 | JPG | 3 | Property maintenance before/after, team photos |
| Vertical | 1080×1920 | JPG | 2 | Before/after Stories |
| Carousel | 1080×1080 | JPG | 1 set (4 cards) | Services (maintenance, turnover, repairs, landscaping) |

**Headline conventions:**
- "Big Brother Property Solutions — Your Property, Our Problem"
- "Palm Beach County's full-service property team"
- "From turnovers to full maintenance. One call."

**CTA:** Get a Quote

---

## 7. Campaign Launch Sequence

### Phase 1: Foundation (Days 1–3)

1. **Day 1: Business Manager + Ad Accounts**
   - Create/verify Business Manager.
   - Create 5 ad accounts.
   - Verify all 5 domains (§1.3).
   - Create 5 Pixels (one per business).

2. **Day 2: Pixel + CAPI Installation**
   - Install OTF Pixel in Shopify (§3.1).
   - Install Athos + BigBrother Pixels in Base44 `<head>` (§3.2, §3.3).
   - Install Juke Pixel on smart-link landing pages on DigitalOcean (§3.4).
   - Install Herm's Pixel on production site on DigitalOcean (§3.5).
   - Set up CAPI for each (§4).

3. **Day 3: Verify Pixels + Audiences**
   - In Events Manager → **Test Events** — verify each pixel is firing.
   - Create all custom audiences (§5.1).
   - Create saved audiences (§5.3).
   - Connect Shopify product catalog for OTF (for ASC + catalog sales).

### Phase 2: Test Campaigns (Days 4–7)

Launch **one test campaign per business** at minimum budget to validate:

| Business | Campaign | Daily Budget | Test Duration |
|---|---|---|---|
| OTF | ProSales_Broad | $10/day | 3 days |
| Athos | AppInstalls_Broad | $10/day | 3 days |
| Juke | Traffic_SmartLink | $10/day | 3 days |
| Herm's | Lead_PBC | $15/day | 3 days |
| Big Brother | Lead_PBC | $10/day | 3 days |

**What to check during test:**
- Are ads delivering (impressions > 0)?
- Are pixels firing (check Events Manager)?
- Is cost per result reasonable?
- Any policy violations or rejections?

### Phase 3: Full Launch (Days 8–14)

If test campaigns are healthy (delivery + tracking working):
1. Increase budgets to full levels (see §8).
2. Launch all remaining campaigns (retargeting, engagement, catalog sales).
3. Create lookalike audiences (§5.2) — requires enough source data (100+ events recommended).
4. Add 2nd and 3rd creatives per ad set (testing phase).

### Phase 4: Optimization (Days 15–30)

1. Kill underperforming ads (CPA > 2× target, or < 1% CTR after 3 days).
2. Scale winners (+20% budget every 48h if profitable).
3. Test new creatives (1 new per ad set per week).
4. Build lookalikes if not already (once 100+ conversions accumulated).

---

## 8. Budget Pacing Schedule (30-Day)

### 8.1 Weekly Spend Targets per Business

| Business | Week 1 (Test) | Week 2 (Scale) | Week 3 (Optimize) | Week 4 (Steady) | 30-Day Total |
|---|---|---|---|---|---|
| OTF | $70 | $140 | $175 | $175 | $560 |
| Athos Peaks | $70 | $105 | $140 | $140 | $455 |
| Juke | $70 | $105 | $140 | $140 | $455 |
| Herm's Heavy | $105 | $140 | $175 | $175 | $595 |
| Big Brother | $70 | $105 | $140 | $140 | $455 |
| **Total** | **$385** | **$595** | **$770** | **$770** | **$2,520** |

### 8.2 Daily Budget per Campaign (at full scale, Week 2+)

#### OTF
| Campaign | Daily | Weekly |
|---|---|---|
| ProSales_Broad | $20/day | $140 |
| ProSales_Retarget | $10/day | $70 |
| Catalog_Sales (ASC) | $10/day | $70 |
| **Total** | **$40/day** | **$280** |

#### Athos Peaks
| Campaign | Daily | Weekly |
|---|---|---|
| AppInstalls_Broad | $15/day | $105 |
| Engagement_Insta | $5/day | $35 |
| **Total** | **$20/day** | **$140** |

#### Juke
| Campaign | Daily | Weekly |
|---|---|---|
| Traffic_SmartLink (Broad) | $10/day | $70 |
| Traffic_SmartLink (Retarget) | $5/day | $35 |
| Engagement_Reels | $5/day | $35 |
| **Total** | **$20/day** | **$140** |

#### Herm's Heavy Hauling
| Campaign | Daily | Weekly |
|---|---|---|
| Lead_PBC | $20/day | $140 |
| Call_Ads | $5/day | $35 |
| **Total** | **$25/day** | **$175** |

#### Big Brother
| Campaign | Daily | Weekly |
|---|---|---|
| Lead_PBC | $15/day | $105 |
| Awareness_PBC | $5/day | $35 |
| **Total** | **$20/day** | **$140** |

> **Pacing rule:** Never increase budget by more than 20% in a 48-hour period to avoid algorithm reset.

---

## 9. Tracking & Measurement Setup

### 9.1 UTM Convention

Use this format for all ad URLs (campaign URL parameters):

```
?utm_source=meta&utm_medium={ad_platform}&utm_campaign={campaign_name}&utm_content={ad_name}&utm_term={audience_name}
```

**Example (OTF):**
```
https://shoponlythefinest.com?utm_source=meta&utm_medium=facebook&utm_campaign=otf_prosales_broad&utm_content=ad_square_hero&utm_term=broad_18_34_us
```

**Example (Herm's):**
```
https://hermsheavyhauling.com?utm_source=meta&utm_medium=facebook&utm_campaign=herms_lead_pbc&utm_content=ad_beforeafter&utm_term=pbc_25_65
```

In Meta Ads Manager, use the **URL Parameters** field in the ad setup to add these automatically. Use Meta's dynamic parameters:
```
utm_source={{site_source_name}}
utm_medium={{placement}}
utm_campaign={{campaign.name}}
utm_content={{ad.name}}
```

### 9.2 GA4 (Google Analytics 4) Setup

1. Create a GA4 property for each business domain at **https://analytics.google.com**.
2. Add the GA4 measurement tag to each site (same `<head>` as Pixel):
   ```html
   <!-- GA4 -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXX');
   </script>
   ```
3. Each business gets its own GA4 property and measurement ID (`G-XXXXXXX`).
4. Link GA4 to Google Search Console for organic search data.
5. In GA4 → **Admin → Data Streams → Enhanced Measurement** — enable page views, scrolls, outbound clicks, site search.

### 9.3 Shopify Analytics (OTF)

1. Shopify Admin → **Settings → Analytics** — ensure Google Analytics is connected.
2. Shopify Admin → **Analytics → Dashboards** — monitor:
   - Total sales (from Meta traffic)
   - Conversion rate
   - Average order value
   - Traffic sources (filter by `utm_source=meta`)
3. In Shopify → **Reports → Custom Reports** — create a "Meta Ads Revenue" report filtering by UTM source.

### 9.4 Spotify for Artists (Juke)

1. Claim / verify **Spotify for Artists** at **https://artists.spotify.com**.
2. Connect Spotify to **Spotify Ad Studio** (if running Spotify ads separately — optional).
3. In Spotify for Artists → **Audience** → track:
   - Monthly listeners
   - Streams per track
   - Source of streams (Playlist vs Algorithmic vs Profile)
   - Follower growth
4. Compare to Meta ad spend on Juke to calculate cost per stream.
5. Also claim **Apple Music for Artists** and **SoundCloud Stats**.

### 9.5 Herm's Heavy Hauling — Lead Tracking

1. Use the Meta Lead Form's **CRM download** (Events Manager → Forms → Download leads) or connect to a CRM.
2. Track these KPIs weekly:
   - Leads received (from Meta form)
   - Calls from Call Ads
   - Lead → Quote conversion rate
   - Quote → Booking conversion rate
   - Revenue per lead
3. Log all leads in the **HEAVY_LEADS.csv** at `C:/Users/Tap/Documents/Momentum-Labs-Command-Center/HEAVY_LEADS.csv`.

### 9.6 Big Brother — Lead Tracking

1. Same as Herm's (§9.5). Download leads from Meta Lead Forms.
2. Log in a new CRM CSV: `C:/Users/Tap/Documents/Momentum-Labs-Command-Center/BIGBRO_LEADS.csv`

---

## 10. Daily Management Cheat Sheet

### Daily (5–10 minutes)

- [ ] **Meta Ads Manager → Overview**: Check all 5 ad accounts for:
  - Spend vs. budget (is anything overspending or not delivering?)
  - Results (leads, purchases, installs) vs. target
  - Cost per result (CPL, CPA, CPI)
  - Any ad rejections or policy issues (red alert icons)
- [ ] **Events Manager**: Confirm pixel events are still firing (spike in 0 = broken pixel)
- [ ] **Herm's leads**: Download/check Meta Lead Form responses → call back within 24h → log in `HEAVY_LEADS.csv`
- [ ] **Big Brother leads**: Same → log in `BIGBRO_LEADS.csv`

### Weekly (30–45 minutes)

- [ ] **Performance review per business:**
  - OTF: ROAS target ≥2.0, CPA < $30, CTR > 1.5%
  - Athos: CPI < $5, CTR > 1.5%
  - Juke: Cost per stream < $2, CTR > 1%
  - Herm's: CPL < $35, lead→quote rate > 20%
  - Big Brother: CPL < $40, lead→quote rate > 20%
- [ ] **Kill underperformers**: Pause ads with CPA > 2× target after 3+ days of spend
- [ ] **Scale winners**: +20% budget if profitable and stable for 7+ days
- [ ] **Creative refresh**: Check if any ad has fatigue (frequency > 4, CTR declining). Prep a new creative.
- [ ] **Audience expansion**: If 100+ conversions accumulated, build 1% lookalike (if not done)

### Monthly (1–2 hours)

- [ ] **Budget review**: Adjust monthly spend per business based on ROI
- [ ] **Pixel/CAPI health check**: Run Test Events in Events Manager for each pixel
- [ ] **Quarterly strategy review**: Assess which businesses are worth scaling, which to pause
- [ ] **Update this guide**: Log what worked, what didn't, new benchmarks

### Quick Links

| Resource | URL |
|---|---|
| Business Manager | https://business.facebook.com |
| Ads Manager | https://adsmanager.facebook.com |
| Events Manager | https://business.facebook.com/events_manager |
| Audiences | https://business.facebook.com/audiences |
| Shopify Admin | https://admin.shopify.com (OTF) |
| Base44 | https://app.base44.com (Athos, Big Brother) |
| Spotify for Artists | https://artists.spotify.com (Juke) |
| GA4 | https://analytics.google.com |
| DigitalOcean | https://cloud.digitalocean.com (droplet 129.212.181.255) |
| Canvas (Creative) | `C:/Users/Tap/the-canvas` |

---

## Appendix A: Pixel ID Reference (Fill In After Setup)

| Business | Pixel Name | Pixel ID | Ad Account ID | Domain |
|---|---|---|---|---|
| OTF | OTF Pixel | `__________` | `act.__________` | shoponlythefinest.com |
| Athos Peaks | Athos Pixel | `__________` | `act.__________` | app.athospeaks.com |
| Juke The Movement | Juke Pixel | `__________` | `act.__________` | jukethemovement.com |
| Herm's Heavy Hauling | Herm's Pixel | `__________` | `act.__________` | hermsheavyhauling.com |
| Big Brother | BigBrother Pixel | `__________` | `act.__________` | bigbrotherpropertysolutions.com |

> Fill in these IDs after creating each pixel in Events Manager. They are needed for Pixel installation, CAPI, and campaign setup.

## Appendix B: Conversions API Tokens (Fill In After Setup)

| Business | CAPI Access Token | Storage Location |
|---|---|---|
| OTF | Shopify-managed (no manual token needed) | Shopify Admin |
| Athos Peaks | `__________` | DigitalOcean env var: `ATHOS_CAPI_TOKEN` |
| Big Brother | `__________` | DigitalOcean env var: `BIGBRO_CAPI_TOKEN` |
| Juke | `__________` | DigitalOcean env var: `JUKE_CAPI_TOKEN` |
| Herm's | `__________` | DigitalOcean env var: `HERMS_CAPI_TOKEN` |

> Generate tokens in Events Manager → Pixel → Settings → Conversions API → Generate Access Token. Store in `.env` on the DigitalOcean droplet, never in Git.

---

**End of Guide — Follow this top-to-bottom and every campaign will be live within 2 weeks.**
