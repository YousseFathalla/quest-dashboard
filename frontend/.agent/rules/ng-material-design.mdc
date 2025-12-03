---
trigger: glob
globs: "**/*.html, **/*.scss, **/*.css"
---

# Angular Material M3: Implementation Standards & Best Practices

**Context:** Angular v21 | Material Design 3 (M3)
**Role:** Senior Front-End Architect / AI Coding Assistant
**Objective:** Produce clean, efficient, and native-first code.
**Constraint:** NEVER apply utility classes to standard Angular Material components. Rely exclusively on their internal theming.

**Version:** Angular Material M3 (v18+)
**Purpose:** A definitive guide for AI Agents and Developers on using system tokens and utility classes correctly without overwriting native component styles.

---

## 1. CRITICAL: Clean Code & Usage Rules

### Rule #1: Do NOT apply utility classes to standard components

Angular Material components (`mat-button`, `mat-card`, etc.) automatically consume the correct theme tokens.

* **❌ Wrong:** `<button mat-flat-button class="mat-bg-primary">Save</button>`
* **✅ Right:** `<button mat-flat-button>Save</button>`

### Rule #2: Do NOT apply text classes to standard content

The application root (`body`) is globally styled with the default Surface background and On-Surface text color.

* **Context:**

    ```css
    body {
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
    }
    ```

* **❌ Wrong:** `<p class="mat-text-on-surface">Hello World</p>` (Redundant)
* **✅ Right:** `<p>Hello World</p>` (Inherits automatically)

*Only apply text utility classes when explicitly changing the context (e.g., text inside a colored container) or emphasis (e.g., error/primary text).*

---

## 2. Implementation Approaches

There are two valid ways to consume the system theme for **custom** elements. Both support automatic Light/Dark modes via the CSS `color-scheme` property.

1. **CSS Variables (Theming API):** Included via `mat.theme()`. Use inside component stylesheets.
    * *Prefix:* `--mat-sys-*`
2. **Utility Classes (System Classes):** Included via `mat.system-classes()`. Use directly in HTML templates.
    * *Prefix:* `.mat-*`

---

## 3. Color System & Backgrounds

**Accessibility Rule:** If you manually change the background using a class below, you **MUST** update the text color inside it to match the corresponding "On" token.

### Background Utility Classes

| Utility Class | CSS Variable | Usage Context |
| :--- | :--- | :--- |
| `.mat-bg-primary` | `--mat-sys-primary` | **High Emphasis.** Key custom actions. Pair with `on-primary`. |
| `.mat-bg-primary-container` | `--mat-sys-primary-container` | **Medium Emphasis.** Floating elements. Pair with `on-primary-container`. |
| `.mat-bg-secondary` | `--mat-sys-secondary` | **Medium Emphasis.** Custom tags/pills. Pair with `on-secondary`. |
| `.mat-bg-secondary-container` | `--mat-sys-secondary-container` | **Low Emphasis.** Selection states. Pair with `on-secondary-container`. |
| `.mat-bg-error` | `--mat-sys-error` | **Critical.** Custom error alerts. Pair with `on-error`. |
| `.mat-bg-surface` | `--mat-sys-surface` | **Base.** General app background. |
| `.mat-bg-surface-variant` | `--mat-sys-surface-variant` | **Distinction.** Form wrappers, distinct sections. |
| `.mat-bg-inverse-surface` | `--mat-sys-inverse-surface` | **Contrast.** Dark tooltips on light mode. Pair with `inverse-on-surface`. |

### Surface Container Levels

Used to create visual depth in custom layouts (e.g., sidebars, dashboards).

| Utility Class | CSS Variable | Usage Example |
| :--- | :--- | :--- |
| `.mat-bg-surface-container-lowest` | `--mat-sys-surface-container-lowest` | Lowest emphasis. |
| `.mat-bg-surface-container-low` | `--mat-sys-surface-container-low` | Custom bottom panels. |
| `.mat-bg-surface-container` | `--mat-sys-surface-container` | Custom sidebars/drawers. |
| `.mat-bg-surface-container-high` | `--mat-sys-surface-container-high` | Custom modal-like areas. |
| `.mat-bg-surface-container-highest` | `--mat-sys-surface-container-highest` | Highest emphasis. |

---

## 4. Text & Content Styling

**Usage:** Only use these classes when the background context changes (e.g., white text on a blue primary box) or to emphasize text (e.g., red error message).

| Utility Class | CSS Variable | Context / Background |
| :--- | :--- | :--- |
| `.mat-text-primary` | `--mat-sys-primary` | **Stand out.** Headings or active links. |
| `.mat-text-secondary` | `--mat-sys-secondary` | **Standard.** Body text (if not inherited). |
| `.mat-text-error` | `--mat-sys-error` | **Issues.** Custom validation text. |
| `.mat-text-on-primary` | `--mat-sys-on-primary` | Text ON `.mat-bg-primary`. |
| `.mat-text-on-primary-container`| `--mat-sys-on-primary-container` | Text ON `.mat-bg-primary-container`. |
| `.mat-text-on-secondary` | `--mat-sys-on-secondary` | Text ON `.mat-bg-secondary`. |
| `.mat-text-on-secondary-container`| `--mat-sys-on-secondary-container` | Text ON `.mat-bg-secondary-container`. |
| `.mat-text-on-surface` | `--mat-sys-on-surface` | Text ON `.mat-bg-surface`. |
| `.mat-text-on-surface-variant` | `--mat-sys-on-surface-variant` | **Low Emphasis.** Hints, timestamps, metadata. |

---

## 5. Typography

Material Design 5 categories. Each has **Small (sm), Medium (md), Large (lg)**.

| Category | Size | Utility Class | Usage |
| :--- | :--- | :--- | :--- |
| **Body** | Sm/Md/Lg | `.mat-font-body-*` | Reading text. Md is default. |
| **Display** | Sm/Md/Lg | `.mat-font-display-*` | Hero headers, large numbers. |
| **Headline**| Sm/Md/Lg | `.mat-font-headline-*` | Section or Page titles. |
| **Label** | Sm/Md/Lg | `.mat-font-label-*` | Text inside buttons or badged areas. |
| **Title** | Sm/Md/Lg | `.mat-font-title-*` | Card titles, subsection headers. |

---

## 6. Shape (Border Radius)

Defines the roundness of custom components.

| Utility Class | CSS Variable | Radius | Usage |
| :--- | :--- | :--- | :--- |
| `.mat-corner-xs` | `--mat-sys-corner-extra-small` | ~4px | Custom tooltips. |
| `.mat-corner-sm` | `--mat-sys-corner-small` | ~8px | Custom inputs/text fields. |
| `.mat-corner-md` | `--mat-sys-corner-medium` | ~12px | Custom cards. |
| `.mat-corner-lg` | `--mat-sys-corner-large` | ~16px | Large custom containers/FABs. |
| `.mat-corner-xl` | `--mat-sys-corner-extra-large` | ~28px | Modal dialogs. |
| `.mat-corner-full`| `--mat-sys-corner-full` | 50% | Circular avatars/badges. |

---

## 7. Elevation (Shadows) & Borders

| Utility Class | CSS Variable | Description |
| :--- | :--- | :--- |
| `.mat-border` | `--mat-sys-outline` | Standard outline color. |
| `.mat-border-subtle`| `--mat-sys-outline-variant` | Subtle divider lines. |
| `.mat-shadow-1` | `--mat-sys-level1` | Slight raise (Card). |
| `.mat-shadow-2` | `--mat-sys-level2` | Moderate raise (Dropdown). |
| `.mat-shadow-3` | `--mat-sys-level3` | Significant raise (Floating element). |
| `.mat-shadow-4` | `--mat-sys-level4` | Hover state. |
| `.mat-shadow-5` | `--mat-sys-level5` | Max raise (Modal/Drag). |

---

## 8. Full Token Reference (Advanced Custom CSS)

Use these variables only when creating highly specific custom components in SCSS/CSS.

**Primary:** `--mat-sys-primary`, `--mat-sys-on-primary`, `--mat-sys-primary-container`, `--mat-sys-on-primary-container`, `--mat-sys-inverse-primary`
**Secondary:** `--mat-sys-secondary`, `--mat-sys-on-secondary`, `--mat-sys-secondary-container`, `--mat-sys-on-secondary-container`
**Tertiary:** `--mat-sys-tertiary`, `--mat-sys-on-tertiary`, `--mat-sys-tertiary-container`, `--mat-sys-on-tertiary-container`
**Error:** `--mat-sys-error`, `--mat-sys-on-error`, `--mat-sys-error-container`, `--mat-sys-on-error-container`
**Surface:** `--mat-sys-surface`, `--mat-sys-on-surface`, `--mat-sys-surface-variant`, `--mat-sys-on-surface-variant`, `--mat-sys-inverse-surface`, `--mat-sys-inverse-on-surface`
**Outline:** `--mat-sys-outline`, `--mat-sys-outline-variant`
