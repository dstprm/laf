'use client';

import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

interface LightDarkToggleProps {
  className?: string;
}

export function LightDarkToggle({ className }: LightDarkToggleProps) {
  const { isDarkMode, toggleLightDark } = useTheme();

  return (
    <Button variant="secondary" size="icon" className={className} onClick={toggleLightDark}>
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
