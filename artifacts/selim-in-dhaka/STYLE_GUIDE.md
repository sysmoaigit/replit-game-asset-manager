# Selim in Dhaka — Visual Style Guide

This guide defines the unified art direction for **Selim in Dhaka: Pinky Mission** so every screen — Start, Game, Decision Card, Day Summary, Endings, Album, Menu, Settings, loading/empty/error — feels like one cohesive Bogura-meets-Dhaka world.

> Implemented during Task #9 (Visual & Art Refresh). Real character/scene illustrations are owned by Task #14 — this guide and the supporting tokens/components make sure those assets land into a consistent system.

---

## 1. Mood

> **Bogura sun, Dhaka dusk, hand-drawn warmth.**
> Selim is a small-town boy in a big-city night. Every surface should feel like a chai stall lantern in monsoon evening — warm cream + saffron foreground, deep amber-brown background, gold highlights, with one heartbreak-pink accent reserved for Pinky moments.

The visual language leans hand-drawn (1.5–2px strokes, gentle gradients, soft shadows) rather than glossy or flat-design crisp. Avoid pure black, pure white, neon, or "techy" purple/cyan tones.

---

## 2. Palette

All colors live as CSS tokens in `src/index.css` under `:root`. **Always use the token, never the raw hex.**

| Token              | Hex       | Use                                               |
| ------------------ | --------- | ------------------------------------------------- |
| `--brand-saffron`  | `#FF6B00` | Primary CTA, headers, focus ring                  |
| `--brand-amber`    | `#FF8F00` | CTA gradient pair                                 |
| `--brand-gold`     | `#FFD700` | Highlights, victory, secondary text on dark       |
| `--brand-tea`      | `#FFB347` | Secondary text on dark, helper text               |
| `--brand-pink`     | `#FF69B4` | **Reserved for Pinky** — romance, attachment, heartbreak markers |
| `--brand-pink-soft`| `#FF9ECF` | Hover / softer Pinky states                      |
| `--brand-cream`    | `#FFF8EE` | Card body warm                                    |
| `--brand-cream-2`  | `#FFF3E0` | Card body warm gradient pair                      |
| `--brand-night`    | `#1a0f05` | Backdrop deep                                     |
| `--brand-deep`     | `#2d1a08` | Backdrop mid                                      |
| `--brand-shadow`   | `#0d0600` | Backdrop top                                      |
| `--brand-rickshaw` | `#CC3300` | Accent red (rickshaws, danger flair)              |
| `--brand-leaf`     | `#22c55e` | Positive stat delta                               |
| `--brand-warn`     | `#ef4444` | Negative stat delta, danger glow                  |

### Scene mood tints (HSL — used by `SceneArt` overlays)

| Token              | Use                            |
| ------------------ | ------------------------------ |
| `--mood-romantic`  | Pinky cards, crush moments     |
| `--mood-heartbreak`| Pinky-no, post-breakup beats   |
| `--mood-friendship`| Rafiq, cha-stall talks         |
| `--mood-career`    | Office, work, Bogura Boss      |
| `--mood-boss`      | Best ending halo               |
| `--mood-silent`    | Generic dark vignette          |
| `--mood-comedy`    | Light humor scenes             |
| `--mood-danger`    | Addiction, recovery mode       |

---

## 3. Typography

**One Bangla-first font pair, two weights of emphasis.**

- **Display & body (`--app-font-sans`)** → `Hind Siliguri` (300/400/500/600/700). Used everywhere the player reads narrative or chrome.
- **Reflective / chapter (`--app-font-serif`)** → `Tiro Bangla` for occasional ending epilogues and chapter titles where a calmer voice helps.
- **Mono (`--app-font-mono`)** → `Menlo` for the QA / debug panels only.

**Rules**

- Never set `fontFamily` inline. Use the `.font-bn` (or `.font-bn-display`) utility class introduced in `index.css`.
- Title gradient text uses the `.dhaka-title-gradient` class (saffron → gold → saffron).
- Bangla numerals (১২৩) are fine in narrative; ASCII (1, 2, 3) is fine in stat values — keep within a single phrase consistent.

---

## 4. Shape & elevation

- **Corner radius scale** — Tailwind: `rounded-xl` (0.75rem) for chips, `rounded-2xl` (1rem) for buttons & cards, `rounded-3xl` (1.5rem) for primary modals only. Never use `rounded-md` or `rounded-full` on cards.
- **Stroke weight** — Inline SVGs and icons share `strokeWidth=1.75` and round caps/joins. See `src/components/ui/Icon.tsx`.
- **Elevation tokens** in `index.css`:
  - `--elev-sm` — chips, secondary buttons
  - `--elev-md` — cards, primary CTA
  - `--elev-lg` — hovered/active CTA
  - `--glow-saffron`, `--glow-gold`, `--glow-pink` — celebratory rings on Endings, Pinky moments

---

## 5. Component primitives

Use these utility classes from `index.css` instead of re-styling buttons/cards inline:

| Class                     | Where                                                       |
| ------------------------- | ----------------------------------------------------------- |
| `.dhaka-btn-primary`      | Single saffron CTA per screen ("নতুন খেলা", "আবার খেলি")    |
| `.dhaka-btn-secondary`    | Continue / paired action on dark backdrop                   |
| `.dhaka-btn-ghost`        | Tertiary on dark (Tutorial, Album link)                     |
| `.dhaka-btn-ghost-warm`   | Tertiary INSIDE the cream Menu modal                        |
| `.dhaka-btn-danger`       | Destructive (New Game from menu)                            |
| `.dhaka-card-warm`        | Decision card body, Menu modal, Day Summary inner card      |
| `.dhaka-card-dark`        | Translucent cards floating on scene backdrops               |
| `.dhaka-header-saffron`   | The saffron header strip atop cream cards/modals            |
| `.dhaka-modal-backdrop`   | Modal overlay (replaces `rgba(0,0,0,0.85)` inline)          |
| `.dhaka-toggle-pill`      | ON/OFF pill in Menu                                         |
| `.font-bn`                | Bangla body type (replaces every inline `fontFamily`)       |
| `.dhaka-title-gradient`   | Saffron → gold gradient title text                          |

---

## 6. Iconography

**Stat icons must use the unified `Icon` component** (`src/components/ui/Icon.tsx`) instead of emoji. Emoji are still welcome for narrative flair (Selim says "🌾 Bogura"), but the chrome (StatBars, Decision-result effect chips, Ending recap) should reach for the SVG set so glyph weight is consistent across iOS, Android, and desktop.

Mapping emoji → Icon name:
`❤️ heart`, `😊 smile`, `🧠 brain`, `⚡ bolt`, `⭐ star`, `🚬 smoke`, `🔥 flame`, `🛡️ shield`, `💖 pinky`, `🎀 ribbon`, `💼 briefcase`, `🤝 handshake`, `🌫️ fog`, `🔗 link`, `🌑 moon`, `🔥 fever`, `৳ money`, `🏆 trophy`.

---

## 7. Loading / empty / error

Every "nothing here" surface gets a spot illustration from `src/components/ui/SpotArt.tsx`:

- `<ChaLoadingSpot />` — steaming cha cup, used while the next card resolves.
- `<PaperBoatSpot />` — paper boat in a monsoon puddle, used for empty Album, no-saves, no-achievements.
- `<LanternErrorSpot />` — flickering street lantern, used for caught errors and missing data.

All three accept a `caption` prop in Bangla so the voice matches even when assets are silent. They respect `reducedMotion`.

---

## 8. Scene art

Real illustrations live under `public/assets/selim/` and are loaded by `SceneArt`. **When an asset is missing, `SceneArt` renders a procedural mood-tinted gradient backdrop** (saffron for daytime/positive scenes, indigo for monsoon/heartbreak, cobalt for night, ember for danger) instead of the old dashed "Scene art missing" placeholder. This lets the game look intentional during Task #14's incremental rollout.

Mapping: `SceneArt` reads the `sceneKey` prefix to pick the gradient (`rooftop*` → ember sunset, `*Heartbreak*` → indigo monsoon, `*Boss*` → gold halo, etc.). See `SCENE_GRADIENT_MAP` in `src/components/SceneArt.tsx`.

---

## 9. Selim expressions

`SelimAvatar` already derives 4 modes (`romantic / emotional-override / heartbroken / bogura-boss`) plus 2 status overlays (`broke / coin-shake`). When real expression artwork lands (Task #14), wire it through the existing `deriveMode`/`deriveStatus` switch — no new mapping layer required.

---

## 10. Mobile & desktop

The game is built mobile-first (max-w-sm content column). On desktop, the column stays narrow and the scene backdrops stretch behind it — no second column, no widescreen reflow. Verify all spot SVGs and chrome render crisp on retina by testing at 1× and 2× DPI.
