'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Check, Code, ToggleLeft, ToggleRight, Copy } from 'lucide-react';
import { useState } from 'react';

export function DeveloperThemeSettings() {
  const { theme, themes, setTheme, isSimpleMode, setSimpleMode } = useTheme();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getThemeConfigCode = (lightTheme: string, darkTheme: string) => {
    return `// In src/lib/themes.ts, find these lines and update them:

export const productionLightTheme = ${lightTheme}Theme;
export const productionDarkTheme = ${darkTheme}Theme;`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Development Mode
          </CardTitle>
          <CardDescription>
            Toggle between development mode (all themes) and production mode (light/dark only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">{isSimpleMode ? 'Production Mode' : 'Development Mode'}</h3>
              <p className="text-sm text-muted-foreground">
                {isSimpleMode
                  ? 'Simple light/dark toggle - ready for production'
                  : 'All theme options available - for development'}
              </p>
            </div>
            <Button variant="outline" onClick={() => setSimpleMode(!isSimpleMode)} className="flex items-center gap-2">
              {isSimpleMode ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {isSimpleMode ? 'Exit Production Mode' : 'Enable Production Mode'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            How to Set Your Production Themes
          </CardTitle>
          <CardDescription>
            Follow these steps to configure the final light and dark themes for your SaaS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-2">Step 1: Choose Your Themes</h3>
            <p className="text-muted-foreground mb-4">
              Browse the available themes below and select one light and one dark theme for your production app.
              {isSimpleMode && (
                <span className="block mt-2 text-sm text-orange-500 font-medium">
                  💡 Exit production mode below to see the theme browser
                </span>
              )}
            </p>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-2">Step 2: Set Your Production Themes</h3>
            <p className="text-muted-foreground mb-4">
              Simply update these two lines in your `src/lib/themes.ts` file with your chosen theme names:
            </p>
            <div className="bg-muted p-4 rounded-lg relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(getThemeConfigCode('light', 'dark'), 'config')}
              >
                <Copy className="h-4 w-4" />
                {copiedCode === 'config' ? 'Copied!' : 'Copy'}
              </Button>
              <pre className="text-sm overflow-x-auto">
                <code>{getThemeConfigCode('light', 'dark')}</code>
              </pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-2">Step 3: You&apos;re Done!</h3>
            <p className="text-muted-foreground mb-3">
              That&apos;s it! Restart the app to see the changes. The light/dark toggle will now use your chosen themes
              throughout the app.
            </p>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">💡 What happens automatically:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Light/dark toggle appears in header and sidebar</li>
                <li>• Users can switch between your chosen themes</li>
                <li>• Theme preference is saved automatically</li>
                <li>• All components adapt to the selected theme</li>
              </ul>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-2">Step 4: Optional Cleanup</h3>
            <p className="text-muted-foreground mb-3">For production optimization, you can optionally:</p>
            <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
              <li>Remove unused theme definitions from `themes.ts`</li>
              <li>Remove this theme configuration page</li>
              <li>Keep only your chosen themes to reduce bundle size</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Current Theme Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Theme Preview</CardTitle>
          <CardDescription>This is how your current theme looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium">Current: {theme.name}</h3>
              <p className="text-sm text-muted-foreground">{theme.description}</p>
            </div>
            <Badge variant="secondary">{theme.name}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Theme Browser - Only show in developer mode */}
      {!isSimpleMode && (
        <Card>
          <CardHeader>
            <CardTitle>Theme Browser</CardTitle>
            <CardDescription>
              Browse all available themes to choose your production light and dark themes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Light Themes */}
            <div>
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
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: t.colors.secondary }}
                          />
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
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: t.colors.secondary }}
                          />
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
