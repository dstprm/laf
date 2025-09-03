import { CheckoutLineItems } from '@/components/checkout/checkout-line-items';
import { CheckoutPriceContainer } from '@/components/checkout/checkout-price-container';
import { CheckoutPriceAmount } from '@/components/checkout/checkout-price-amount';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { CheckoutEventsData } from '@paddle/paddle-js/types/checkout/events';

interface Props {
  checkoutData: CheckoutEventsData | null;
  // Potential future improvement (not provided by this template): multi-seat/multitenancy.
  // If you implement it, plumb these props through from `CheckoutContents` into `CheckoutLineItems`:
  // quantity: number;
  // handleQuantityChange: (quantity: number) => void;
}

export function PriceSection({ checkoutData }: Props) {
  return (
    <>
      <div className={'hidden md:block'}>
        <CheckoutPriceContainer checkoutData={checkoutData} />
        <CheckoutLineItems
          checkoutData={checkoutData}
          // If you implement multi-seat/multitenancy, pass the props below to render the quantity UI:
          // quantity={quantity}
          // handleQuantityChange={handleQuantityChange}
        />
      </div>
      <div className={'block md:hidden'}>
        <CheckoutPriceAmount checkoutData={checkoutData} />
        <Separator className={'relative bg-border/50 mt-6'} />
        <Accordion type="single" collapsible>
          <AccordionItem className={'border-none'} value="item-1">
            <AccordionTrigger className={'text-muted-foreground no-underline!'}>Order summary</AccordionTrigger>
            <AccordionContent className={'pb-0'}>
              <CheckoutLineItems
                checkoutData={checkoutData}
                // If you implement multi-seat/multitenancy, pass the props below to render the quantity UI:
                // quantity={quantity}
                // handleQuantityChange={handleQuantityChange}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
