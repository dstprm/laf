'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, availableThemes, productionLightTheme, productionDarkTheme } from '@/lib/themes';

interface ThemeContextType {
  theme: Theme;
  themes: Theme[];
  setTheme: (themeId: string) => void;
  isLoading: boolean;
  // Simple mode properties for production
  isSimpleMode: boolean;
  isDarkMode: boolean;
  toggleLightDark: () => void;
  setSimpleMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  simpleMode?: boolean; // Enable simple light/dark toggle for production
}

export function ThemeProvider({ children, defaultTheme: initialTheme, simpleMode = false }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(productionLightTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimpleMode, setIsSimpleMode] = useState(simpleMode);

  // Determine if current theme is dark (works in both simple and development mode)
  const isDarkMode = !theme.id.includes('light') && theme.id !== 'light';

  // Apply theme to CSS variables
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;

    // Apply all theme colors as CSS variables
    Object.entries(newTheme.colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });

    // Update class for any additional styling
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${newTheme.id}`);

    // Ensure Tailwind's dark: variant works by toggling the .dark class
    const isDark = !newTheme.id.includes('light') && newTheme.id !== 'light';
    root.classList.toggle('dark', isDark);
  };

  // Load saved theme and mode from localStorage
  useEffect(() => {
    const savedSimpleMode = localStorage.getItem('saas-simple-mode') === 'true';
    const savedThemeId = localStorage.getItem('saas-theme');

    // Set simple mode from localStorage or prop
    setIsSimpleMode(savedSimpleMode || simpleMode);

    if (savedThemeId) {
      const savedTheme = availableThemes.find((t) => t.id === savedThemeId);
      if (savedTheme) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
      } else {
        // Fallback to production light theme instead of hardcoded default
        setThemeState(productionLightTheme);
        applyTheme(productionLightTheme);
      }
    } else if (initialTheme) {
      const theme = availableThemes.find((t) => t.id === initialTheme);
      if (theme) {
        setThemeState(theme);
        applyTheme(theme);
      } else {
        // Fallback to production light theme instead of hardcoded default
        setThemeState(productionLightTheme);
        applyTheme(productionLightTheme);
      }
    } else {
      // Default to production light theme for first-time users
      setThemeState(productionLightTheme);
      applyTheme(productionLightTheme);
    }
    setIsLoading(false);
  }, [initialTheme, simpleMode]);

  const setTheme = (themeId: string) => {
    const newTheme = availableThemes.find((t) => t.id === themeId);
    if (newTheme) {
      setThemeState(newTheme);
      applyTheme(newTheme);
      localStorage.setItem('saas-theme', themeId);
    }
  };

  // Toggle between light and dark themes
  const toggleLightDark = () => {
    let newTheme;

    if (isSimpleMode) {
      // In simple mode, always use production themes
      newTheme = isDarkMode ? productionLightTheme : productionDarkTheme;
    } else {
      // In development mode, toggle between basic light and dark
      newTheme = isDarkMode
        ? availableThemes.find((t) => t.id === 'light')!
        : availableThemes.find((t) => t.id === 'dark')!;
    }

    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('saas-theme', newTheme.id);
  };

  // Set simple mode on/off
  const setSimpleMode = (enabled: boolean) => {
    setIsSimpleMode(enabled);
    localStorage.setItem('saas-simple-mode', enabled.toString());

    // When enabling simple mode, default to appropriate theme
    if (enabled) {
      const newTheme = theme.id.includes('light') ? productionLightTheme : productionDarkTheme;
      if (newTheme.id !== theme.id) {
        setThemeState(newTheme);
        applyTheme(newTheme);
        localStorage.setItem('saas-theme', newTheme.id);
      }
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes: availableThemes,
        setTheme,
        isLoading,
        isSimpleMode,
        isDarkMode,
        toggleLightDark,
        setSimpleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
