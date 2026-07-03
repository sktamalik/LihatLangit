---
name: LihatLangit
colors:
  surface: '#f6faff'
  surface-dim: '#d6dae0'
  surface-bright: '#f6faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4fa'
  surface-container: '#eaeef4'
  surface-container-high: '#e4e8ee'
  surface-container-highest: '#dee3e9'
  on-surface: '#171c20'
  on-surface-variant: '#3e4850'
  inverse-surface: '#2c3135'
  inverse-on-surface: '#edf1f7'
  outline: '#6e7881'
  outline-variant: '#bec8d2'
  surface-tint: '#006591'
  primary: '#006591'
  on-primary: '#ffffff'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#89ceff'
  secondary: '#396477'
  on-secondary: '#ffffff'
  secondary-container: '#bae6fd'
  on-secondary-container: '#3d687c'
  tertiary: '#8a5100'
  on-tertiary: '#ffffff'
  tertiary-container: '#de8712'
  on-tertiary-container: '#4d2b00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#bee9ff'
  secondary-fixed-dim: '#a1cde3'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#1e4c5f'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86e'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#f6faff'
  on-background: '#171c20'
  surface-variant: '#dee3e9'
  sky-surface: '#E0F2FE'
  sun-accent: '#F59E0B'
  cloud-white: '#FFFFFF'
  text-deep: '#0C4A6E'
  text-muted: '#64748B'
typography:
  display-temp:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 1.5rem
  margin-mobile: 1rem
  stack-gap: 2rem
  card-padding: 1.25rem
---

## Stitch Instructions

Get the images and code for the following Stitch project's screens:

## Project
Title: LihatLangit Soft Modern Design
ID: 11895904513898268323

## Screens:
1. LihatLangit - Animated Cloud Decor Edition
    ID: 33209e65eb33439ba8800f3fdd881a22

Use a utility like `curl -L` to download the hosted URLs.

## Brand & Style

The design system for this weather forecasting platform is centered around the concept of "Airy Modernism." It aims to evoke feelings of freedom, clarity, and peace—mirroring the experience of looking up at a clear sky. The target audience includes both the general public seeking quick updates and field workers requiring technical precision. 

The aesthetic is a blend of **Minimalism** and **Glassmorphism**. It utilizes heavy whitespace to reduce cognitive load, paired with translucent, frosted layers that suggest the layering of clouds and atmosphere. The interface remains professional and operational, avoiding unnecessary decorative clutter while using soft, organic shapes to maintain an approachable, friendly tone.

**Design Principles:**
- **Clarity over Clutter:** Prioritize meteorological data through generous margins and clear hierarchy.
- **Atmospheric Depth:** Use translucency and soft blurs to create a sense of height and "air."
- **Trustworthy Precision:** Maintain a clean, systematic look to reinforce the reliability of the official BMKG data.

## Colors

The palette is derived from the various states of the sky. The primary color is a vibrant Sky Blue, used for active states and critical highlights. The secondary and surface colors use soft, desaturated blues to create a "tinted white" environment that is easier on the eyes than pure high-contrast white.

**Usage Guidance:**
- **Primary:** Actions, progress indicators, and active navigation.
- **Sky Surface:** The main background color for the application to evoke an "airy" feel.
- **Sun Accent:** Reserved strictly for sunny weather icons, temperature peaks, or high-priority warnings.
- **Neutrals:** Use "Text Deep" for headings to maintain readability while staying within the blue-tinted family. "Text Muted" is used for secondary metadata like "fetched at" timestamps.

## Typography

This design system uses a dual-sans-serif approach. **Geist** provides a technical, precise feel for headlines, labels, and the primary temperature display, emphasizing the "data-driven" nature of the BMKG source. **Inter** is used for body text and descriptions to ensure maximum legibility across all devices.

**Hierarchy Rules:**
- **Display Temp:** Used exclusively for the current temperature in the Weather Summary.
- **Headlines:** Used for region names and daily headers.
- **Labels:** All-caps labels for metadata like "KELEMBAPAN" or "KECEPATAN ANGIN" to differentiate data points from descriptive text.
- **Mobile Scaling:** For mobile screens, `display-temp` should scale down to 48px to prevent overflow.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop to keep the dashboard focused and "app-like," centered in the viewport. On mobile, it transitions to a fluid single-column stack.

- **Desktop:** 12-column grid. The Weather Summary occupies a prominent top section or a 4-column sidebar, while the Forecast Timeline spans the remaining width.
- **Spacing Rhythm:** Based on an 8px (0.5rem) base unit. Standard component spacing is 1.5rem (24px) to maintain the "airy" feel.
- **Safe Areas:** Elements never touch the screen edge; a minimum 1rem margin is enforced on mobile.

## Elevation & Depth

Depth is conveyed through **Glassmorphism** and **Ambient Shadows**. Instead of traditional solid shadows, this system uses "Sky Shadows"—very soft, low-opacity blurs tinted with a hint of the primary blue (#0EA5E9).

**Surface Tiers:**
1.  **Background:** `sky-surface` (#E0F2FE), flat.
2.  **Base Cards:** White (#FFFFFF) with 80% opacity and a 12px backdrop blur. This creates a "cloud-like" appearance.
3.  **Floating Elements:** Search results and dropdowns use a higher elevation with a more pronounced ambient shadow to indicate they are "above" the atmosphere.
4.  **Dividers:** Use low-contrast outlines (1px solid white at 50% opacity) rather than dark lines to separate content within glass cards.

## Shapes

The shape language is "Soft-Organic." By using a **Rounded** (0.5rem) base, we avoid the harshness of sharp corners, reinforcing the friendly and safe nature of the application. 

- **Cards:** Use `rounded-xl` (1.5rem) to look like soft, pillowy clouds.
- **Buttons & Inputs:** Use `rounded-lg` (1rem) for a modern, tactile feel.
- **Decorative Elements:** Any sun or moon graphics should use perfect circles, while cloud elements should be composed of overlapping circles to maintain geometric consistency.

## Components

**Buttons:**
- **Primary:** Solid `primary_color_hex` with white text. High roundedness.
- **Ghost:** Transparent background with a `primary_color_hex` border. Used for secondary actions like "Change Region."

**Search Input:**
- Large, prominent bar with a "Glass" background. It should include a search icon and a "Locate Me" button. Results appear in a floating glass list below the input.

**Weather Cards:**
- High roundedness (1.5rem). 
- Use semi-transparent white backgrounds with backdrop-blur. 
- Icons should be the focal point, positioned top-right or center.
- Values (Temperature, etc.) use `geist` for precision.

**Timeline (Forecast):**
- Horizontal scrolling on mobile, grid on desktop.
- Each time slot is a mini-card. The "current" time slot is highlighted using a soft `secondary_color_hex` glow.

**Source Attribution:**
- Placed in the footer or bottom of cards. Small `label-sm` text. Must include the BMKG logo or a clear "Source: BMKG" text string.

**Empty State:**
- Centered illustration of a soft, stylized sun hiding behind a cloud. Large, friendly Geist heading inviting the user to "Cari wilayahmu untuk memulai."