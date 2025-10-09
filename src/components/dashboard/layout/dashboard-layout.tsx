import Link from 'next/link';
import Image from 'next/image';
import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import '../../../styles/dashboard.css';
import { Sidebar } from '@/components/dashboard/layout/sidebar';
import { SidebarUserInfo } from '@/components/dashboard/layout/sidebar-user-info';

interface Props {
  children: ReactNode;
}

export function DashboardLayout({ children }: Props) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] relative overflow-hidden">
      <div className="hidden border-r md:block relative">
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center pt-8 pl-6 pb-10">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <>
                <Image className={'dark:hidden'} src={'/logo.svg'} alt={'SaaS Template'} width={131} height={28} />
                <Image
                  className={'hidden dark:block'}
                  src={'/logo-dark.svg'}
                  alt={'SaaS Template'}
                  width={131}
                  height={28}
                />
              </>
            </Link>
          </div>
          <div className="flex flex-col grow">
            <Sidebar />
            <SidebarUserInfo />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        {/* Mobile top bar with hamburger */}
        <div className="md:hidden sticky top-0 z-40 border-b bg-background">
          <div className="h-14 flex items-center justify-between px-4">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  aria-label="Abrir menú"
                  className="inline-flex items-center justify-center p-2 rounded-md border"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <div className="flex items-center gap-2 font-semibold px-6 pt-8 pb-6 border-b">
                  <Link href="/" className="flex items-center gap-2">
                    <Image className={'dark:hidden'} src={'/logo.svg'} alt={'SaaS Template'} width={131} height={28} />
                    <Image
                      className={'hidden dark:block'}
                      src={'/logo-dark.svg'}
                      alt={'SaaS Template'}
                      width={131}
                      height={28}
                    />
                  </Link>
                </div>
                <div className="flex flex-col h-[calc(100%-70px)]">
                  <div className="flex-1 overflow-y-auto px-2 pt-4">
                    <Sidebar />
                  </div>
                  <div className="border-t px-2 pt-2 pb-6">
                    <SidebarUserInfo />
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image className={'dark:hidden'} src={'/logo.svg'} alt={'SaaS Template'} width={100} height={22} />
              <Image
                className={'hidden dark:block'}
                src={'/logo-dark.svg'}
                alt={'SaaS Template'}
                width={100}
                height={22}
              />
            </Link>
            <span className="w-9" />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
