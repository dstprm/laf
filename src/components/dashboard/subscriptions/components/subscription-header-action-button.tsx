'use client';

import { cancelSubscription, resumeSubscription } from '@/app/dashboard/subscriptions/actions';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CircleAlert, CircleCheck, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Confirmation } from '@/components/shared/confirmation/confirmation';
import { Subscription } from '@paddle/paddle-node-sdk';
import { invalidateTierCache } from '@/hooks/useUserTier';

interface Props {
  subscription: Subscription;
}

export function SubscriptionHeaderActionButton({ subscription }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isResumeModalOpen, setResumeModalOpen] = useState(false);

  // Check if subscription has a scheduled cancellation
  const hasScheduledCancellation = subscription.scheduledChange && subscription.scheduledChange.action === 'cancel';

  // Debug logging to understand subscription state
  console.log('🔍 Subscription Debug Info:', {
    subscriptionId: subscription.id,
    status: subscription.status,
    scheduledChange: subscription.scheduledChange,
    hasScheduledCancellation,
    fullSubscription: subscription,
  });

  function handleCancelSubscription() {
    setModalOpen(false);
    setLoading(true);
    cancelSubscription(subscription.id)
      .then(() => {
        toast({
          description: (
            <div className={'flex items-center gap-3'}>
              <CircleCheck size={20} color={'#25F497'} />
              <div className={'flex flex-col gap-1'}>
                <span className={'text-primary font-medium test-sm leading-5'}>Cancellation scheduled</span>
                <span className={'text-muted-foreground test-sm leading-5'}>
                  Subscription scheduled to cancel at the end of the billing period.
                </span>
              </div>
            </div>
          ),
        });

        // Invalidate tier cache and force refresh after cancel to show updated state
        invalidateTierCache();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(() => {
        toast({
          description: (
            <div className={'flex items-start gap-3'}>
              <CircleAlert size={20} color={'#F42566'} />
              <div className={'flex flex-col gap-1'}>
                <div className={'text-primary font-medium test-sm leading-5'}>Error</div>
                <div className={'text-muted-foreground test-sm leading-5'}>
                  Something went wrong, please try again later
                </div>
              </div>
            </div>
          ),
        });
      })
      .finally(() => setLoading(false));
  }

  function handleResumeSubscription() {
    setResumeModalOpen(false);
    setLoading(true);
    resumeSubscription(subscription.id)
      .then(() => {
        toast({
          description: (
            <div className={'flex items-center gap-3'}>
              <CircleCheck size={20} color={'#25F497'} />
              <div className={'flex flex-col gap-1'}>
                <span className={'text-primary font-medium test-sm leading-5'}>Subscription resumed</span>
                <span className={'text-muted-foreground test-sm leading-5'}>
                  Your subscription will continue as normal.
                </span>
              </div>
            </div>
          ),
        });

        // Invalidate tier cache and force refresh after resume to show updated state
        invalidateTierCache();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(() => {
        toast({
          description: (
            <div className={'flex items-start gap-3'}>
              <CircleAlert size={20} color={'#F42566'} />
              <div className={'flex flex-col gap-1'}>
                <div className={'text-primary font-medium test-sm leading-5'}>Error</div>
                <div className={'text-muted-foreground test-sm leading-5'}>
                  Something went wrong, please try again later
                </div>
              </div>
            </div>
          ),
        });
      })
      .finally(() => setLoading(false));
  }

  // Don't show any action buttons for already canceled subscriptions
  if (subscription.status === 'canceled') {
    return null;
  }

  return (
    <>
      {hasScheduledCancellation ? (
        // Show resume button if cancellation is scheduled
        <Button
          disabled={loading}
          onClick={() => setResumeModalOpen(true)}
          size={'sm'}
          variant={'outline'}
          className={'flex gap-2 text-sm rounded-sm border-green-500 text-green-600 hover:bg-green-50'}
        >
          <RotateCcw size={16} />
          Resume subscription
        </Button>
      ) : (
        // Show cancel button for active subscriptions
        <Button
          disabled={loading}
          onClick={() => setModalOpen(true)}
          size={'sm'}
          variant={'outline'}
          className={'flex gap-2 text-sm rounded-sm border-border'}
        >
          Cancel subscription
        </Button>
      )}

      {/* Cancel Confirmation Modal */}
      <Confirmation
        description={
          'This subscription will be scheduled to cancel at the end of the billing period. You can resume it anytime before then.'
        }
        title={'Cancel subscription?'}
        onClose={() => setModalOpen(false)}
        isOpen={isModalOpen}
        onConfirm={handleCancelSubscription}
        actionText={'Cancel subscription'}
        actionVariant={'destructive'}
      />

      {/* Resume Confirmation Modal */}
      <Confirmation
        description={'This will remove the scheduled cancellation and your subscription will continue as normal.'}
        title={'Resume subscription?'}
        onClose={() => setResumeModalOpen(false)}
        isOpen={isResumeModalOpen}
        onConfirm={handleResumeSubscription}
        actionText={'Resume subscription'}
        actionVariant={'default'}
      />
    </>
  );
}
