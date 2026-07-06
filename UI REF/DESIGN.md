---
name: Obscura VPN Landing Page
description: Hybrid design system combining a modern clean SaaS layout with nostalgic
  retro 8-bit/pixel elements.
colors:
  primary: '#FF5A22'
  background: '#E2F0F9'
  surface: '#FFFFFF'
  footer-dark: '#5A3714'
  grass-green: '#22C55E'
  text-primary: '#111827'
  text-secondary: '#6B7280'
  accent-blue: '#3B82F6'
  semantic-success: '#22C55E'
  surface-dim: '#f1d4cc'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ed'
  surface-container: '#ffe9e3'
  surface-container-high: '#ffe2da'
  surface-container-highest: '#f9dcd4'
  on-surface: '#271813'
  on-surface-variant: '#5b4039'
  inverse-surface: '#3e2c27'
  inverse-on-surface: '#ffede8'
  outline: '#8f7067'
  outline-variant: '#e4beb4'
  surface-tint: '#ae3100'
  on-primary: '#ffffff'
  primary-container: '#ff5a22'
  on-primary-container: '#551300'
  inverse-primary: '#ffb59f'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#00658f'
  on-tertiary: '#ffffff'
  tertiary-container: '#009cda'
  on-tertiary-container: '#002f45'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#852300'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#c7e7ff'
  tertiary-fixed-dim: '#85cfff'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6c'
  on-background: '#271813'
  surface-variant: '#f9dcd4'
  background-sky: '#E2F0F9'
  footer-earth: '#5A3714'
  text-dark: '#111827'
  text-muted: '#6B7280'
typography:
  display-pixel:
    fontFamily: monospace / Pixel Display Font
    fontWeight: 700
    letterSpacing: 0em
    textTransform: none
  body-sans:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  display-lg:
    fontFamily: spaceMono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: spaceMono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: spaceMono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: spaceMono
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.4'
  body-lg:
    fontFamily: inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  none: 0px
  DEFAULT: 0.5rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  card-padding: 32px
  section-gap: 96px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface}'
    rounded: '{rounded.md}'
    fontWeight: 600
  card-feature:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.lg}'
    padding: '{spacing.card-padding}'
    boxShadow: 0 4px 12px rgba(0,0,0,0.03)
---

## Overview
Desain ini secara sengaja membenturkan dua dunia: struktur tata letak SaaS modern yang super bersih, efisien, dan kaya akan *whitespace*, dengan elemen visual *retro 8-bit pixel art*. Kontras estetika ini bertujuan untuk menarik perhatian kelompok pengguna komputer tingkat lanjut (*tech-savvy*), komunitas *crypto*, serta para pegiat privasi digital dengan menghadirkan aura nostalgia berbalut fungsionalitas modern yang kokoh.
## Colors
- **Primary Orange (`#FF5A22`)**: Digunakan secara eksklusif untuk elemen aksi utama (CTA), sorotan kata kunci penting pada *heading*, serta komponen ikon fitur.
- **Background Sky Blue (`#E2F0F9`)**: Menjadi kanvas utama halaman web guna menghadirkan atmosfer yang lapang (*airy*) sekaligus menyatu secara natural dengan ilustrasi awan pixel art.
- **Footer Dirt Brown (`#5A3714`)**: Berfungsi sebagai landasan tanah bergaya blok game retro di bagian terbawah halaman, menciptakan penutup visual yang solid.
## Typography
Sistem tipografi diatur menggunakan aturan dikotomi yang ketat:
1. **Pixel Font Family**: Diterapkan hanya untuk elemen judul besar (H1, H2, H3) untuk membangun identitas visual *brand*.
2. **Geometric Sans-Serif (Inter)**: Diterapkan pada seluruh komponen navigasi, deskripsi panjang, teks di dalam kartu, serta replika antarmuka aplikasi demi menjaga tingkat keterbacaan (*readability*) agar tetap maksimal sesuai standar kenyamanan mata.
## Spacing & Layout
Mengadopsi sistem grid berbasis kelipatan **8px**. *Section-to-section margin* sengaja dibuat sangat renggang (~96px hingga ~120px) guna memberikan efek bernapas bagi mata serta ruang yang ideal bagi ilustrasi piksel agar tidak mengganggu fokus alur informasi produk.
## Shapes & Elevation
- Elemen fungsional modern (seperti kartu fitur dan replika aplikasi) menggunakan lekukan sudut melingkar yang halus (**16px radius**) dikombinasikan dengan bayangan halus (*subtle shadow*) untuk menciptakan ilusi kedalaman (*depth*).
- Sebaliknya, elemen berbasis piksel tradisional (seperti bagian transisi rumput di area footer) menggunakan garis lurus bersudut tajam (**0px radius**) demi mempertahankan otentisitas gaya visual 8-bit.
## Rules to Never Break
- Jangan pernah memberikan efek bayangan (*shadow*) pada teks atau komponen berwujud *pixel art*. Elemen piksel harus disajikan secara *flat* murni.
- Pastikan tingkat kontras teks putih di atas latar belakang cokelat tua (`#5A3714`) pada bagian footer memenuhi batas kelayakan minimum **WCAG AAA** demi aksesibilitas yang optimal.
- Komponen replika aplikasi macOS harus dibuat melayang menggunakan bayangan yang cukup tebal (*deep drop-shadow*) agar terpisah secara visual dari latar belakang langit biru.