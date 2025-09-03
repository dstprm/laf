'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Shield, ShieldOff, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip } from '@/components/ui/tooltip';
import { getTierByPriceId, PricingTier } from '@/constants/pricing-tier';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { OverrideDialog } from '@/components/dashboard/admin/override-dialog';
import { Confirmation } from '@/components/shared/confirmation/confirmation';

interface User {
  id: string;
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  createdAt: string;
  overrideTier?: string;
  overrideExpiresAt?: string;
  customer?: {
    currentTier?: string;
    overrideTier?: string;
    overrideExpiresAt?: string;
    subscriptions: {
      subscriptionId: string;
      subscriptionStatus: string;
      priceId?: string;
      productId?: string;
      scheduledChange?: string;
      createdAt: string;
      updatedAt: string;
    }[];
  };
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export function AdminUsersTable() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [pendingOverrideUserId, setPendingOverrideUserId] = useState<string | null>(null);
  const [pendingOverrideTierId, setPendingOverrideTierId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    description: string;
    actionText: string;
    actionVariant: 'destructive' | 'default';
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const { toast } = useToast();

  const fetchUsers = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(pageNum), limit: '10' });
      if (q.trim()) params.set('q', q.trim());
      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      setData(result);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          isAdmin: !currentStatus,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update user');
      }

      toast({
        title: 'Success',
        description: `User ${!currentStatus ? 'promoted to' : 'removed from'} admin`,
      });

      // Refresh the data
      await fetchUsers(page);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to delete user');
      }

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });

      // Refresh the data
      await fetchUsers(page);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const changeUserPlan = async (userId: string, newPriceId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPriceId }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to change plan');
      }

      toast({ title: 'Success', description: 'Plan updated successfully' });
      await fetchUsers(page);
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change plan',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const changeUserStatus = async (userId: string, action: 'cancel_now' | 'cancel_at_period_end' | 'resume') => {
    try {
      setActionLoading(userId);
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update subscription');
      }

      toast({ title: 'Success', description: 'Subscription updated' });
      await fetchUsers(page);
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update subscription',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSubscriptionDetails = (user: User) => {
    if (!user.customer?.subscriptions?.length) {
      return {
        tier: <Badge variant="secondary">Free User</Badge>,
        status: <span className="text-sm text-muted-foreground">No subscription</span>,
        details: <span className="text-sm text-muted-foreground">-</span>,
      };
    }

    // Get the most recent active subscription or the most recent one
    const activeSubscription = user.customer.subscriptions.find((sub) =>
      ['active', 'trialing'].includes(sub.subscriptionStatus),
    );
    const subscription = activeSubscription || user.customer.subscriptions[0];

    // Determine tier and billing frequency
    let tierInfo = user.customer.currentTier || 'Unknown';
    let billingFrequency = '';

    if (subscription.priceId) {
      const tier = getTierByPriceId(subscription.priceId);
      if (tier) {
        tierInfo = tier.name;
        billingFrequency = subscription.priceId === tier.priceId.month ? '(Monthly)' : '(Yearly)';
      }
    }

    // Status badge styling
    const getStatusVariant = (status: string) => {
      switch (status) {
        case 'active':
          return 'default';
        case 'trialing':
          return 'secondary';
        case 'past_due':
          return 'destructive';
        case 'paused':
          return 'outline';
        case 'cancelled':
        case 'canceled':
          return 'destructive';
        default:
          return 'outline';
      }
    };

    // Format status display
    const statusDisplay = subscription.subscriptionStatus.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    // Format dates
    const subscriptionDate = new Date(subscription.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      tier: (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(subscription.subscriptionStatus)}>
              {tierInfo} {billingFrequency}
            </Badge>
            {(user.overrideTier || user.customer?.overrideTier) && <Badge variant="secondary">Override</Badge>}
          </div>
          {subscription.scheduledChange && <span className="text-xs text-muted-foreground mt-1">Pending change</span>}
          {user.overrideTier && (
            <span className="text-xs text-muted-foreground mt-1">
              User override: {user.overrideTier}
              {user.overrideExpiresAt ? ` until ${new Date(user.overrideExpiresAt).toLocaleDateString('en-US')}` : ''}
            </span>
          )}
          {user.customer?.overrideTier && (
            <span className="text-xs text-muted-foreground mt-1">
              Customer override: {user.customer.overrideTier}
              {user.customer.overrideExpiresAt
                ? ` until ${new Date(user.customer.overrideExpiresAt).toLocaleDateString('en-US')}`
                : ''}
            </span>
          )}
        </div>
      ),
      status: (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{statusDisplay}</span>
          <span className="text-xs text-muted-foreground">Since {subscriptionDate}</span>
        </div>
      ),
      details: (
        <div className="flex flex-col text-xs text-muted-foreground">
          <span>ID: {subscription.subscriptionId.slice(0, 8)}...</span>
          {subscription.priceId && <span>Price: {subscription.priceId.slice(0, 8)}...</span>}
        </div>
      ),
    };
  };

  const confirmOverride = async (expiresAt: string | null) => {
    if (!pendingOverrideUserId || !pendingOverrideTierId) return;
    try {
      setActionLoading(pendingOverrideUserId);
      const r = await fetch('/api/admin/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pendingOverrideUserId,
          tierId: pendingOverrideTierId,
          expiresAt,
          scope: 'user',
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to set override');
      }
      toast({ title: 'Success', description: 'Override set' });
      await fetchUsers(page);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to set override',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
      setPendingOverrideUserId(null);
      setPendingOverrideTierId(null);
    }
  };

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load user data</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Users ({data.total})</CardTitle>
            <CardDescription>Manage users and their permissions</CardDescription>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email"
            className="h-9 w-full max-w-xs rounded-md border px-3 text-sm focus:outline-none"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Admin Status</TableHead>
              <TableHead>Subscription Plan</TableHead>
              <TableHead>Billing Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>
                <div className="inline-flex items-center gap-1">
                  Override
                  <Tooltip content="Admin-granted access that overrides billing tier. Can include an expiry.">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Tooltip>
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.users.map((user) => {
              const subscriptionDetails = getSubscriptionDetails(user);
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="font-medium">
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'No name'}
                        </div>
                        <div className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isAdmin ? <Badge variant="default">Admin</Badge> : <Badge variant="outline">User</Badge>}
                  </TableCell>
                  <TableCell>{subscriptionDetails.tier}</TableCell>
                  <TableCell>{subscriptionDetails.status}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {user.overrideTier || user.customer?.overrideTier ? (
                      <Tooltip content="Admin-granted access that overrides billing tier. Can include an expiry.">
                        <div className="flex flex-col max-w-[220px]">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Override</Badge>
                            <span className="text-xs text-muted-foreground">
                              {user.overrideTier || user.customer?.overrideTier}
                            </span>
                          </div>
                          {(user.overrideExpiresAt || user.customer?.overrideExpiresAt) && (
                            <span className="text-xs text-muted-foreground">
                              Until{' '}
                              {new Date(
                                (user.overrideExpiresAt || user.customer?.overrideExpiresAt) as string,
                              ).toLocaleDateString('en-US')}
                            </span>
                          )}
                        </div>
                      </Tooltip>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Tooltip content={user.isAdmin ? 'Remove admin privileges' : 'Grant admin privileges'}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConfirmConfig({
                              title: user.isAdmin ? 'Remove admin privileges?' : 'Grant admin privileges?',
                              description: user.isAdmin
                                ? 'This user will lose access to admin-only features.'
                                : 'This user will gain access to admin-only features.',
                              actionText: user.isAdmin ? 'Remove' : 'Grant',
                              actionVariant: 'default',
                              onConfirm: () => toggleAdminStatus(user.id, user.isAdmin),
                            });
                            setConfirmOpen(true);
                          }}
                          disabled={actionLoading === user.id}
                        >
                          {user.isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete user permanently">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConfirmConfig({
                              title: 'Delete user?',
                              description: 'This action cannot be undone and will remove all related data.',
                              actionText: 'Delete',
                              actionVariant: 'destructive',
                              onConfirm: () => deleteUser(user.id),
                            });
                            setConfirmOpen(true);
                          }}
                          disabled={actionLoading === user.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <div className="px-2 py-1.5 text-xs text-muted-foreground">Change plan</div>
                          {PricingTier.map((tier) => (
                            <DropdownMenuItem
                              key={`${tier.id}-month`}
                              onClick={() => {
                                setConfirmConfig({
                                  title: `Change plan to ${tier.name} (Monthly)?`,
                                  description:
                                    'This will update the user’s plan via Paddle and may apply proration depending on the scenario.',
                                  actionText: 'Change plan',
                                  actionVariant: 'default',
                                  onConfirm: () => changeUserPlan(user.id, tier.priceId.month),
                                });
                                setConfirmOpen(true);
                              }}
                              disabled={actionLoading === user.id}
                            >
                              {tier.name} (Monthly)
                            </DropdownMenuItem>
                          ))}
                          {PricingTier.map((tier) => (
                            <DropdownMenuItem
                              key={`${tier.id}-year`}
                              onClick={() => {
                                setConfirmConfig({
                                  title: `Change plan to ${tier.name} (Yearly)?`,
                                  description:
                                    'This will update the user’s plan via Paddle and may apply proration depending on the scenario.',
                                  actionText: 'Change plan',
                                  actionVariant: 'default',
                                  onConfirm: () => changeUserPlan(user.id, tier.priceId.year),
                                });
                                setConfirmOpen(true);
                              }}
                              disabled={actionLoading === user.id}
                            >
                              {tier.name} (Yearly)
                            </DropdownMenuItem>
                          ))}
                          <div className="px-2 py-1.5 text-xs text-muted-foreground">Subscription status</div>
                          <DropdownMenuItem
                            onClick={() => {
                              setConfirmConfig({
                                title: 'Cancel at period end?',
                                description: 'Subscription will remain active until the current period ends.',
                                actionText: 'Confirm',
                                actionVariant: 'default',
                                onConfirm: () => changeUserStatus(user.id, 'cancel_at_period_end'),
                              });
                              setConfirmOpen(true);
                            }}
                            disabled={actionLoading === user.id}
                          >
                            Cancel at period end
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setConfirmConfig({
                                title: 'Cancel immediately?',
                                description: 'Subscription will be canceled right away and access revoked.',
                                actionText: 'Cancel now',
                                actionVariant: 'destructive',
                                onConfirm: () => changeUserStatus(user.id, 'cancel_now'),
                              });
                              setConfirmOpen(true);
                            }}
                            disabled={actionLoading === user.id}
                          >
                            Cancel immediately
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setConfirmConfig({
                                title: 'Resume subscription?',
                                description: 'Removes any scheduled cancellation and keeps the subscription active.',
                                actionText: 'Resume',
                                actionVariant: 'default',
                                onConfirm: () => changeUserStatus(user.id, 'resume'),
                              });
                              setConfirmOpen(true);
                            }}
                            disabled={actionLoading === user.id}
                          >
                            Resume subscription
                          </DropdownMenuItem>
                          <div className="px-2 py-1.5 text-xs text-muted-foreground">Admin override</div>
                          {PricingTier.map((tier) => (
                            <DropdownMenuItem
                              key={`${tier.id}-override`}
                              onClick={async () => {
                                setPendingOverrideUserId(user.id);
                                setPendingOverrideTierId(tier.id);
                                setOverrideDialogOpen(true);
                              }}
                              disabled={actionLoading === user.id}
                            >
                              Set override: {tier.name}
                            </DropdownMenuItem>
                          ))}
                          {(user.customer?.overrideTier || user.overrideTier) && (
                            <DropdownMenuItem
                              onClick={() => {
                                setConfirmConfig({
                                  title: 'Clear override?',
                                  description: 'User will fall back to Paddle-billed access.',
                                  actionText: 'Clear',
                                  actionVariant: 'default',
                                  onConfirm: async () => {
                                    try {
                                      setActionLoading(user.id);
                                      const r = await fetch(`/api/admin/overrides?userId=${user.id}&scope=user`, {
                                        method: 'DELETE',
                                      });
                                      if (!r.ok) {
                                        const err = await r.json().catch(() => ({}));
                                        throw new Error(err?.error || 'Failed to clear override');
                                      }
                                      toast({ title: 'Success', description: 'Override cleared' });
                                      await fetchUsers(page);
                                    } catch (e) {
                                      toast({
                                        title: 'Error',
                                        description: e instanceof Error ? e.message : 'Failed to clear override',
                                        variant: 'destructive',
                                      });
                                    } finally {
                                      setActionLoading(null);
                                    }
                                  },
                                });
                                setConfirmOpen(true);
                              }}
                              disabled={actionLoading === user.id}
                            >
                              Clear override
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Page {data.page} of {data.totalPages}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => fetchUsers(page - 1)} disabled={page <= 1 || loading}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchUsers(page + 1)}
                disabled={page >= data.totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <OverrideDialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen} onConfirm={confirmOverride} />
      <Confirmation
        isOpen={confirmOpen}
        onClose={setConfirmOpen}
        title={confirmConfig?.title || ''}
        description={confirmConfig?.description || ''}
        actionText={confirmConfig?.actionText || 'Confirm'}
        actionVariant={confirmConfig?.actionVariant || 'default'}
        onConfirm={() => {
          if (!confirmConfig) return;
          const doConfirm = confirmConfig.onConfirm;
          setConfirmOpen(false);
          Promise.resolve(doConfirm());
        }}
      />
    </Card>
  );
}
