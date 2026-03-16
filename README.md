# @codepenguin/adsense-simulator

A lightweight **development simulator for Google AdSense** that allows developers to test ad placements locally **without contacting Google servers**.

It mimics core runtime behavior such as `.adsbygoogle` slots, responsive sizing, queue handling, and click flow so you can verify layouts during development.

> ⚠️ **This library is intended only for development environments.**
> Do not use it in production. In production, load the official Google AdSense script.

---

# Features

- Simulates `.adsbygoogle` ad slots
- Mimics `adsbygoogle.push()` queue behavior
- Responsive ad sizing based on container width
- Container-based ad rendering
- Dynamic DOM insertion detection
- Multiple ad placements on the same page
- Simulated advertiser landing page on click
- Debug information displayed inside rendered ads
- Works **completely offline without contacting Google**

---

# Installation

```bash
npm install @codepenguin/adsense-simulator
```

---

# Usage

Import the simulator in your project during development.

```javascript
import "@codepenguin/adsense-simulator";
```

Once imported, the simulator automatically starts and listens for `.adsbygoogle` slots.

---

# Example Ad Slot

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

The simulator will render a **mock ad container** with useful debug information such as:

- client ID
- slot ID
- chosen ad size
- container width
- ad format

---

# Click Simulation

Clicking a simulated ad opens a **mock advertiser landing page** showing metadata about the clicked ad.

Example information displayed:

```
slot
client
size
format
containerWidth
page
timestamp
```

This helps verify that ad properties are correctly passed during click events.

---

# CDN Usage

You can also use the simulator directly via CDN.

```html
<script src="https://cdn.jsdelivr.net/npm/@codepenguin/adsense-simulator/dist/adsense-simulator.min.js"></script>
```

This allows quick testing without installing npm packages.

---

# What the Simulator Emulates

| Feature                       | Supported |
| ----------------------------- | --------- |
| `.adsbygoogle` slot detection | ✅        |
| `adsbygoogle.push()` queue    | ✅        |
| Responsive ad sizing          | ✅        |
| Container-based ad selection  | ✅        |
| Dynamic DOM insertion         | ✅        |
| Multiple ad placements        | ✅        |
| Click simulation              | ✅        |
| Debug information             | ✅        |

---

# What It Does Not Simulate

The simulator does **not replicate Google’s ad network infrastructure**, including:

- real ad auctions
- advertiser targeting
- revenue tracking
- fraud detection
- actual ad creatives

These systems run on Google servers and cannot be reproduced locally.

---

# Development Purpose

This tool is designed to help developers:

- verify ad placements
- test responsive layouts
- debug `.adsbygoogle` integration
- simulate ad click flows

without requiring real ads during development.

---

# Project Structure

```
adsense-simulator
│
├ src
├ dist
│   ├ adsense-simulator.js
│   ├ adsense-simulator.min.js
│   └ adsense-simulator.dev.js
│
├ README.md
└ package.json
```

Only the **`dist` build files** are published to npm.

---

# Contributing

Issues and pull requests are welcome.

Repository:

```
https://github.com/clowneon1/adsense-simulator
```

---

# Author

**clowneon1**

---

# License

MIT

If you want, I can also help you add a **nice npm badge + version badge + install badge** at the top of the README so the package page looks more professional on GitHub and npm.
