# Theme System Guide

Production: light/dark toggle using themes in `src/lib/themes.ts`.

## Set Production Themes

Edit in `src/lib/themes.ts`:

```ts
export const productionLightTheme = lightBlueTheme;
export const productionDarkTheme = purpleTheme;
```

Features: global toggle, persistent preference, real-time switching in settings.
