// Quantity UI is intentionally disabled by default to enforce one plan per customer.
// This template does not provide multi-seat/multitenancy. If you choose to implement it in your own product,
// you can re-enable this import and the `<QuantityField />` usage below and plumb the props from `CheckoutContents`.
// import { QuantityField } from '@/components/checkout/quantity-field';
import { Separator } from '@/components/ui/separator';
import { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';
import { formatMoney } from '@/utils/paddle/parse-money';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingTextProps {
  value: number | undefined;
  currencyCode: string | undefined;
}

function LoadingText({ value, currencyCode }: LoadingTextProps) {
  if (value === undefined) {
    return <Skeleton className="h-[20px] w-[75px] bg-border" />;
  } else {
    return formatMoney(value, currencyCode);
  }
}

interface Props {
  checkoutData: CheckoutEventsData | null;
  // Potential future improvement (not provided by this template): multi-seat/multitenancy.
  // If you implement it, add these props and thread them from `CheckoutContents`:
  // quantity: number;
  // handleQuantityChange: (quantity: number) => void;
}

export function CheckoutLineItems({ checkoutData }: Props) {
  return (
    <>
      <div className={'md:pt-12 text-base leading-[20px] font-medium'}>{checkoutData?.items[0].price_name}</div>
      {/* If you implement multi-seat/multitenancy, show the quantity selector next to the item name: */}
      {/* <QuantityField quantity={quantity} handleQuantityChange={handleQuantityChange} /> */}
      <Separator className={'bg-border/50 mt-6'} />
      <div className={'pt-6 flex justify-between'}>
        <span className={'text-base leading-[20px] font-medium text-muted-foreground'}>Subtotal</span>
        <span className={'text-base leading-[20px] font-semibold'}>
          <LoadingText currencyCode={checkoutData?.currency_code} value={checkoutData?.totals.subtotal} />
        </span>
      </div>
      <div className={'pt-6 flex justify-between'}>
        <span className={'text-base leading-[20px] font-medium text-muted-foreground'}>Tax</span>
        <span className={'text-base leading-[20px] font-semibold'}>
          <LoadingText currencyCode={checkoutData?.currency_code} value={checkoutData?.totals.tax} />
        </span>
      </div>
      <Separator className={'bg-border/50 mt-6'} />
      <div className={'pt-6 flex justify-between'}>
        <span className={'text-base leading-[20px] font-medium text-muted-foreground'}>Due today</span>
        <span className={'text-base leading-[20px] font-semibold'}>
          <LoadingText currencyCode={checkoutData?.currency_code} value={checkoutData?.totals.total} />
        </span>
      </div>
    </>
  );
}
