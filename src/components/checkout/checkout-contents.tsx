'use client';

import { PriceSection } from '@/components/checkout/price-section';

import { type Environments, initializePaddle, type Paddle } from '@paddle/paddle-js';
import type { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';
import throttle from 'lodash.throttle';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from '@/contexts/theme-context';

interface PathParams {
  priceId: string;
  [key: string]: string | string[];
}

interface Props {
  userEmail: string;
}

export function CheckoutContents({ userEmail }: Props) {
  const { priceId } = useParams<PathParams>();
  const { isDarkMode } = useTheme();
  // Single-seat checkout: quantity is fixed at 1 to enforce one plan per customer.
  // Potential future improvement (not provided by this template): multi-seat/multitenancy.
  // If you decide to implement it in your own product, you will need to:
  // - Change this to `const [quantity, setQuantity] = useState<number>(1)` and update it from a UI control (see `QuantityField`).
  // - Pass `quantity` and a `handleQuantityChange` callback down to `PriceSection` and `CheckoutLineItems`.
  // - Replace the hardcoded `quantity: 1` in `Checkout.open` with the `quantity` state below.
  // - Update your backend, entitlements, and billing logic to account for seat counts.
  const [quantity] = useState<number>(1);
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutEventsData | null>(null);

  const handleCheckoutEvents = (event: CheckoutEventsData) => {
    setCheckoutData(event);
  };

  const updateItems = useCallback((paddle: Paddle, priceId: string, quantity: number) => {
    const throttledUpdate = throttle(() => {
      paddle.Checkout.updateItems([{ priceId, quantity }]);
    }, 1000);
    throttledUpdate();
  }, []);

  useEffect(() => {
    if (!paddle?.Initialized && process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN && process.env.NEXT_PUBLIC_PADDLE_ENV) {
      // successUrl must be an absolute URL for Paddle validation
      const successUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout/success` : undefined;
      initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
        environment: process.env.NEXT_PUBLIC_PADDLE_ENV as Environments,
        eventCallback: (event) => {
          if (event.data && event.name) {
            handleCheckoutEvents(event.data);
          }
        },
        checkout: {
          settings: {
            variant: 'one-page',
            displayMode: 'inline',
            // Match Paddle checkout theme to the app theme
            theme: isDarkMode ? 'dark' : 'light',
            allowLogout: false,
            frameTarget: 'paddle-checkout-frame',
            frameInitialHeight: 450,
            frameStyle: 'width: 100%; background-color: transparent; border: none',
            ...(successUrl ? { successUrl } : {}),
          },
        },
      }).then(async (paddle) => {
        if (paddle && priceId) {
          setPaddle(paddle);
          paddle.Checkout.open({
            customer: { email: userEmail },
            // Single-seat default: always open with quantity 1.
            // If you implement multi-seat in your own product, pass the `quantity` state instead.
            items: [{ priceId: priceId, quantity: 1 }],
            settings: successUrl
              ? {
                  variant: 'one-page',
                  displayMode: 'inline',
                  theme: isDarkMode ? 'dark' : 'light',
                  allowLogout: false,
                  frameTarget: 'paddle-checkout-frame',
                  frameInitialHeight: 450,
                  frameStyle: 'width: 100%; background-color: transparent; border: none',
                  successUrl,
                }
              : undefined,
          });
        }
      });
    }
  }, [paddle, paddle?.Initialized, priceId, userEmail, isDarkMode]);

  // Re-open the inline checkout when theme changes so embedded UI updates (Paddle does not
  // expose a direct theme update method for an open checkout). This is safe for inline mode
  // and ensures form inputs/text match the current app theme.
  useEffect(() => {
    if (paddle?.Initialized && priceId) {
      const successUrl = typeof window !== 'undefined' ? `${window.location.origin}/checkout/success` : undefined;
      paddle.Checkout.open({
        customer: { email: userEmail },
        items: [{ priceId: priceId, quantity: 1 }],
        settings: successUrl
          ? {
              variant: 'one-page',
              displayMode: 'inline',
              theme: isDarkMode ? 'dark' : 'light',
              allowLogout: false,
              frameTarget: 'paddle-checkout-frame',
              frameInitialHeight: 450,
              frameStyle: 'width: 100%; background-color: transparent; border: none',
              successUrl,
            }
          : undefined,
      });
    }
  }, [isDarkMode, paddle, paddle?.Initialized, priceId, userEmail]);

  useEffect(() => {
    // If you implement quantity changes, this keeps the Paddle checkout in sync with the selected quantity.
    if (paddle && priceId && paddle.Initialized) {
      updateItems(paddle, priceId, quantity);
    }
  }, [paddle, priceId, quantity, updateItems]);

  return (
    <div
      className={
        'rounded-lg md:bg-background/80 md:backdrop-blur-[24px] md:p-10 md:pl-16 md:pt-16 md:min-h-[400px] flex flex-col justify-between relative'
      }
    >
      <div className={'flex flex-col md:flex-row gap-8 md:gap-16'}>
        <div className={'w-full md:w-[400px]'}>
          <PriceSection checkoutData={checkoutData} />
        </div>
        <div className={'min-w-[375px] lg:min-w-[535px]'}>
          <div className={'text-base leading-[20px] font-semibold mb-8'}>Payment details</div>
          <div className={'paddle-checkout-frame'} />
        </div>
      </div>
    </div>
  );
}
