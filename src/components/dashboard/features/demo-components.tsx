'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Shield, Database, Globe, Zap, Crown, Star, Check, TrendingUp } from 'lucide-react';

/**
 * Free Feature Component
 * Available to all users, even without subscription
 */
export function FreeFeatureComponent() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Free Feature
          </CardTitle>
          <Badge variant="secondary">Free</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This feature is available to all users without any subscription requirements.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>Feature item 1</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>Feature item 2</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>Feature item 3</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>Feature item 4</span>
          </div>
        </div>

        <Button className="w-full" variant="outline">
          Action 1
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Starter Feature Component
 * Requires Starter tier (Level 1) or higher
 */
export function StarterFeatureComponent() {
  return (
    <Card className="w-full border-orange-200 bg-orange-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-500" />
            Feature 1
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">Starter+</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This feature requires a Starter subscription or higher to access.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-orange-500 shrink-0" />
            <span>Feature item 1</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500 shrink-0" />
            <span>Feature item 2</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-orange-500 shrink-0" />
            <span>Feature item 3</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>Feature item 4</span>
          </div>
        </div>

        <Button className="w-full bg-orange-600 hover:bg-orange-700">Action 1</Button>
      </CardContent>
    </Card>
  );
}

/**
 * Pro Feature Component
 * Requires Pro tier (Level 2) or higher
 */
export function ProFeatureComponent() {
  return (
    <Card className="w-full border-blue-200 bg-blue-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Feature 2
          </CardTitle>
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Pro+</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">This feature requires a Pro subscription or higher to access.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500 shrink-0" />
            <span>Feature item 1</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500 shrink-0" />
            <span>Feature item 2</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>Feature item 3</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>Feature item 4</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">Action 1</Button>
          <Button variant="outline" className="w-full">
            Action 2
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Advanced Feature Component
 * Requires Advanced tier (Level 3) - highest tier
 */
export function AdvancedFeatureComponent() {
  return (
    <Card className="w-full border-purple-200 bg-purple-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-500" />
            Feature 3
          </CardTitle>
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">Advanced</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This feature requires an Advanced subscription (highest tier) to access.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-500 shrink-0" />
            <span>Feature item 1</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-500 shrink-0" />
            <span>Feature item 2</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-purple-500 shrink-0" />
            <span>Feature item 3</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <span>Feature item 4</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button className="w-full bg-purple-600 hover:bg-purple-700">Action 1</Button>
          <Button variant="outline" className="w-full">
            Action 2
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
