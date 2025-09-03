'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Check } from 'lucide-react';

export function ThemeSettings() {
  const { theme, themes, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize the appearance of your SaaS template. Changes apply immediately and are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Theme Display */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <h3 className="font-medium">Current Theme</h3>
            <p className="text-sm text-muted-foreground">{theme.description}</p>
          </div>
          <Badge variant="secondary">{theme.name}</Badge>
        </div>

        {/* Theme Options */}
        <div>
          <h3 className="font-medium mb-4">Available Themes</h3>

          {/* Light Themes */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Light Themes</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {themes
                .filter((t) => t.id.includes('light') || t.id === 'light')
                .map((t) => (
                  <Card
                    key={t.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      theme.id === t.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setTheme(t.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{t.name}</CardTitle>
                        {theme.id === t.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <CardDescription className="text-xs">{t.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Theme Color Preview */}
                      <div className="flex gap-1 mb-3">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.colors.primary }} />
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.colors.secondary }} />
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.colors.accent }} />
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: t.colors.highlightYellow }}
                        />
                      </div>
                      <Button
                        variant={theme.id === t.id ? 'default' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme(t.id);
                        }}
                      >
                        {theme.id === t.id ? 'Current' : 'Apply'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>

          {/* Dark Themes */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Dark Themes</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {themes
                .filter((t) => !t.id.includes('light') && t.id !== 'light')
                .map((t) => (
                  <Card
                    key={t.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      theme.id === t.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setTheme(t.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{t.name}</CardTitle>
                        {theme.id === t.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <CardDescription className="text-xs">{t.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Theme Color Preview */}
                      <div className="flex gap-1 mb-3">
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.colors.primary }} />
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.colors.secondary }} />
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: t.colors.accent }} />
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: t.colors.highlightYellow }}
                        />
                      </div>
                      <Button
                        variant={theme.id === t.id ? 'default' : 'outline'}
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme(t.id);
                        }}
                      >
                        {theme.id === t.id ? 'Current' : 'Apply'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </div>

        {/* Theme Information */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">About Themes</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• Themes change the color scheme across your entire application</p>
            <p>• Your theme preference is saved automatically and persists across sessions</p>
            <p>• All UI components and custom styling adapt to the selected theme</p>
            <p>• You can switch between themes at any time using the theme selector in the navigation</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
