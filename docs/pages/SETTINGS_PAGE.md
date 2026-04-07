# Settings Page

> **File target:** `src/app/[locale]/settings/page.tsx`
>
> **Universal rules:** See [UI_DESIGN_GUIDELINES.md](../UI_DESIGN_GUIDELINES.md)

---

## Purpose

- Handle account, locale, and advanced AI configuration.
- Must not break gameplay flow — settings is a side-trip, not a destination.

---

## UX Goals

| Criteria | Target |
|---|---|
| Normal-user settings separated from technical settings | Clear visual grouping |
| Custom provider fields are visually secondary | Collapsed by default |
| Save triggers strong confirmation | Toast or banner feedback |
| User can return to prior context easily | Back button / navigation |

---

## Target Layout

### Section A: Header

| Component | Notes |
|---|---|
| `BackButton` | Returns to prior context |
| `PageTitle` | "Settings" |
| `LanguageToggle` | |

### Section B: General Settings Panel

| Component | Notes |
|---|---|
| `AccountCard` | Account info / login state |
| `LanguageCard` | Language selection |

### Section C: Advanced AI Settings Panel

| Component | Notes |
|---|---|
| `ProviderSelector` | AI provider choice |
| `ApiKeyField` | API key input |
| `CustomProviderAccordion` | Collapsed by default |
| `SaveButton` | Primary action |
| `SaveToast` | Confirmation feedback |

---

## Wireframe Notes

- Separate normal-user settings from technical settings.
- Custom provider fields must be visually secondary.
- Saving should trigger a stronger confirmation pattern (not just silent save).
