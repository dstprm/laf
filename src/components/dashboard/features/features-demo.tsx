'use client';

import { TierGate } from '@/components/shared/tier-gate/tier-gate';
import {
  FreeFeatureComponent,
  StarterFeatureComponent,
  ProFeatureComponent,
  AdvancedFeatureComponent,
} from '@/components/dashboard/features/demo-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Info } from 'lucide-react';

export function FeaturesDemo() {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Overview Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Tier Gate System Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700 space-y-2">
          <p>
            This page demonstrates how the <code className="bg-blue-100 px-1 rounded">TierGate</code> component works to
            control access to features based on subscription tiers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className="flex items-center gap-2 min-w-0">
              <Badge variant="secondary" className="shrink-0">
                Free
              </Badge>
              <span className="text-xs truncate">No restrictions</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Badge className="bg-orange-100 text-orange-700 shrink-0">Starter+</Badge>
              <span className="text-xs truncate">Level 1+ required</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Badge className="bg-blue-100 text-blue-700 shrink-0">Pro+</Badge>
              <span className="text-xs truncate">Level 2+ required</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Badge className="bg-purple-100 text-purple-700 shrink-0">Advanced</Badge>
              <span className="text-xs truncate">Level 3 required</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Demos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Free Feature - No TierGate */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg md:text-xl font-semibold">Free Access</h2>
            <Badge variant="secondary">No Gate</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            This feature is available to all users without any tier restrictions.
          </p>
          <FreeFeatureComponent />
        </div>

        {/* Starter Feature - Level 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg md:text-xl font-semibold">Starter+ Feature</h2>
            <Badge className="bg-orange-100 text-orange-700">Level 1+</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Requires Starter subscription or higher. Shows upgrade prompt for free users.
          </p>
          <TierGate
            requiredLevel={1}
            featureTitle="Feature 1"
            featureDescription="This feature requires a Starter subscription or higher to access."
          >
            <StarterFeatureComponent />
          </TierGate>
        </div>

        {/* Pro Feature - Level 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg md:text-xl font-semibold">Pro+ Feature</h2>
            <Badge className="bg-blue-100 text-blue-700">Level 2+</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Requires Pro subscription or higher. Blocked for Starter and free users.
          </p>
          <TierGate
            requiredLevel={2}
            featureTitle="Feature 2"
            featureDescription="This feature requires a Pro subscription or higher to access."
          >
            <ProFeatureComponent />
          </TierGate>
        </div>

        {/* Advanced Feature - Level 3 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg md:text-xl font-semibold">Advanced Feature</h2>
            <Badge className="bg-purple-100 text-purple-700">Level 3</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Requires Advanced subscription (highest tier). Premium enterprise features.
          </p>
          <TierGate
            requiredLevel={3}
            featureTitle="Feature 3"
            featureDescription="This feature requires an Advanced subscription (highest tier) to access."
          >
            <AdvancedFeatureComponent />
          </TierGate>
        </div>
      </div>

      {/* Implementation Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Implementation Example
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Here is how to use the TierGate component in your code:</p>

          <div className="rounded-lg p-3 md:p-4 overflow-x-auto">
            <pre className="text-xs md:text-sm whitespace-pre-wrap break-words">
              {`// Wrap any component with TierGate to control access
<TierGate 
  requiredLevel={2}
  featureTitle="Team Collaboration"
  featureDescription="Enable team features with Pro subscription"
>
  <YourFeatureComponent />
</TierGate>

// Component automatically shows upgrade prompt if user lacks access
// Shows content if user has sufficient tier level`}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <p className="font-medium">requiredLevel</p>
              <p className="text-muted-foreground">1=Starter, 2=Pro, 3=Advanced</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">featureTitle</p>
              <p className="text-muted-foreground">Title shown in upgrade prompt</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">featureDescription</p>
              <p className="text-muted-foreground">Description of the feature</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
