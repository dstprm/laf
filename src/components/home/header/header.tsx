'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LightDarkToggle } from '@/components/ui/light-dark-toggle';
import { Menu } from 'lucide-react';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { SignInButton } from '@clerk/nextjs';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Props {
  user: User | null;
}

export default function Header({ user }: Props) {
  const [isStuck, setIsStuck] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const hrefFor = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  useEffect(() => {
    const sentinel = document.getElementById('nav-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // When the sentinel leaves the viewport (scrolled past top), we become stuck
        setIsStuck(!entry.isIntersecting);
      },
      { root: null, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      const lastY = lastScrollYRef.current;
      const isScrollingDown = currentY > lastY + 6;
      const isScrollingUp = currentY < lastY - 6;
      lastScrollYRef.current = currentY;

      if (!isStuck) {
        setIsHidden(false);
        return;
      }
      if (currentY <= 8) {
        setIsHidden(false);
        return;
      }
      if (isScrollingDown) setIsHidden(true);
      else if (isScrollingUp) setIsHidden(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isStuck]);

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 transition-transform duration-300',
        isHidden ? '-translate-y-full' : 'translate-y-0',
        isStuck ? 'backdrop-blur bg-background/70 border-b border-border' : 'bg-transparent',
      )}
    >
      <div
        className={cn(
          'mx-auto max-w-7xl relative px-4 sm:px-6 md:px-8 flex items-center justify-between',
          isStuck ? 'py-2 md:py-3' : 'py-[14px] md:py-[18px]',
        )}
      >
        <div className="flex flex-1 items-center justify-start">
          <Link className="flex items-center" href={'/'}>
            <>
              <Image className="block dark:hidden" src="/logo.svg" width={180} height={42} alt="Ready to SaaS" />
              <Image className="hidden dark:block" src="/logo-dark.svg" width={180} height={42} alt="Ready to SaaS" />
            </>
          </Link>
        </div>
        <div className="hidden md:flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <Link href={hrefFor('features')} className="hover:text-foreground">
            Características
          </Link>
          <Link href={hrefFor('services')} className="hover:text-foreground">
            Servicios
          </Link>
          <Link href={hrefFor('how-it-works')} className="hover:text-foreground">
            Cómo funciona
          </Link>
          <Link href={hrefFor('faq')} className="hover:text-foreground">
            FAQ
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <div className="hidden md:flex items-center space-x-4">
            <LightDarkToggle />
            {user?.id ? (
              <Button variant={'secondary'} asChild={true}>
                <Link href={'/dashboard'}>Panel</Link>
              </Button>
            ) : (
              <Button asChild={true} variant={'secondary'}>
                {/* If you want to use the login page, uncomment the following line and comment out the SignInButton */}
                {/* <Link href={'/login'}>Sign in</Link> */}
                <SignInButton mode="modal">Iniciar sesión</SignInButton>
              </Button>
            )}
          </div>
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-xs" onCloseAutoFocus={(e) => e.preventDefault()}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Menú</span>
                  <LightDarkToggle />
                </div>
                <div className="mt-6 grid gap-2 text-sm">
                  <SheetClose asChild>
                    <Link
                      href={hrefFor('features')}
                      className="rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground"
                    >
                      Características
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href={hrefFor('services')}
                      className="rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground"
                    >
                      Servicios
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href={hrefFor('how-it-works')}
                      className="rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground"
                    >
                      Cómo funciona
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href={hrefFor('faq')}
                      className="rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground"
                    >
                      FAQ
                    </Link>
                  </SheetClose>
                </div>
                <div className="mt-6">
                  {user?.id ? (
                    <SheetClose asChild>
                      <Button className="w-full" asChild>
                        <Link href={'/dashboard'}>Panel</Link>
                      </Button>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Button className="w-full" asChild>
                        {/* If you want to use the login page, uncomment the following line and comment out the SignInButton */}
                        {/* <Link href={'/login'}>Sign in</Link> */}
                        <SignInButton mode="modal">Iniciar sesión</SignInButton>
                      </Button>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
