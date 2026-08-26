# DESIGN.md — CryptoSea dark UI

Reference: exchange-connections screenshot (dark fintech dashboard, sidebar + card grid).
Extracted for reuse across screens of this app. Values marked `~` are close visual estimates
from the screenshot, not sampled pixels — treat as a starting point, adjust on first real build
and update this file when they change (this doc should stay in sync with `src/styles.css`).

Stack already in the repo, use it as-is: Tailwind v4 + shadcn (`components.json`, style
`base-mira`), CSS variables in `src/styles.css`, font `Inter Variable` via `@fontsource-variable/inter`
(already imported — don't add a second Inter source), icons via **Phosphor** (`iconLibrary` in
`components.json` — don't introduce Lucide/Heroicons alongside it).

## 1. Color

The app is dark-only (no light-mode swap visible in the reference — build the dark palette,
skip a light variant until asked). Map onto the *existing* shadcn variable names in
`src/styles.css` under `.dark`, don't invent parallel token names.

| Token (`src/styles.css` var) | ~Hex | Usage |
|---|---|---|
| `--background` | `#0A0A0C` | Page canvas, sidebar |
| `--sidebar` | `#0A0A0C` | Same as background — sidebar has no separate fill, only the active-item pill differs |
| `--foreground` | `#F5F5F6` | Primary text (titles, balances, exchange names) |
| `--card` | `#17171B` | Exchange cards, "Available exchanges" panel |
| `--card-foreground` | `#F5F5F6` | Text on cards |
| `--popover` | `#1C1C21` | Menus (three-dot dropdown) |
| `--muted` | `#1C1C21` | Badge/pill fills, subtle row hover |
| `--muted-foreground` | `#8B8B92` | Secondary text: "Balance" label, domains, breadcrumb icon |
| `--border` | `oklch(1 0 0 / 8%)` | 1px card/panel borders, dividers — keep the existing translucent-white approach, it already matches |
| `--input` | `oklch(1 0 0 / 12%)` | (no visible input field in this screen; kept consistent for later forms) |
| `--accent` | `#232328` | Active sidebar-nav pill background |
| `--accent-foreground` | `#F5F5F6` | Active sidebar-nav text/icon |
| `--sidebar-accent` | `#232328` | Same as `--accent`, sidebar active state |
| `--primary` | `#3B82F6` | Primary actions: "Update API Key" button, "Smart Bot" badge, links |
| `--primary-foreground` | `#FFFFFF` | Text on primary buttons |
| `--secondary` | `#1F1F24` | Secondary buttons: "Connect" |
| `--secondary-foreground` | `#D4D4D8` | Text on secondary buttons |
| `--ring` | `#3B82F6` (primary, ~50% opacity) | Focus ring — see §4 |

One color the current theme has no slot for: **warning/amber**, used for the "API Keys are no
longer valid" state. Add it rather than repurposing `--destructive` (this state is a warning to
fix, not a destructive/error one):

```css
--warning: #F5A524;         /* text + icon */
--warning-foreground: #F5A524;
--warning-muted: #3A2A12;   /* ~amber at low opacity, pill background */
```

`--destructive` stays reserved for actual errors/danger actions (disconnect, delete) — not used
in this screen.

Everything else in the current `.dark` block (`--chart-*`, `--destructive`) is untouched —
this screen doesn't exercise them.

## 2. Typography

Font: **Inter Variable** for everything (already the app's `--font-sans`) — no second display
face. Weight does the differentiation, not a font swap.

| Role | Size / line-height | Weight | Color token | Example |
|---|---|---|---|---|
| Section label | 13px / 18px | 500 | `muted-foreground` | "Connected exchanges", "Available exchanges" |
| Page title | 15px / 20px | 500 | `foreground` | "Exchanges" (breadcrumb bar) |
| Nav item | 13px / 20px | 400 (500 active) | `muted-foreground` → `accent-foreground` when active | "Overview", "Exchanges" |
| Card title | 14px / 20px | 500 | `card-foreground` | "OKX", "Bybit" |
| Field label | 11px / 16px | 400 | `muted-foreground` | "Balance" |
| Balance value | 16px / 22px | 600 | `card-foreground` | "12,849.84" |
| Balance currency | 12px / 22px | 400 | `muted-foreground` | "USD" (inline after value) |
| Button / badge label | 12px / 16px | 500 | context-dependent | "Connect", "Smart Bot", "Update API Key" |
| Domain / helper text | 12px / 16px | 400 | `muted-foreground` | "binance.com" |

Apply the numeric convention from the web guidelines: `font-variant-numeric: tabular-nums` on
balance values (they're a data column even when shown one-per-card, and it stops the digits
jittering if the value updates live), and join value+currency with a non-breaking space
(`12,849.84&nbsp;USD`) so they never wrap apart.

## 3. Spacing

4px base grid, used consistently — no ad-hoc odd values:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 48` (px)

- Card internal padding: `16px`
- Grid gap (card ↔ card): `16px`
- Section-to-section vertical gap (Connected → Available): `24px`
- Main content outer padding: `24px`
- Sidebar item vertical padding: `8px`, horizontal `12px`
- Icon-to-label gap (nav items, card headers): `8px`

## 4. Radius, borders, elevation

Map onto the existing `--radius` scale in `src/styles.css` (currently `0.625rem` base) — bump
the base slightly so the derived scale lands where the screenshot shows it:

```css
--radius: 0.75rem; /* 12px — was 0.625rem */
```

This flows through the already-defined `--radius-sm/md/lg/xl/2xl/3xl/4xl` — no new radius
variables needed.

| Element | Radius token | ~px |
|---|---|---|
| Exchange card, "Available exchanges" panel | `--radius-lg` | 12px |
| Buttons, badges (rect), exchange icon tile | `--radius-md` | ~10px |
| Small icon tiles (nav icons, list icons) | `--radius-sm` | ~7px |
| Pills ("Smart Bot" badge) | full (`rounded-full`) | — |
| Avatar | full (`rounded-full`) | — |

**No drop shadows.** Elevation reads entirely from `background` contrast (`card` lighter than
`background`) plus a 1px translucent `border` — flat dark UI, not skeuomorphic. Don't add
`box-shadow` to cards; it's not in the reference and would fight the flat aesthetic. The one
non-solid border in the set is the "Smart Bot" badge, which uses a **dashed** top border to read
as a "meta" strip appended to the card rather than card content.

## 5. Components

### Sidebar nav item
- Default: icon (16px, Phosphor) + label, `muted-foreground`, transparent background, `radius-sm`.
- Hover: background `muted` at low opacity.
- Active: background `accent` (`#232328`), text/icon `accent-foreground`, full-width pill, `radius-sm`.
- Section grouping ("Portfolio") is a plain label, not a button: 11px, `muted-foreground`, no background, `4px` bottom margin before its children.

### Top bar
- Breadcrumb icon (16px, muted) + page title, single row, bottom `border`, `16px` vertical / `24px` horizontal padding.

### Section header
- Small info icon (14px circle-i, `muted-foreground`) inline after the label — implies a tooltip on hover, not a modal. Reuse this pattern for any section that needs a one-line explainer instead of adding inline help text.

### Card — connected exchange
Anatomy: icon tile (24px, `radius-sm`) + name + spacer + overflow menu (`⋮`, icon-only button,
needs `aria-label="More options"`) on the header row; `Balance` label + value row below.

Three states, same shell:
1. **Default** — as above.
2. **Bot-linked** (OKX) — dashed-top-border strip appended below the balance row containing a small icon + "Smart Bot" label in `primary` color on `muted` fill, pill radius. Use this pattern for any "this account has an automation attached" state, not just bots.
3. **Needs attention** (Huobi) — balance row is replaced by an inline warning banner (`warning` text on `warning-muted` fill, `radius-sm`, small triangle-alert icon) + a full-width `primary` button ("Update API Key") below it. Don't show a balance at all when the connection is broken — showing a stale number next to an error is misleading.

### Available-exchange row
Icon tile (24px) + name (`card-foreground`, 14px/500) + domain (`muted-foreground`, 12px)
stacked left, `secondary` "Connect" button right-aligned (or below, at narrow widths — see §6).
Rows separated by 1px `border`, not individual card shells — this list is one panel, not N cards.

### Buttons
- **Primary** (`primary` bg, white text) — one committing action per view ("Update API Key"). Needs `hover:` (slightly darker/lighter primary) and `focus-visible:ring-2 ring-primary/50`.
- **Secondary** (`secondary` bg, `secondary-foreground` text) — reversible/low-stakes actions ("Connect"). Same hover/focus treatment, lower-contrast fill.
- **Icon-only** (overflow `⋮`) — no visible bg until hover (`muted`), always `aria-label`, never rely on a tooltip alone for its accessible name.

### Badge / pill
Two flavors sharing the shape (full-round, 12px/500 label, small leading icon): `primary`-tinted
for informational/positive state (Smart Bot), `warning`-tinted for attention state. Don't add a
third color casually — new states should map to `primary` / `warning` / `destructive`, not a
one-off hue.

## 6. Responsive & accessibility

Not shown in the reference (it's a fixed desktop mock), so these are this app's floor, not
extracted from the image:

- Card grid: `grid-cols-3` at desktop, collapse to `grid-cols-2` / `grid-cols-1` before cards get narrower than ~240px.
- Sidebar collapses to icon-only or an off-canvas drawer below ~768px — don't shrink nav-item text to fit, hide the label instead.
- All interactive elements get a visible `focus-visible` ring (`ring-2 ring-ring ring-offset-2 ring-offset-background`); never `outline-none` without it.
- Icon-only buttons always carry `aria-label`.
- Respect `prefers-reduced-motion` for any hover/transition animation added later.
- Transitions list explicit properties (`transition-colors`, `transition-transform`) — never `transition: all`.

## 7. Open questions for next pass

- Light mode: not designed yet — this doc covers dark only. Decide when a screen actually needs it rather than guessing a light palette now.
- `--warning*` tokens above are new; add them to `src/styles.css` `.dark` block (and a light equivalent, once light mode exists) before using them in components.
