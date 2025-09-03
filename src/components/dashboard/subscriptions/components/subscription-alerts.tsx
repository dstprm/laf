import { Subscription } from '@paddle/paddle-node-sdk';
import { Alert } from '@/components/ui/alert';
import dayjs from 'dayjs';

interface Props {
  subscription: Subscription;
}
export function SubscriptionAlerts({ subscription }: Props) {
  if (subscription.status === 'canceled') {
    return (
      <Alert className={'mb-10'}>
        This subscription was canceled on {dayjs(subscription.canceledAt).format('MMM DD, YYYY [at] h:mma')} and is no
        longer active.
      </Alert>
    );
  } else if (
    (subscription.status === 'active' || subscription.status === 'trialing') &&
    subscription.scheduledChange &&
    subscription.scheduledChange.action === 'cancel'
  ) {
    return (
      <Alert variant={'destructive'} className={'mb-10'}>
        <div className="flex items-center justify-between">
          <div>
            This subscription is scheduled to be canceled on{' '}
            {dayjs(subscription.scheduledChange.effectiveAt).format('MMM DD, YYYY [at] h:mma')}
            <div className="text-sm text-muted-foreground mt-1">
              You can resume your subscription anytime before this date using the &quot;Resume subscription&quot;
              button.
            </div>
          </div>
        </div>
      </Alert>
    );
  }
  return null;
}
