# 🏛️ Tmleen Internal Directive: Visual Identity v2.0 Migration
**To:** Frontend Development Division, Design Division
**From:** System Architect (Gawad)
**Project Location:** `D:\tmleen`

## 🎯 Objective
Transform the entire project UI into the "v2.0 Premium Identity". Remove all "AI-generated" visual signatures (gradients, blurs, excessive animations) and replace them with a bespoke, solid, corporate-grade aesthetic.

## 🛠️ Implementation Specs (Reference: Brand Identity v2.0)

### 1. Color Palette (Strict Enforcement)
- **Ink (#1A1A1A):** All primary text, headings, and primary buttons.
- **Surface (#FFFFFF):** All primary backgrounds and card surfaces.
- **Accent (#2563EB):** Only for links, active nav states, and success indicators.
- **Subtle (#F9FAFB):** For secondary section backgrounds and input fields.
- **Muted (#6B7280):** For secondary text and captions.
- **Border (#E5E7EB):** For all 1px borders.

### 2. Component Cleanup
- **Corner Radius:** Standardize to `8px` (md) or `12px` (lg). Remove `rounded-full` from action buttons.
- **Shadows:** Remove `shadow-xl/2xl`. Use `1px` borders instead.
- **Gradients/Glass:** Delete all `bg-gradient-to`, `backdrop-blur`, and `bg-opacity`.

### 3. Motion & Tone
- **Animations:** Remove all `framer-motion` entry effects. Use standard, near-instant transitions.
- **Copy:** Change marketing "fluff" to direct, action-oriented language.

## 👥 Assigned Workforce (The Agency)
1. **Frontend Developer:** Execute code replacements in `/app` and `/components`.
2. **Brand Guardian:** Ensure total alignment with v2.0 specs during migration.
3. **Reality Checker:** Verify the "Anti-AI" feel and performance across pages.

---
**Status:** Directive Issued. Execution starting on local directory `D:\tmleen`.
