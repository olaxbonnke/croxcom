# Autonomous Design & UI/UX Selection Rules

## 🎨 Design Reference Selection & Execution

Whenever building, designing, or updating any web application, page, or interface, automatically select and apply the optimal design reference from the **`awesome-design-reference`** collection (74 real-world brand DESIGN.md specs).

### 1. Decision Matrix for Selecting Design References

| Project / Domain Type | Recommended Design References | Key Design Characteristics |
|---|---|---|
| **AI & LLM Platforms** | **Claude**, **Mistral AI**, **Cohere**, **Replicate**, **Runway** | Atmospheric gradients, warm terracotta/sunset tones, cinematic dark or clean editorial typography |
| **Developer Tools & IDEs** | **Vercel**, **Cursor**, **Raycast**, **Warp**, **OpenCode AI** | Terminal-native styling, Geist/Berkeley Mono typography, command-palette overlays, high-contrast dark modes |
| **Databases & DevOps** | **Supabase**, **Sanity**, **Sentry**, **ClickHouse**, **PostHog** | Deep midnight/teal/purple backgrounds, neon emerald/lime signal accents, dense technical data tables |
| **SaaS & Productivity** | **Linear**, **Stripe**, **Resend**, **Intercom**, **Cal.com** | Sub-pixel borders (`border-white/10`), signature lavender/indigo CTAs, gradient mesh heroes, weight-300 display type |
| **Fintech & Crypto** | **Stripe**, **Coinbase**, **Revolut**, **Wise**, **Binance** | Trust-focused cobalt/indigo, vivid signal accents (emerald, bright yellow), crisp pill buttons, real-time data visual density |
| **Creative & Portfolios** | **Framer**, **Runway**, **Figma**, **Apple**, **Clay** | Bold typography, photography-first gallery cards, dark canvas contrast, motion-inspired hover scales |
| **E-Commerce & Retail** | **Shopify**, **Nike**, **Airbnb**, **Starbucks**, **Apple** | Photography-driven full-bleed hero tiles, warm rounded UI containers, high-contrast typography |
| **Media & Tech Editorial** | **WIRED**, **The Verge**, **Spotify**, **SpaceX**, **Apple** | Acid brutalist or dark immersive `#121212`, custom serif headlines, masonry/tile layouts |
| **Luxury & Automotive** | **Tesla**, **Ferrari**, **Bugatti**, **BMW**, **Apple** | Radical subtraction, chiaroscuro contrast, full-viewport photography, museum gallery minimalism |

---

### 2. Standards for Professional UI Design

1. **Visual Excellence**:
   - Avoid generic browser default colors (`rgb(0,0,255)`, basic red/green). Use tailored OKLCH/HSL color tokens.
   - Use high-quality web typography (e.g., *Inter*, *Geist*, *JetBrains Mono*, *Outfit*) with explicit `leading` and `tracking`.
   - Incorporate subtle micro-animations, smooth transition states, glassmorphism (`backdrop-blur-md`), and ambient glow shadows (`shadow-primary/20`).

2. **Proactive Design Leadership**:
   - When asked to build or style a component/page, automatically evaluate and state which design reference is selected and why it fits the project goals.
   - Enforce clean layout density, responsive mobile/desktop boundaries, and seamless accessibility across all states.
