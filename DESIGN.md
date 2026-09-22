---
version: alpha
name: BenawBara
description: Warm, earthen marketplace identity for a local Kurdish city — sun-baked sand, deep teal, and saffron accents. RTL-first (Sorani).
colors:
  primary: "#0E6B63"
  primary-hover: "#0A4F49"
  secondary: "#8B8378"
  tertiary: "#C1502E"
  accent: "#E8A23D"
  neutral: "#F6F1E4"
  neutral-2: "#EFE7D4"
  surface: "#FFFDF8"
  on-surface: "#16262B"
  on-primary: "#FFFDF8"
  error: "#C1502E"
typography:
  headline-display:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.15
  headline-md:
    fontFamily: Fraunces
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.2
  body-lg:
    fontFamily: Noto Kufi Arabic
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.7
  body-md:
    fontFamily: Noto Kufi Arabic
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.7
  body-sm:
    fontFamily: Noto Kufi Arabic
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Noto Kufi Arabic
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
  price-tag:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.0
rounded:
  none: 0px
  sm: 6px
  md: 10px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  price-tag:
    backgroundColor: "{colors.on-surface}"
    textColor: "{colors.accent}"
    typography: "{typography.price-tag}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
---

## Overview

BenawBara is a local marketplace for a Kurdish city. The identity is warm and
earthen — it should feel like a sunlit bazaar, not a cold tech app. The whole
interface is right-to-left (Sorani, Arabic script), so directional styling uses
logical properties (`start`/`end`) rather than `left`/`right`.

The mood: sun-baked sand backgrounds, deep teal for anything interactive, and a
saffron accent reserved for the signature price tag. Clay is the warning/danger
color and doubles as a secondary warm accent.

## Colors

A warm neutral foundation with one confident interaction color.

- **Primary (#0E6B63):** Deep teal. The single driver of interaction — buttons,
  links, active states. Hover deepens to `#0A4F49`.
- **Secondary (#8B8378):** Stone. Muted text, borders, metadata, placeholders.
- **Tertiary / Error (#C1502E):** Clay. Destructive actions (delete) and warm
  secondary emphasis.
- **Accent (#E8A23D):** Saffron. Reserved almost exclusively for the price tag
  text on dark ink. Use sparingly so it stays special.
- **Neutral (#F6F1E4):** Warm sand — the page background. `neutral-2` (#EFE7D4)
  is a slightly deeper sand for secondary surfaces.
- **Surface (#FFFDF8):** Near-white warm card. Sits above the sand background.
- **On-surface (#16262B):** Ink. Primary text and the price-tag background.

## Typography

Fraunces carries the Latin "BenawBara" wordmark and headings for a warm
editorial feel. Noto Kufi Arabic renders all Sorani body and UI copy cleanly at
reading sizes. IBM Plex Mono is used only for the monospace price tag.

- **headline-display / lg / md:** Fraunces, semibold, tight tracking.
- **body-lg / md / sm:** Noto Kufi Arabic, generous 1.6–1.7 line-height for
  comfortable Arabic-script reading.
- **price-tag:** IBM Plex Mono 600 — the ticket's distinctive numeric voice.

## Layout

RTL-first. Never use `left`/`right`, `pl-`/`pr-`, or `ml-`/`mr-`; use logical
`start`/`end` utilities so the layout mirrors correctly. Spacing follows an
8px-based scale (`xs` 4 → `xl` 40).

## Shapes

Rounded corners are soft but not pill-like except for chips and avatars.
Cards use `lg` (16px). Buttons and inputs use `md` (10px). Category chips and
avatars use `full`. The price tag is the one hard-edged element — a clipped
ticket notch on the inline-start edge that mirrors in RTL.

## Components

- **button-primary:** Teal background, warm-white text, `md` radius. Hover
  deepens to teal-deep.
- **price-tag:** Ink background, saffron mono text, ticket clip-path. The
  signature detail — one per card.
- **card:** Warm surface on sand, `lg` radius, ink text.

## Do's and Don'ts

- **Do** reserve saffron for the price tag. **Don't** use it for buttons or
  large fills — it loses its punch and contrast on light backgrounds is weak.
- **Do** use teal for every interactive element. **Don't** introduce a second
  interaction color.
- **Do** use logical `start`/`end` spacing. **Don't** hard-code `left`/`right` —
  it breaks RTL mirroring.
- **Do** keep ink for text on light surfaces. **Don't** put stone text on sand
  for anything important — it's for metadata only.
