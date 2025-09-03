'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

/**
 * Shape returned by the Admin Analytics API
 */
interface AnalyticsResponse {
  /** Daily revenue buckets for the selected window */
  incomeEvolution: Array<{ date: string; revenue: number; revenueExTax?: number }>;
  /** Cumulative user count per day */
  userCountEvolution: Array<{ date: string; userCount: number }>;
  /** Distribution of users by tier (plus 'none') */
  userTypeDistribution: Array<{ type: string; count: number }>;
}

const COLORS = ['#6366F1', '#22C55E', '#F97316', '#E11D48', '#06B6D4', '#A78BFA', '#F59E0B'];

/**
 * Human-readable tick label for time x-axes.
 * Adapts format based on the displayed time span.
 */
function formatTimeAxisTick(ms: number, rangeMs: number) {
  const days = Math.max(1, Math.round(rangeMs / (24 * 60 * 60 * 1000)));
  if (days > 365) return dayjs(ms).format('MMM YYYY');
  if (days > 90) return dayjs(ms).format('MMM D');
  return dayjs(ms).format('MM/DD');
}

function formatTooltipDate(ms: number) {
  return dayjs(ms).format('MMM D, YYYY');
}

/** Format currency for tooltips/labels (default USD) */
function formatCurrency(value: number) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Revenue source selector: DB (fast) vs Paddle (live)
  const [source, setSource] = useState<'db' | 'paddle'>('db');
  const [backfilling, setBackfilling] = useState(false);
  // Income visualization mode: daily revenue vs cumulative revenue
  const [incomeViewMode, setIncomeViewMode] = useState<'daily' | 'cumulative'>('daily');
  // Date filters
  const [allHistory, setAllHistory] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>(''); // YYYY-MM-DD
  const [toDate, setToDate] = useState<string>(''); // YYYY-MM-DD
  // Applied date filters (used for fetching)
  const [appliedAllHistory, setAppliedAllHistory] = useState<boolean>(false);
  const [appliedFromDate, setAppliedFromDate] = useState<string>('');
  const [appliedToDate, setAppliedToDate] = useState<string>('');
  // Trigger manual refreshes (e.g., after backfill completes)
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('source', source);
        if (appliedAllHistory) {
          params.set('all', 'true');
        } else {
          if (appliedFromDate) params.set('from', appliedFromDate);
          if (appliedToDate) params.set('to', appliedToDate); // TODO when applying whole history, it takes dates that do not make sense
        }
        const res = await fetch(`/api/admin/analytics?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load analytics');
        const json = (await res.json()) as AnalyticsResponse;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError('Failed to load analytics');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, [source, appliedAllHistory, appliedFromDate, appliedToDate, refreshKey]);

  const totalRevenue = useMemo(() => {
    if (!data) return 0;
    return data.incomeEvolution.reduce((sum, p) => sum + (p.revenue || 0), 0);
  }, [data]);
  const totalRevenueExTax = useMemo(() => {
    if (!data) return 0;
    return data.incomeEvolution.reduce((sum, p) => sum + (p.revenueExTax || 0), 0);
  }, [data]);

  // Build series for income chart depending on mode
  const incomeChartData = useMemo(() => {
    if (!data) return [] as Array<{ date: string; dateMs: number; revenue: number }>;
    const daily = data.incomeEvolution.map((p) => ({ ...p, revenueExTax: p.revenueExTax ?? 0 }));
    const series =
      incomeViewMode === 'daily'
        ? daily
        : (() => {
            let running = 0;
            let runningEx = 0;
            return daily.map((p) => ({
              date: p.date,
              revenue: (running += p.revenue || 0),
              revenueExTax: (runningEx += p.revenueExTax || 0),
            }));
          })();
    return series.map((p) => ({ ...p, dateMs: new Date(p.date).getTime() }));
  }, [data, incomeViewMode]);

  const userChartData = useMemo(() => {
    if (!data) return [] as Array<{ date: string; dateMs: number; userCount: number }>;
    return data.userCountEvolution.map((p) => ({ ...p, dateMs: new Date(p.date).getTime() }));
  }, [data]);

  const incomeRangeMs = useMemo(() => {
    if (!incomeChartData.length) return 1;
    const first = incomeChartData[0].dateMs;
    const last = incomeChartData[incomeChartData.length - 1].dateMs;
    return Math.max(1, last - first);
  }, [incomeChartData]);

  const userRangeMs = useMemo(() => {
    if (!userChartData.length) return 1;
    const first = userChartData[0].dateMs;
    const last = userChartData[userChartData.length - 1].dateMs;
    return Math.max(1, last - first);
  }, [userChartData]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-background/50 backdrop-blur-[24px] border-border">
          <CardHeader>
            <CardTitle>Income</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-52 w-full" />
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-[24px] border-border">
          <CardHeader>
            <CardTitle>User count</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-52 w-full" />
          </CardContent>
        </Card>
        <Card className="bg-background/50 backdrop-blur-[24px] border-border md:col-span-2">
          <CardHeader>
            <CardTitle>User types</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-sm text-red-500">{error ?? 'No analytics available'}</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2 flex items-center gap-2">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">Data source:</span>
          <Select value={source} onValueChange={(v: 'db' | 'paddle') => setSource(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="db">Database (fast, default)</SelectItem>
              <SelectItem value="paddle">Paddle API (live)</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-muted-foreground">Income view:</span>
          <Select value={incomeViewMode} onValueChange={(v: 'daily' | 'cumulative') => setIncomeViewMode(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="cumulative">Cumulative</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">Range:</span>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allHistory} onChange={(e) => setAllHistory(e.target.checked)} />
            All history
          </label>
          {!allHistory && (
            <>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-[160px]" />
              <span className="text-muted-foreground">to</span>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-[160px]" />
            </>
          )}
          <Button
            variant="default"
            size="sm"
            className="ml-2"
            onClick={() => {
              setAppliedAllHistory(allHistory);
              setAppliedFromDate(fromDate);
              setAppliedToDate(toDate);
            }}
          >
            Apply
          </Button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Tooltip content="Backfill pulls recent completed transactions from Paddle into the local payments table. Use this to bootstrap history or repair gaps if webhooks were missed.">
            <Info className="h-4 w-4 text-muted-foreground" />
          </Tooltip>
          <Button
            variant="outline"
            size="sm"
            disabled={backfilling}
            onClick={async () => {
              try {
                setBackfilling(true);
                const res = await fetch('/api/admin/analytics/backfill', { method: 'POST' });
                if (!res.ok) throw new Error('Backfill failed');
                // Refresh data after backfill
                setSource('db');
                setRefreshKey((k) => k + 1);
              } catch {
                // no-op; basic UI
              } finally {
                setBackfilling(false);
              }
            }}
          >
            {backfilling ? 'Backfilling…' : 'Backfill from Paddle'}
          </Button>
        </div>
      </div>
      <Alert className="md:col-span-2 self-start text-xs md:text-sm p-3 bg-muted/30 border-dashed">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <AlertDescription>
          Numbers can differ from Paddle&apos;s dashboard due to: gross vs ex‑tax (we show both), timezone/date range
          differences, refunds/chargebacks and fees (not netted here), currency conversion, and data freshness until
          backfill/webhooks complete.
        </AlertDescription>
      </Alert>
      <Card className="bg-background/50 backdrop-blur-[24px] border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Income ({incomeViewMode === 'daily' ? 'daily' : 'cumulative'})</CardTitle>
            <div className="text-sm text-muted-foreground flex gap-3">
              <span>Gross: {formatCurrency(totalRevenue)}</span>
              <span>Ex‑tax: {formatCurrency(totalRevenueExTax)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={incomeChartData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <XAxis
                dataKey="dateMs"
                type="number"
                scale="time"
                domain={['auto', 'auto']}
                tickCount={6}
                tickMargin={8}
                minTickGap={16}
                tickFormatter={(ms) => formatTimeAxisTick(Number(ms), incomeRangeMs)}
              />
              <YAxis tickFormatter={(v) => `$${v}`} width={56} />
              <RechartsTooltip
                labelFormatter={(label) => `Date: ${formatTooltipDate(Number(label))}`}
                formatter={(value, name) => [formatCurrency(Number(value)), name as string]}
              />
              <Line type="monotone" dataKey="revenue" name="Gross" stroke="#6366F1" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="revenueExTax"
                name="Ex‑tax"
                stroke="#0EA5E9"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-background/50 backdrop-blur-[24px] border-border">
        <CardHeader>
          <CardTitle>User count</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userChartData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <XAxis
                dataKey="dateMs"
                type="number"
                scale="time"
                domain={['auto', 'auto']}
                tickCount={6}
                tickMargin={8}
                minTickGap={16}
                tickFormatter={(ms) => formatTimeAxisTick(Number(ms), userRangeMs)}
              />
              <YAxis width={48} />
              <RechartsTooltip
                labelFormatter={(label) => `Date: ${formatTooltipDate(Number(label))}`}
                formatter={(value, name) => [Number(value), name as string]}
              />
              <Line type="monotone" dataKey="userCount" name="Users" stroke="#22C55E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-background/50 backdrop-blur-[24px] border-border md:col-span-2">
        <CardHeader>
          <CardTitle>User types</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="count" data={data.userTypeDistribution} label={(e) => `${e.type} (${e.count})`}>
                {data.userTypeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <RechartsTooltip
                formatter={(value: number, _name: string, props?: { payload?: { type?: string } }) => [
                  String(value),
                  props?.payload?.type ?? '',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
