# Subscription plan change behavior (Paddle Billing)

Default behavior aligns with Paddle. See code in `src/app/dashboard/subscriptions/actions.ts` and `src/utils/paddle/process-webhook.ts`.

- Trialing swaps: do_not_bill
- Downgrades/annual→monthly: do_not_bill
- Other upgrades: prorated_immediately

Advanced: schedule end-of-term changes via a local `ScheduledPlanChange` table.
