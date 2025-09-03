import { CheckoutHeader } from '@/components/checkout/checkout-header';
import { CheckoutContents } from '@/components/checkout/checkout-contents';
import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserByClerkId } from '@/utils/database/user';

export default async function CheckoutPage() {
  const { userId } = await auth();

  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/login');
  }

  const user = await currentUser();

  // This should not happen since we require authentication, but add safety check
  if (!user?.emailAddresses[0]?.emailAddress) {
    redirect('/login');
  }

  // Check if user has an active subscription
  const userWithCustomer = await getUserByClerkId(userId);
  if (userWithCustomer?.customer) {
    const subscriptions = userWithCustomer.customer.subscriptions || [];
    const hasActiveSubscription = subscriptions.some((sub) =>
      ['active', 'trialing'].includes(sub.subscriptionStatus?.toLowerCase() || ''),
    );

    if (hasActiveSubscription) {
      // Redirect to subscriptions page where plan change is already implemented
      redirect('/dashboard/subscriptions');
    }
  }

  return (
    <div className={'w-full min-h-screen relative overflow-hidden'}>
      <div
        className={'mx-auto max-w-6xl relative px-[16px] md:px-[32px] py-[24px] flex flex-col gap-6 justify-between'}
      >
        <CheckoutHeader />
        <CheckoutContents userEmail={user.emailAddresses[0].emailAddress} />
      </div>
    </div>
  );
}
