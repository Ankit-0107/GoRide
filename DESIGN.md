---
name: GoRIDE
colors:
  surface: "#0e0e0e"
  surface-dim: "#0e0e0e"
  surface-bright: "#2c2c2c"
  surface-container-lowest: "#000000"
  surface-container-low: "#131313"
  surface-container: "#1a1919"
  surface-container-high: "#201f1f"
  surface-container-highest: "#262626"
  on-surface: "#ffffff"
  on-surface-variant: "#adaaaa"
  inverse-surface: "#fcf9f8"
  inverse-on-surface: "#565555"
  outline: "#767575"
  outline-variant: "#484847"
  surface-tint: "#ff8f75"
  surface-variant: "#262626"
  primary: "#ff8f75"
  on-primary: "#5f0e00"
  primary-container: "#ff7859"
  on-primary-container: "#4a0900"
  primary-dim: "#ff7353"
  primary-fixed: "#ff7859"
  primary-fixed-dim: "#fe5d39"
  on-primary-fixed: "#000000"
  on-primary-fixed-variant: "#5b0d00"
  inverse-primary: "#b52907"
  secondary: "#f5777c"
  on-secondary: "#49000c"
  secondary-container: "#84222c"
  on-secondary-container: "#ffc1c1"
  secondary-dim: "#f5777c"
  secondary-fixed: "#ffc3c3"
  secondary-fixed-dim: "#ffafaf"
  on-secondary-fixed: "#6a0d1b"
  on-secondary-fixed-variant: "#922c35"
  tertiary: "#e6a7ff"
  on-tertiary: "#5b1979"
  tertiary-container: "#dc95fb"
  on-tertiary-container: "#50086f"
  tertiary-dim: "#ce88ec"
  tertiary-fixed: "#dc95fb"
  tertiary-fixed-dim: "#ce88ec"
  on-tertiary-fixed: "#2c0040"
  on-tertiary-fixed-variant: "#5a1778"
  error: "#ff6e84"
  on-error: "#490013"
  error-container: "#a70138"
  on-error-container: "#ffb2b9"
  error-dim: "#d73357"
  background: "#0e0e0e"
  on-background: "#ffffff"
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: "800"
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "800"
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: "700"
    lineHeight: 28px
    letterSpacing: -0.01em
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: "700"
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 16px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: "500"
    lineHeight: 14px
    letterSpacing: 0.2em
rounded:
  DEFAULT: 1rem
  sm: 0.5rem
  md: 0.75rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  card-gap: 16px
  section-gap: 32px
  bottom-nav-height: 96px
  app-bar-height: 80px
motion:
  page-enter:
    duration: 400ms
    easing: cubic-bezier(0.16, 1, 0.3, 1)
  interactive-press:
    duration: 150ms
    easing: ease-out
    transform: scale(0.95)
  hover-lift:
    duration: 300ms
    easing: ease-in-out
    transform: scale(1.01)
  expand-collapse:
    duration: 400ms
    easing: ease-in-out
  color-transition:
    duration: 300ms
    easing: ease-in-out
  image-zoom:
    duration: 700ms
    easing: ease-out
components:
  button-primary:
    backgroundColor: "linear-gradient(135deg, {colors.primary}, {colors.primary-container})"
    textColor: "#000000"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    height: 56px
    padding: 0 24px
    fontWeight: "900"
    textTransform: uppercase
    letterSpacing: 0.1em
  button-primary-hover:
    filter: brightness(1.1)
  button-primary-active:
    transform: scale(0.98)
  button-cta:
    backgroundColor: "{colors.tertiary-fixed}"
    textColor: "{colors.on-tertiary-container}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    height: 56px
    padding: 0 24px
    fontWeight: "900"
    textTransform: uppercase
  button-ghost:
    backgroundColor: "{colors.surface-container-highest}"
    textColor: "{colors.primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    fontWeight: "800"
    textTransform: uppercase
    letterSpacing: 0.1em
  button-ghost-hover:
    backgroundColor: "{colors.primary}"
    textColor: "#000000"
  button-icon:
    backgroundColor: "{colors.surface-container-high}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    width: 40px
    height: 40px
  button-danger:
    backgroundColor: rgba(167, 1, 56, 0.1)
    textColor: "{colors.error-dim}"
    rounded: "{rounded.lg}"
    borderColor: rgba(167, 1, 56, 0.2)
    borderWidth: 1px
    fontWeight: "900"
    textTransform: uppercase
  card-bento:
    backgroundColor: "{colors.surface-container-high}"
    rounded: 28px
    overflow: hidden
  card-standard:
    backgroundColor: "{colors.surface-container}"
    rounded: 28px
    padding: 20px
    borderColor: rgba(72, 72, 71, 0.1)
    borderWidth: 1px
  card-list-item:
    backgroundColor: "{colors.surface-container}"
    rounded: "{rounded.DEFAULT}"
    padding: 16px
  card-list-item-hover:
    backgroundColor: "{colors.surface-bright}"
  input-field:
    backgroundColor: rgba(44, 44, 44, 0.4)
    textColor: "{colors.on-surface}"
    placeholderColor: rgba(72, 72, 71, 1)
    typography: "{typography.body-lg}"
    rounded: 12px
    padding: 16px 24px
    backdropFilter: blur(8px)
    borderWidth: 0
    focusRingColor: rgba(255, 143, 117, 0.5)
    focusRingWidth: 2px
  input-search:
    backgroundColor: "{colors.surface-container-highest}"
    textColor: "{colors.on-surface}"
    placeholderColor: "{colors.on-surface-variant}"
    rounded: "{rounded.full}"
    padding: 16px 24px 16px 48px
  bottom-nav:
    backgroundColor: rgba(44, 44, 44, 0.6)
    rounded: 48px 48px 0 0
    backdropFilter: blur(24px)
    shadow: 0px -24px 48px rgba(255, 143, 117, 0.08)
  bottom-nav-item-active:
    backgroundColor: "linear-gradient(135deg, {colors.primary}, {colors.primary-container})"
    textColor: "#000000"
    rounded: "{rounded.full}"
  bottom-nav-item-inactive:
    textColor: "{colors.on-surface-variant}"
  top-app-bar:
    backgroundColor: rgba(14, 14, 14, 0.8)
    backdropFilter: blur(24px)
    height: 80px
  chip-active:
    backgroundColor: "linear-gradient(135deg, {colors.primary}, {colors.primary-container})"
    textColor: "#000000"
    rounded: "{rounded.full}"
    fontWeight: "600"
    padding: 8px 24px
  chip-inactive:
    backgroundColor: "{colors.surface-container-highest}"
    textColor: "{colors.on-surface-variant}"
    rounded: "{rounded.full}"
    fontWeight: "500"
    padding: 8px 24px
  chip-inactive-hover:
    backgroundColor: "{colors.surface-bright}"
  auth-toggle:
    backgroundColor: rgba(44, 44, 44, 0.4)
    rounded: "{rounded.full}"
    backdropFilter: blur(24px)
    borderColor: rgba(255, 255, 255, 0.1)
    borderWidth: 1px
    padding: 6px
  fab:
    backgroundColor: "linear-gradient(135deg, {colors.primary}, {colors.primary-container})"
    textColor: "#000000"
    rounded: "{rounded.full}"
    width: 56px
    height: 56px
    shadow: 0px 24px 48px rgba(255, 143, 117, 0.2)
  badge-status:
    textColor: "{colors.primary}"
    backgroundColor: rgba(255, 143, 117, 0.2)
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    fontWeight: "700"
    textTransform: uppercase
  modal-overlay:
    backgroundColor: rgba(0, 0, 0, 0.7)
    backdropFilter: blur(4px)
  modal-container:
    backgroundColor: "{colors.surface-container}"
    rounded: 28px
    padding: 32px
    borderColor: rgba(72, 72, 71, 0.3)
    borderWidth: 1px
  toast:
    backgroundColor: "{colors.surface-container}"
    borderColor: rgba(255, 143, 117, 0.3)
    borderWidth: 1px
    rounded: 12px
    padding: 12px 24px
  avatar-sm:
    width: 24px
    height: 24px
    rounded: "{rounded.full}"
  avatar-md:
    width: 40px
    height: 40px
    rounded: "{rounded.full}"
  avatar-lg:
    width: 128px
    height: 128px
    rounded: "{rounded.full}"
  divider:
    color: rgba(255, 255, 255, 0.1)
    height: 1px
  spinner:
    borderColor: "{colors.primary}"
    borderTopColor: transparent
    borderWidth: 4px
    width: 32px
    height: 32px
    rounded: "{rounded.full}"
---

## Brand & Style

GoRIDE is a community-driven cycling companion app that combines ride coordination, real-time GPS tracking, community chat, and gamified campaigns into a single mobile-first experience. The design system is built around **"Performance Noir"** — an ultra-dark aesthetic that evokes the focus and intensity of nighttime cycling while using vivid accent colors that recall brake lights, sunset horizons, and the warm afterglow of a completed ride.

The brand personality is **bold, athletic, and community-oriented**. Every typographic choice, from the uppercase tracking on labels to the extra-bold headline weights, channels the graphic language of modern sportswear and performance brands. The UI deliberately feels like a high-end cycling computer display — information-dense yet surgically organized, with generous negative space to prevent cognitive overload during quick glances.

## Colors

The palette operates on a **"dark canvas, warm signal"** principle. The background layers are composed of pure blacks through charcoal grays, creating a layered depth stack that never competes with content. Against this canvas, a carefully calibrated warm accent system draws the eye precisely where it needs to go.

- **Primary Accent (Coral Flame `#ff8f75`):** The hero color — a warm, slightly desaturated coral that sits between orange and salmon. It drives all calls-to-action, active navigation states, interactive link text, and the iconic gradient that appears on the bottom navbar's active pill and primary buttons. Its warmth prevents the dark interface from feeling cold or sterile.
- **Primary Gradient:** The primary CTA gradient runs from Coral Flame (`#ff8f75`) through Ember (`#ff7859`) to Hot Orange (`#fe5d39`), producing a bottom-right directional sweep that adds dimensionality to flat button surfaces.
- **Secondary (Rose Blush `#f5777c`):** A cooler, pinker counterpart to the primary, used sparingly for "upcoming" ride badges and secondary contextual highlights. It provides visual variety without breaking the warm palette.
- **Tertiary (Lavender Glow `#e6a7ff` / `#dc95fb`):** A distinct purple-violet accent used for the main CTA button on authentication screens, admin panel icons, and premium feature callouts. This deliberate departure from the warm spectrum signals "special" or "elevated" interactions.
- **Surface Stack:** Five gray tones from absolute black (`#000000`) through charcoal (`#262626`) create the elevation system. Cards sit on `surface-container` (`#1a1919`), hover states elevate to `surface-bright` (`#2c2c2c`), and subtle `outline-variant` (`#484847`) borders at 5–20% opacity define container edges without introducing visual noise.
- **Muted Text (`#adaaaa`):** A warm-tinted mid-gray used for all secondary text, timestamps, metadata, and inactive navigation labels. It intentionally avoids cool blue-grays to maintain palette cohesion.
- **Error & Danger:** Error red (`#ff6e84`) and deep crimson container (`#a70138`) are used exclusively for destructive actions and validation errors, always paired with 10–20% opacity backgrounds to prevent alarm fatigue.
- **Text Selection:** Selected text uses `#ff8f75` background with `#5f0e00` text — a direct inversion of the primary accent, keeping the brand visible even in micro-interactions.

## Typography

The type system pairs two complementary sans-serif families to create a clear functional hierarchy.

- **Plus Jakarta Sans (Headlines):** Used for all display text, section titles, card headings, stat numbers, and the brand wordmark. Its rounded terminals and geometric proportions feel approachable and sporty without sacrificing legibility. Weights range from Bold (700) for section labels to Extra-Bold (800) for hero headlines. Negative letter-spacing (−0.01em to −0.02em) at display sizes creates a tight, athletic aesthetic.
- **Inter (Body & Labels):** The workhorse family for all body copy, metadata, button labels, navigation text, and form inputs. At label-sm size (10px), it is rendered in all-caps with extended letter-spacing (0.2em) to create the distinctive "instrument panel" labeling visible throughout the app. This treatment transforms mundane UI labels ("UPCOMING", "DISTANCE", "CREATED BY") into design elements that reinforce the premium performance identity.
- **Material Symbols Outlined:** Google's variable icon font is used exclusively for all iconography. Icons share the Coral Flame primary color on interactive elements and inherit `on-surface-variant` gray in passive contexts. The `'FILL' 1` variation setting is applied to active/selected icon states, creating a clear filled/outlined semantic distinction.

## Layout & Spacing

The layout is **mobile-first and single-column**, optimized for one-handed use on handheld devices. Content is constrained to a `max-w-xl` (576px) container on larger screens, ensuring the app never stretches awkwardly on tablets or desktops.

- **Grid:** An 8px base unit governs all spacing. Container padding is 24px, card internal padding is 20px, and gaps between sibling cards use 16px.
- **Scrolling Regions:** Horizontal scroll areas (filter chips, partner offers, campaign lists) are full-bleed, extending to the edge of the viewport with negative margins (`-mx-6 px-6`) to create a "peek" effect that invites lateral swiping. All scrollbars are visually hidden.
- **Vertical Rhythm:** Sections are separated by 32px (`space-y-8`). The bottom navigation bar demands a `pb-32` (128px) clearance on all page content to prevent occlusion.
- **Fixed Chrome:** The top app bar (80px) and bottom navigation bar are both position-fixed with high z-index values (40–50), creating a persistent interaction frame. Both use `backdrop-blur-xl` (24px blur radius) over semi-transparent backgrounds, allowing content to scroll beneath while maintaining context.

## Elevation & Depth

Depth in GoRIDE is not expressed through traditional drop shadows. Instead, the system uses a **"Tonal Layer Stack"** where each elevation level is a slightly lighter shade of dark gray, combined with controlled translucency and blur effects.

- **Level 0 (Canvas):** Pure black (`#000000`) or near-black (`#0e0e0e`). The deepest background.
- **Level 1 (Container):** `surface-container` (`#1a1919`). Standard cards and list items rest here.
- **Level 2 (Elevated):** `surface-container-high` (`#201f1f`). Used for bento cards and interactive containers.
- **Level 3 (Bright):** `surface-bright` (`#2c2c2c`). Hover states and the bottom navigation background at 60% opacity.
- **Frosted Glass:** The bottom navbar, top app bar, and auth toggle controls use `backdrop-filter: blur(24px)` over 60–80% opacity backgrounds, creating a frosted-glass effect that separates navigation chrome from scrolling content.
- **Glow Shadows:** The bottom navbar's signature shadow (`0px -24px 48px rgba(255,143,117,0.08)`) casts a subtle upward coral glow, creating the impression that the navigation is lit from within. Primary CTA buttons use `shadow-lg` with primary-tinted opacity for a similar "warm light" effect.
- **Border Definition:** Container edges are defined by 1px borders at `outline-variant` (`#484847`) with very low opacity (5–20%). This technique provides structure without creating hard visual boundaries.

## Shapes

The shape language follows a **"Super-Round"** strategy that echoes the organic curves of cycling helmets and wheels.

- **Cards (28px radius):** All primary content cards use a generous 28px border radius, creating soft, lozenge-like containers. This is the most distinctive shape element in the system.
- **Action Buttons (Full pill):** Primary CTAs, filter chips, and the bottom navbar's active indicator use `rounded-full` (9999px), creating pure pill/capsule shapes.
- **Icon Buttons (Circular):** 40px or 56px circles for notification bells, social login buttons, and FABs.
- **Inputs (12px radius):** Form fields use a more restrained 12px radius to maintain a structured feel in data-entry contexts, creating a subtle distinction between "reading" surfaces (28px) and "writing" surfaces (12px).
- **Maps & Media (24px radius):** Map containers and image cards use 24px radius, sitting between the generosity of content cards and the discipline of form fields.
- **Badges (Full pill):** Status badges, partner tags, and category labels are full-pill with minimal padding, creating compact, chip-like elements.

### Bottom Navigation

The bottom navbar is the app's most distinctive UI element. It floats above content with a `48px` top border radius, frosted-glass backdrop, and a signature upward coral glow shadow. The active tab indicator is a gradient-filled pill (`from-[#ff8f75] to-[#ff7859]`) with filled icon and 10px uppercase Inter label, while inactive tabs use `#adaaaa` outline icons. All tabs respond to press with `scale(0.9)` at 150ms, creating snappy tactile feedback.

### Bento Cards

The recommended ride card on the Home page uses a "bento" layout — a wide card with content on the left and a bleed-edge image on the right (1/3 width). The image uses a `scale(1.1)` transform that eases to `scale(1.0)` on group hover over 700ms, creating a subtle "breathing" parallax effect. A directional gradient overlay (`from-surface-container-high to-transparent`) ensures text remains legible against the image.

### Auth Screens

Login and Register share a full-bleed background photo with a bottom-heavy gradient overlay (`from-[#0e0e0e]/40 to-[#0e0e0e]/95`). This creates a cinematic "hero image" effect at the top that fades into solid dark at the bottom where form controls live. A page-enter animation (`translateY(12px) → 0, opacity 0 → 1` at 400ms) provides a polished introduction.

### Interactive Feedback

- **Button Press:** `scale(0.95–0.98)` transform with 150ms ease-out.
- **Card Hover:** `scale(1.01)` lift with 300ms ease-in-out.
- **Group Hover (Chevrons):** List item trailing chevrons translate `+4px` right on group hover, creating a directional "go" cue.
- **Focus Rings:** Form inputs show a 2px ring in `rgba(255, 143, 117, 0.5)` on focus, using the primary color at half opacity to maintain the warm palette.
- **Image Hover (Bento):** Background images scale from 1.1 to 1.0 over 700ms, providing a cinematic slow-zoom reversal on interaction.

### Profile & Stats

Profile pages use a floating glow effect behind the user's avatar — a `blur-3xl` element with `primary/20` opacity scaled to 150%, creating a soft halo. Stats are presented in a horizontally divided row inside a 28px-radius container, with vertical `1px` dividers at `outline-variant/30` separating metrics. Achievement badges live in square aspect-ratio cards (128px) that scroll horizontally.

### Admin Panel

The admin panel differentiates itself with a border-bottom header separator (`border-white/5`) not used in consumer pages, and a fixed sub-navigation bar with gradient-active chips identical to the category filter pattern. Dashboard stats use a 3-column grid with color-coded icons: Coral for users, Lavender for rides, Rose for messages — maintaining the triadic accent system.
