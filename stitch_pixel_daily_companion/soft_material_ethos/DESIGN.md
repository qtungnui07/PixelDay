---
name: Soft Material Ethos
colors:
  surface: '#fcf8fa'
  surface-dim: '#ddd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f2f5'
  surface-container: '#f1edef'
  surface-container-high: '#ebe7e9'
  surface-container-highest: '#e5e1e4'
  on-surface: '#1c1b1d'
  on-surface-variant: '#47464d'
  inverse-surface: '#313032'
  inverse-on-surface: '#f4f0f2'
  outline: '#78767d'
  outline-variant: '#c9c5cd'
  surface-tint: '#5e5c75'
  primary: '#5e5c75'
  on-primary: '#ffffff'
  primary-container: '#e6e1ff'
  on-primary-container: '#66637c'
  inverse-primary: '#c8c3e0'
  secondary: '#426651'
  on-secondary: '#ffffff'
  secondary-container: '#c3ecd2'
  on-secondary-container: '#486c57'
  tertiary: '#6e5a50'
  on-tertiary: '#ffffff'
  tertiary-container: '#fadfd1'
  on-tertiary-container: '#756156'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4dffd'
  primary-fixed-dim: '#c8c3e0'
  on-primary-fixed: '#1b192e'
  on-primary-fixed-variant: '#46445c'
  secondary-fixed: '#c3ecd2'
  secondary-fixed-dim: '#a8d0b6'
  on-secondary-fixed: '#002112'
  on-secondary-fixed-variant: '#2a4e3a'
  tertiary-fixed: '#f8ddcf'
  tertiary-fixed-dim: '#dbc1b4'
  on-tertiary-fixed: '#261810'
  on-tertiary-fixed-variant: '#554339'
  background: '#fcf8fa'
  on-background: '#1c1b1d'
  surface-variant: '#e5e1e4'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.5px
  label-md:
    fontFamily: Outfit
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  stack-gap-sm: 12px
  stack-gap-md: 20px
  stack-gap-lg: 32px
  grid-gutter: 16px
---

## Brand & Style

This design system is built on the principles of **Modern Material Minimalism**, heavily inspired by the organic, user-centric aesthetics of Google's Pixel ecosystem. The brand personality is calm, friendly, and inherently helpful, acting as a gentle companion to the user's daily life.

The visual style prioritizes **airiness and breathability**. By utilizing a "Soft Pastel" palette and expansive whitespace, the UI reduces cognitive load and creates an emotional response of tranquility and focus. High-quality typography and massive corner radii replace harsh dividers, leaning into a tactile, friendly aesthetic that feels approachable rather than industrial. 

The primary language for all labels and instructional text is **Vietnamese**, ensuring the system feels locally relevant and welcoming.

## Colors

The palette is a curated selection of "Dynamic Pastels" that harmonize naturally. 

- **Primary (Lavender):** Used for key interaction states, active navigation icons, and primary buttons.
- **Secondary (Mint Green):** Used for success states, productivity tracking, or secondary categories.
- **Tertiary & Quaternary (Peach/Blue):** Used for decorative accents, card backgrounds, or distinguishing between different content types (e.g., events vs. tasks).
- **Surface:** The background is a crisp off-white (#F9F9FB), providing a clean canvas that makes the pastels pop without harsh contrast.

Avoid high-saturation gradients. Color should be applied in flat, solid blocks or very soft, large-scale blurs to maintain the airy atmosphere.

## Typography

The typography uses **Outfit**, a geometric sans-serif that strikes a perfect balance between professional clarity and friendly roundness. 

**Hierarchical Rules:**
- **Headlines:** Use Bold or Semi-Bold weights with tight letter spacing for a modern, "editorial" feel.
- **Body Text:** Use Regular weight with generous line height (150% of font size) to enhance readability and contribute to the "airy" atmosphere.
- **Labels:** Use Medium or Semi-Bold in all-caps or sentence case for categorizing items like chips or table headers.
- **Vietnamese Diacritics:** Ensure line heights are sufficient to prevent diacritics from touching the lines of text above or below.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid with Safe Zones**. 

- **Desktop:** 12-column grid, max-width 1280px, centered.
- **Mobile:** 4-column grid with 24px side margins to allow the UI "breathe" against the physical edges of the device.

Spacing is strictly based on a 4px baseline, but defaults to larger increments (12, 20, 32) to reinforce the spacious aesthetic. Elements should never feel cramped; when in doubt, increase the `stack-gap`. Content cards should use internal padding of at least 20px to maintain their soft, pillow-like appearance.

## Elevation & Depth

This design system avoids heavy shadows. Depth is primarily communicated through **Tonal Layering** and **Soft Ambient Occlusion**.

- **Level 0 (Base):** Off-white background (#F9F9FB).
- **Level 1 (Cards):** Pure white (#FFFFFF) surfaces with a very soft, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.04)).
- **Level 2 (Interaction):** Elements like active buttons or FABs (Floating Action Buttons) use a slightly deeper shadow or a subtle inner glow to appear "pressed" or "floating."

Shadows should never be pure black; they should be tinted with a hint of the primary lavender or a neutral cool grey to maintain the clean, "Pixel-like" aesthetic.

## Shapes

The shape language is the defining characteristic of this system. It is **hyper-rounded and organic**.

- **Large Cards:** Use a 24px to 32px corner radius.
- **Buttons & Input Fields:** Use "Pill" shapes (fully rounded ends) to make interaction points feel safe and inviting.
- **Selection Controls:** Checkboxes and Radio buttons should also follow this trend, with checkboxes using a softened 8px radius rather than sharp corners.

This extreme roundedness mirrors modern mobile OS trends and removes any "aggressive" or "technical" feeling from the interface.

## Components

### Buttons
- **Primary:** Pill-shaped, Lavender (#E6E1FF) background with Dark Lavender text.
- **Secondary:** Pill-shaped, Mint Green (#D1FADF) background.
- **Ghost:** No background, Medium weight text in Primary color.

### Cards
- Always white (#FFFFFF) with a 24px-32px radius.
- Internal padding: 20px - 24px.
- Use subtle pastel headers (e.g., a Peach header bar inside the white card) for categorization.

### Chips (Labels)
- Pill-shaped, small scale. 
- Use the quaternary pastel colors (Blue/Peach) for background with dark-tone text of the same hue for high legibility and low visual noise.

### Inputs
- Fully rounded (pill) containers. 
- 1px border in a very light neutral, becoming a 2px Primary Lavender border on focus.
- Placeholder text in `text_secondary`.

### Navigation
- **Bottom Bar:** Use thick, pill-shaped indicators behind active icons (Material You style).
- **Top Bar:** Large typography titles, left-aligned, with a transparent background that blends into the main surface.