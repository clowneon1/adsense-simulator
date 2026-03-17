# @codepenguin/adsense-simulator

A lightweight **development tool that simulates Google AdSense behavior locally**.

This allows developers to test **ad placements, responsive layouts, and integration logic** without loading real Google ads.

The simulator reproduces key runtime behaviors of AdSense while running **entirely in the browser with no external network requests**.

⚠️ **Development use only. Do not use in production.**

---

# Features

The simulator reproduces important behaviors of Google AdSense:

- `.adsbygoogle` slot detection
- `adsbygoogle.push()` queue handling
- responsive ad sizing
- container-based ad selection
- dynamic DOM insertion detection
- SPA navigation support
- back/forward navigation handling
- click simulation
- ad metadata inspection
- optional blocking of the real AdSense script

---

# Installation

## npm

```bash
npm install @codepenguin/adsense-simulator
```

Then import it in your development environment:

```javascript
import "@codepenguin/adsense-simulator";
```

---

## CDN

You can also use the simulator directly in static HTML pages.

```html
<script src="https://cdn.jsdelivr.net/npm/@codepenguin/adsense-simulator/dist/adsense-simulator.min.js"></script>
```

---

# Example Ad Slot

Use normal AdSense markup.

```html
<ins
  class="adsbygoogle"
  style="display:block;width:300px;height:250px"
  data-ad-client="ca-pub-demo"
  data-ad-slot="123456"
>
</ins>

<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

The simulator will render a mock ad displaying useful debug information.

Example:

```
adsense-simulator
client: ca-pub-demo
slot: 123456
size: 300x250
format: fixed
```

---

# Responsive Ads

Responsive slots are supported.

```html
<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-demo"
  data-ad-slot="123456"
  data-ad-format="auto"
>
</ins>
```

The simulator chooses an appropriate ad size based on container width.

---

# Dynamic Ads (SPA / React / Astro)

The simulator automatically detects dynamically inserted ads.

```javascript
const ad = document.createElement("ins");

ad.className = "adsbygoogle";
ad.style.display = "block";
ad.style.width = "300px";
ad.style.height = "250px";

ad.setAttribute("data-ad-client", "ca-pub-demo");
ad.setAttribute("data-ad-slot", "123456");

document.body.appendChild(ad);

adsbygoogle.push({});
```

MutationObserver automatically triggers a scan.

---

# Click Simulation

Clicking a simulated ad opens a mock advertiser page displaying ad metadata.

Example data shown:

- client
- slot
- ad size
- format
- container width
- page path
- timestamp

This helps verify correct ad configuration.

---

# Blocking Real AdSense Script

During development you may want to prevent the real AdSense script from loading.

Use the script parameter:

```html
<script src="https://cdn.jsdelivr.net/npm/@codepenguin/adsense-simulator/dist/adsense-simulator.min.js?removeGoogleAds=true"></script>
```

When enabled, the simulator intercepts attempts to load:

```
https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js
```

and prevents it from downloading.

This avoids conflicts between the simulator and real AdSense.

---

# Console Output

When the simulator starts you will see:

```
adsense-simulator: started { removeGoogleAds: "true" }
```

If the real AdSense script is blocked:

```
adsense-simulator: blocked Google AdSense script
```

---

# Supported Ad Sizes

The simulator supports common AdSense sizes including:

- 320×50
- 468×60
- 728×90
- 300×250
- 336×280
- 160×600
- 300×600
- 970×90
- 970×250

Responsive ads automatically choose the closest match.

---

# Runtime Behavior

The simulator processes ads using a queue system similar to AdSense:

```
adsbygoogle.push()
        ↓
queue intercept
        ↓
slot scanning
        ↓
ad rendering
```

Dynamic content and SPA navigation are handled via MutationObserver.

---

# What This Simulator Does NOT Replicate

This tool does not simulate Google’s ad network infrastructure.

It does **not provide**:

- real ads
- advertiser targeting
- auctions
- revenue tracking
- fraud detection
- AdSense account validation

Those systems run exclusively on Google's servers.

---

# License

MIT

---

# Repository

https://github.com/clowneon1/adsense-simulator
