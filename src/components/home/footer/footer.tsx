import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <>
      <Separator className={'footer-border'} />
      <div
        className={
          'flex flex-col justify-center items-center gap-2 text-muted-foreground text-sm leading-[14px] py-[24px]'
        }
      >
        <div className={'flex justify-center items-center gap-2'}>
          <span className={'text-sm leading-[14px]'}>SaaS Template</span>
          <span>·</span>
          <a href="/terms" className="hover:underline">
            Terms
          </a>
          <span>·</span>
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <span>·</span>
          <a href="/contact" className="hover:underline">
            Contact
          </a>
        </div>
      </div>
    </>
  );
}
