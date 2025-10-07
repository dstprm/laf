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
          <span className={'text-sm leading-[14px]'}>ValuPro</span>
          <span>·</span>
          <a href="/terms" className="hover:underline">
            Términos
          </a>
          <span>·</span>
          <a href="/privacy" className="hover:underline">
            Privacidad
          </a>
          <span>·</span>
          <a href="/contact" className="hover:underline">
            Contacto
          </a>
        </div>
      </div>
    </>
  );
}
