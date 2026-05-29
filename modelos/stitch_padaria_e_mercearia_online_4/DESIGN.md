---
name: Artisanal Hearth
colors:
  surface: '#fefae0'
  surface-dim: '#dedbc2'
  surface-bright: '#fefae0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f4db'
  surface-container: '#f2efd5'
  surface-container-high: '#ede9cf'
  surface-container-highest: '#e7e3ca'
  on-surface: '#1d1c0d'
  on-surface-variant: '#4f4540'
  inverse-surface: '#323120'
  inverse-on-surface: '#f5f1d8'
  outline: '#81756f'
  outline-variant: '#d2c4bd'
  surface-tint: '#705a4e'
  primary: '#6d574b'
  on-primary: '#ffffff'
  primary-container: '#877063'
  on-primary-container: '#fffbff'
  inverse-primary: '#dec1b2'
  secondary: '#7d562d'
  on-secondary: '#ffffff'
  secondary-container: '#ffca98'
  on-secondary-container: '#7a532a'
  tertiary: '#5a5e43'
  on-tertiary: '#ffffff'
  tertiary-container: '#73775a'
  on-tertiary-container: '#fcffe0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fbdccd'
  primary-fixed-dim: '#dec1b2'
  on-primary-fixed: '#28180f'
  on-primary-fixed-variant: '#574237'
  secondary-fixed: '#ffdcbd'
  secondary-fixed-dim: '#f0bd8b'
  on-secondary-fixed: '#2c1600'
  on-secondary-fixed-variant: '#623f18'
  tertiary-fixed: '#e1e6c2'
  tertiary-fixed-dim: '#c5c9a7'
  on-tertiary-fixed: '#1a1d07'
  on-tertiary-fixed-variant: '#45492f'
  background: '#fefae0'
  on-background: '#1d1c0d'
  surface-variant: '#e7e3ca'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1200px
---

## Brand & Style

The brand personality of the design system is cozy, nostalgic, and deeply rooted in the community. It evokes the sensory experience of a local bakery: the warmth of a wood-fired oven, the dusting of flour on a rustic table, and the welcoming aroma of fresh sourdough. 

The design style is a blend of **Tactile Minimalism** and **Editorial Traditionalism**. It uses heavy whitespace—or rather, "cream-space"—to allow high-quality food photography to breathe. Visual elements should feel handcrafted rather than manufactured, utilizing soft edges and organic textures to create a digital environment that feels as approachable as a neighborhood storefront.

## Colors

The palette is derived directly from the artisanal nature of baking. 
- **Primary (Cocoa/Sepia):** Used for primary branding, typography, and iconography. It provides the grounded, traditional weight of the brand.
- **Secondary (Crust Gold):** A warm, toasted wheat tone used for secondary actions, accents, and highlighting key information.
- **Background (Cream/Beige):** A soft, buttery off-white that replaces harsh digital white to reduce eye strain and enhance the "cozy" feeling.
- **Functional Accents:** Success and error states should be muted (e.g., a sage green and a terracotta red) to maintain the rustic harmony of the system.

## Typography

This design system utilizes a high-contrast typographic pairing to bridge the gap between tradition and modern utility.

- **Headlines (EB Garamond):** Chosen for its classic, literary grace that mirrors the script in the provided logo. It should be used for all expressive headers to instill a sense of heritage and quality.
- **UI & Body (Be Vietnam Pro):** A contemporary sans-serif with a warm, friendly geometric construction. It ensures high readability for menus, product descriptions, and transactional interfaces.
- **Styling Note:** Use "italic" styles for EB Garamond in sub-headings to emphasize the "handmade" feel of a chalkboard menu.

## Layout & Spacing

The layout follows a **Fluid-to-Fixed Grid** model. On desktop, content is housed within a 12-column grid with a maximum width of 1200px to ensure readability and focus. 

The spacing rhythm is based on a 4px baseline, but leans towards generous padding to evoke a premium, relaxed atmosphere. 
- **Mobile:** 4-column grid, 16px margins, 16px gutters.
- **Tablet:** 8-column grid, 32px margins, 24px gutters.
- **Desktop:** 12-column grid, centered, 24px gutters.

Large-scale sections should use asymmetrical layouts—placing images of bread or cafe scenes slightly off-center—to mimic the natural, non-linear feel of a local market.

## Elevation & Depth

To maintain the rustic aesthetic, this design system avoids heavy drop shadows and harsh modern blurs. Instead, depth is achieved through:
- **Tonal Layering:** Using subtle shifts in background color (e.g., a slightly darker beige for a card against a lighter cream background).
- **Physical Borders:** Very thin, low-opacity strokes in the primary brown color (#8B7366 at 15% opacity) to define boundaries without breaking the "flat paper" feel.
- **Micro-Shadows:** For interactive elements like buttons, use a very small, soft "ambient" shadow (2px blur, 5% opacity) to suggest the object is resting on a wooden surface rather than floating in space.

## Shapes

The shape language is organic and soft. There are no sharp corners in this design system, reflecting the soft nature of dough and the rounded forms of artisanal loaves.

Standard UI elements (buttons, inputs) use a **0.5rem (8px)** radius. Larger containers, such as product cards or featured sections, utilize a **1rem (16px)** radius. Image masks can occasionally use an "organic blob" or slightly irregular rounded shape to emphasize the artisanal, non-industrial nature of the brand.

## Components

### Buttons
Primary buttons are solid cocoa brown with cream text, featuring a slightly heavier weight. Secondary buttons use a "ghost" style with a thin brown border. Hover states should involve a gentle shift to the "Crust Gold" color.

### Cards
Product cards should have a subtle cream-on-cream tonal difference. The image of the food is the hero, taking up the top 60% of the card, with the EB Garamond font used for the product name below.

### Input Fields
Forms should feel like a guestbook or a handwritten order. Use soft-rounded borders and "Be Vietnam Pro" for placeholder text. The active focus state should be a warm gold border rather than a digital blue.

### Chips & Tags
Use chips to denote categories (e.g., "Sourdough," "Gluten-Free," "Local Honey"). These should have a background of "tertiary_color_hex" with dark brown text, using a small 4px radius.

### Decorative Elements
Incorporate "wheat stalk" or "flour dusting" iconography sparingly as dividers or background watermarks to reinforce the bakery theme. Use the primary brown at very low (5-10%) opacity for these elements.