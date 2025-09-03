/**
 * Theme definitions for the SaaS template
 * These themes can be customized through the admin panel
 */

export interface ThemeColors {
  // Base colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;

  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;

  // Custom UI colors
  uiSurface: string;
  uiSurfaceHover: string;
  uiSurfaceActive: string;
  uiSeparator: string;
  uiIcon: string;
  uiIconActive: string;

  // Button variants
  buttonSecondaryBg: string;
  buttonSecondaryDisabled: string;

  // Alert variants
  alertDestructiveBorder: string;
  alertDestructiveBg: string;

  // Highlight colors
  highlightYellow: string;
  highlightYellowSoft: string;
  highlightBlue: string;

  // Gradient colors
  gradientBorder: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

// Default Dark Theme (current design)
export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  description: 'Modern dark theme with teal accents',
  colors: {
    background: 'hsl(180 18% 7%)',
    foreground: 'hsl(240 5% 96%)',
    card: 'hsl(222.2 84% 4.9%)',
    cardForeground: 'var(--foreground)',
    popover: 'hsl(222.2 84% 4.9%)',
    popoverForeground: 'var(--foreground)',
    primary: 'hsl(210 40% 98%)',
    primaryForeground: 'hsl(222.2 47.4% 11.2%)',
    secondary: 'hsl(240, 5%, 80%)',
    secondaryForeground: 'var(--foreground)',
    muted: 'hsl(217.2 32.6% 17.5%)',
    mutedForeground: 'hsl(180 1% 48%)',
    accent: 'hsl(217.2 32.6% 17.5%)',
    accentForeground: 'var(--foreground)',
    destructive: 'hsl(0 62.8% 30.6%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(187 10% 17%)',
    input: 'hsl(217.2 32.6% 17.5%)',
    ring: 'hsl(58 100% 70%)',
    chart1: 'hsl(220 70% 50%)',
    chart2: 'hsl(160 60% 45%)',
    chart3: 'hsl(30 80% 55%)',
    chart4: 'hsl(280 65% 60%)',
    chart5: 'hsl(340 75% 55%)',
    uiSurface: 'hsl(194 9% 8%)',
    uiSurfaceHover: 'hsl(194 12% 11%)',
    uiSurfaceActive: 'hsl(194 12% 11%)',
    uiSeparator: 'hsl(194 12% 15%)',
    uiIcon: 'hsl(180 4% 30%)',
    uiIconActive: 'hsl(210 40% 98%)',
    buttonSecondaryBg: 'hsla(0 0% 99% / 0.2)',
    buttonSecondaryDisabled: 'hsl(240 8% 10%)',
    alertDestructiveBorder: 'hsl(348 83% 47%)',
    alertDestructiveBg: 'hsl(348 80% 7%)',
    highlightYellow: 'hsl(58 100% 50%)',
    highlightYellowSoft: 'hsl(58 100% 70%)',
    highlightBlue: 'hsl(215 100% 65%)',
    gradientBorder: 'hsl(194 12% 25%)',
  },
};

// Light Theme
export const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  description: 'Clean light theme with blue accents',
  colors: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(240 5% 6%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'var(--foreground)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'var(--foreground)',
    primary: 'hsl(222.2 47.4% 11.2%)',
    primaryForeground: 'hsl(240 5% 96%)',
    secondary: 'hsl(210 40% 94%)',
    secondaryForeground: 'var(--foreground)',
    muted: 'hsl(210 40% 96.1%)',
    mutedForeground: 'hsl(215.4 16.3% 46.9%)',
    accent: 'hsl(210 40% 96.1%)',
    accentForeground: 'var(--foreground)',
    destructive: 'hsl(0 84.2% 60.2%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    input: 'hsl(214.3 31.8% 91.4%)',
    ring: 'hsl(222.2 84% 4.9%)',
    chart1: 'hsl(12 76% 61%)',
    chart2: 'hsl(173 58% 39%)',
    chart3: 'hsl(197 37% 24%)',
    chart4: 'hsl(43 74% 66%)',
    chart5: 'hsl(27 87% 67%)',
    uiSurface: 'hsl(210 40% 96.1%)',
    uiSurfaceHover: 'hsl(210 40% 93%)',
    uiSurfaceActive: 'hsl(210 40% 90%)',
    uiSeparator: 'hsl(214.3 31.8% 91.4%)',
    uiIcon: 'hsl(215.4 16.3% 46.9%)',
    uiIconActive: 'hsl(222.2 47.4% 11.2%)',
    buttonSecondaryBg: 'hsla(0 0% 0% / 0.05)',
    buttonSecondaryDisabled: 'hsl(210 40% 96.1%)',
    alertDestructiveBorder: 'hsl(0 84.2% 60.2%)',
    alertDestructiveBg: 'hsl(0 84.2% 97%)',
    highlightYellow: 'hsl(45 93% 47%)',
    highlightYellowSoft: 'hsl(48 96% 89%)',
    highlightBlue: 'hsl(217 91% 60%)',
    gradientBorder: 'hsl(214.3 31.8% 78%)',
  },
};

// Purple Theme
export const purpleTheme: Theme = {
  id: 'purple',
  name: 'Purple',
  description: 'Modern dark theme with purple accents',
  colors: {
    ...darkTheme.colors,
    primary: 'hsl(270 95% 75%)',
    primaryForeground: 'hsl(222.2 47.4% 11.2%)',
    ring: 'hsl(270 95% 75%)',
    uiIconActive: 'hsl(270 95% 75%)',
    highlightYellow: 'hsl(270 95% 75%)',
    highlightYellowSoft: 'hsl(270 70% 85%)',
    highlightBlue: 'hsl(270 100% 80%)',
  },
};

// Green Theme
export const greenTheme: Theme = {
  id: 'green',
  name: 'Green',
  description: 'Modern dark theme with green accents',
  colors: {
    ...darkTheme.colors,
    primary: 'hsl(142 76% 36%)',
    primaryForeground: 'hsl(210 40% 98%)',
    ring: 'hsl(142 76% 36%)',
    uiIconActive: 'hsl(142 76% 36%)',
    highlightYellow: 'hsl(142 76% 36%)',
    highlightYellowSoft: 'hsl(142 60% 50%)',
    highlightBlue: 'hsl(142 80% 40%)',
  },
};

// Orange Theme
export const orangeTheme: Theme = {
  id: 'orange',
  name: 'Orange',
  description: 'Modern dark theme with orange accents',
  colors: {
    ...darkTheme.colors,
    primary: 'hsl(25 95% 53%)',
    primaryForeground: 'hsl(222.2 47.4% 11.2%)',
    ring: 'hsl(25 95% 53%)',
    uiIconActive: 'hsl(25 95% 53%)',
    highlightYellow: 'hsl(25 95% 53%)',
    highlightYellowSoft: 'hsl(25 95% 70%)',
    highlightBlue: 'hsl(25 100% 60%)',
  },
};

// Light Purple Theme
export const lightPurpleTheme: Theme = {
  id: 'light-purple',
  name: 'Light Purple',
  description: 'Clean light theme with purple accents',
  colors: {
    ...lightTheme.colors,
    primary: 'hsl(270 95% 35%)',
    secondary: 'hsl(270 20% 92%)',
    primaryForeground: 'hsl(0 0% 100%)',
    ring: 'hsl(270 95% 35%)',
    uiIconActive: 'hsl(270 95% 35%)',
    highlightYellow: 'hsl(270 95% 35%)',
    highlightYellowSoft: 'hsl(270 70% 85%)',
    highlightBlue: 'hsl(270 100% 50%)',
    chart1: 'hsl(270 76% 61%)',
    chart2: 'hsl(280 58% 49%)',
    chart3: 'hsl(260 67% 54%)',
    chart4: 'hsl(290 74% 56%)',
    chart5: 'hsl(275 87% 57%)',
  },
};

// Light Green Theme
export const lightGreenTheme: Theme = {
  id: 'light-green',
  name: 'Light Green',
  description: 'Clean light theme with green accents',
  colors: {
    ...lightTheme.colors,
    primary: 'hsl(142 76% 36%)',
    secondary: 'hsl(142 20% 92%)',
    primaryForeground: 'hsl(0 0% 100%)',
    ring: 'hsl(142 76% 36%)',
    uiIconActive: 'hsl(142 76% 36%)',
    highlightYellow: 'hsl(142 76% 36%)',
    highlightYellowSoft: 'hsl(142 60% 80%)',
    highlightBlue: 'hsl(142 80% 40%)',
    chart1: 'hsl(142 76% 41%)',
    chart2: 'hsl(152 68% 39%)',
    chart3: 'hsl(132 77% 34%)',
    chart4: 'hsl(162 74% 46%)',
    chart5: 'hsl(147 87% 47%)',
  },
};

// Light Orange Theme
export const lightOrangeTheme: Theme = {
  id: 'light-orange',
  name: 'Light Orange',
  description: 'Clean light theme with orange accents',
  colors: {
    ...lightTheme.colors,
    primary: 'hsl(25 95% 43%)',
    secondary: 'hsl(25 20% 92%)',
    primaryForeground: 'hsl(0 0% 100%)',
    ring: 'hsl(25 95% 43%)',
    uiIconActive: 'hsl(25 95% 43%)',
    highlightYellow: 'hsl(25 95% 43%)',
    highlightYellowSoft: 'hsl(25 95% 80%)',
    highlightBlue: 'hsl(25 100% 50%)',
    chart1: 'hsl(25 76% 51%)',
    chart2: 'hsl(35 88% 49%)',
    chart3: 'hsl(15 87% 44%)',
    chart4: 'hsl(45 84% 56%)',
    chart5: 'hsl(30 97% 57%)',
  },
};

// Light Blue Theme
export const lightBlueTheme: Theme = {
  id: 'light-blue',
  name: 'Light Blue',
  description: 'Clean light theme with vibrant blue accents',
  colors: {
    ...lightTheme.colors,
    primary: 'hsl(217 91% 50%)',
    secondary: 'hsl(217 20% 92%)',
    primaryForeground: 'hsl(0 0% 100%)',
    ring: 'hsl(217 91% 50%)',
    uiIconActive: 'hsl(217 91% 50%)',
    highlightYellow: 'hsl(217 91% 50%)',
    highlightYellowSoft: 'hsl(217 91% 85%)',
    highlightBlue: 'hsl(217 91% 60%)',
    chart1: 'hsl(217 76% 61%)',
    chart2: 'hsl(207 88% 49%)',
    chart3: 'hsl(227 77% 54%)',
    chart4: 'hsl(197 84% 56%)',
    chart5: 'hsl(212 87% 57%)',
  },
};

// Light Rose Theme
export const lightRoseTheme: Theme = {
  id: 'light-rose',
  name: 'Light Rose',
  description: 'Clean light theme with rose accents',
  colors: {
    ...lightTheme.colors,
    primary: 'hsl(350 89% 47%)',
    secondary: 'hsl(350 20% 92%)',
    primaryForeground: 'hsl(0 0% 100%)',
    ring: 'hsl(350 89% 47%)',
    uiIconActive: 'hsl(350 89% 47%)',
    highlightYellow: 'hsl(350 89% 47%)',
    highlightYellowSoft: 'hsl(350 89% 85%)',
    highlightBlue: 'hsl(350 100% 57%)',
    chart1: 'hsl(350 76% 61%)',
    chart2: 'hsl(340 88% 59%)',
    chart3: 'hsl(360 87% 54%)',
    chart4: 'hsl(330 84% 66%)',
    chart5: 'hsl(355 87% 67%)',
  },
};

// Light Warm Theme
export const lightWarmTheme: Theme = {
  id: 'light-warm',
  name: 'Light Warm',
  description: 'Warm light theme with amber tones',
  colors: {
    background: 'hsl(30 20% 99%)',
    foreground: 'hsl(20 14% 4%)',
    card: 'hsl(30 20% 99%)',
    cardForeground: 'var(--foreground)',
    popover: 'hsl(30 20% 99%)',
    popoverForeground: 'var(--foreground)',
    primary: 'hsl(45 93% 47%)',
    primaryForeground: 'hsl(26 83% 14%)',
    secondary: 'hsl(45 25% 92%)',
    secondaryForeground: 'var(--foreground)',
    muted: 'hsl(45 25% 94%)',
    mutedForeground: 'hsl(45 8% 46%)',
    accent: 'hsl(45 25% 94%)',
    accentForeground: 'var(--foreground)',
    destructive: 'hsl(0 84% 60%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(45 20% 88%)',
    input: 'hsl(45 20% 88%)',
    ring: 'hsl(45 93% 47%)',
    chart1: 'hsl(45 76% 61%)',
    chart2: 'hsl(35 68% 49%)',
    chart3: 'hsl(25 77% 44%)',
    chart4: 'hsl(55 84% 56%)',
    chart5: 'hsl(40 87% 57%)',
    uiSurface: 'hsl(45 25% 94%)',
    uiSurfaceHover: 'hsl(45 25% 91%)',
    uiSurfaceActive: 'hsl(45 25% 88%)',
    uiSeparator: 'hsl(45 20% 88%)',
    uiIcon: 'hsl(45 8% 46%)',
    uiIconActive: 'hsl(45 93% 47%)',
    buttonSecondaryBg: 'hsla(45 93% 47% / 0.08)',
    buttonSecondaryDisabled: 'hsl(45 25% 94%)',
    alertDestructiveBorder: 'hsl(0 84% 60%)',
    alertDestructiveBg: 'hsl(0 84% 97%)',
    highlightYellow: 'hsl(45 93% 47%)',
    highlightYellowSoft: 'hsl(48 96% 89%)',
    highlightBlue: 'hsl(217 91% 60%)',
    gradientBorder: 'hsl(45 20% 75%)',
  },
};

// Light Cool Theme
export const lightCoolTheme: Theme = {
  id: 'light-cool',
  name: 'Light Cool',
  description: 'Cool light theme with cyan tones',
  colors: {
    background: 'hsl(210 20% 99%)',
    foreground: 'hsl(220 14% 4%)',
    card: 'hsl(210 20% 99%)',
    cardForeground: 'var(--foreground)',
    popover: 'hsl(210 20% 99%)',
    popoverForeground: 'var(--foreground)',
    primary: 'hsl(185 84% 39%)',
    primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(210 25% 92%)',
    secondaryForeground: 'var(--foreground)',
    muted: 'hsl(210 25% 95%)',
    mutedForeground: 'hsl(210 8% 46%)',
    accent: 'hsl(210 25% 95%)',
    accentForeground: 'var(--foreground)',
    destructive: 'hsl(0 84% 60%)',
    destructiveForeground: 'hsl(210 40% 98%)',
    border: 'hsl(210 20% 89%)',
    input: 'hsl(210 20% 89%)',
    ring: 'hsl(185 84% 39%)',
    chart1: 'hsl(185 76% 51%)',
    chart2: 'hsl(195 68% 49%)',
    chart3: 'hsl(175 77% 44%)',
    chart4: 'hsl(205 84% 56%)',
    chart5: 'hsl(190 87% 57%)',
    uiSurface: 'hsl(210 25% 95%)',
    uiSurfaceHover: 'hsl(210 25% 92%)',
    uiSurfaceActive: 'hsl(210 25% 89%)',
    uiSeparator: 'hsl(210 20% 89%)',
    uiIcon: 'hsl(210 8% 46%)',
    uiIconActive: 'hsl(185 84% 39%)',
    buttonSecondaryBg: 'hsla(185 84% 39% / 0.08)',
    buttonSecondaryDisabled: 'hsl(210 25% 95%)',
    alertDestructiveBorder: 'hsl(0 84% 60%)',
    alertDestructiveBg: 'hsl(0 84% 97%)',
    highlightYellow: 'hsl(185 84% 39%)',
    highlightYellowSoft: 'hsl(185 84% 89%)',
    highlightBlue: 'hsl(185 91% 50%)',
    gradientBorder: 'hsl(210 20% 76%)',
  },
};

// Production themes - Edit these to set your final light/dark themes
export const productionLightTheme = lightTheme; // Change this to your chosen light theme
export const productionDarkTheme = darkTheme; // Change this to your chosen dark theme

export const availableThemes: Theme[] = [
  darkTheme,
  lightTheme,
  lightPurpleTheme,
  lightGreenTheme,
  lightOrangeTheme,
  lightBlueTheme,
  lightRoseTheme,
  lightWarmTheme,
  lightCoolTheme,
  purpleTheme,
  greenTheme,
  orangeTheme,
];

export const defaultTheme = darkTheme;
