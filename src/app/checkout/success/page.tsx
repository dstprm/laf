import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

import { currentUser, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function SuccessPage() {
  const { userId } = await auth();

  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/login');
  }

  await currentUser();

  return (
    <main>
      <div className={'relative h-screen overflow-hidden'}>
        <div className={'absolute inset-0 px-6 flex items-center justify-center'}>
          <div className={'flex flex-col items-center text-center text-foreground'}>
            <>
              <Image className={'pb-12 dark:hidden'} src={'/logo.svg'} alt={'Logo'} height={96} width={96} />
              <Image className={'pb-12 hidden dark:block'} src={'/logo-dark.svg'} alt={'Logo'} height={96} width={96} />
            </>
            <h1 className={'text-4xl md:text-[80px] leading-9 md:leading-[80px] font-medium pb-6'}>
              Payment successful
            </h1>
            <p className={'text-lg pb-16 text-muted-foreground'}>
              Success! Your payment is complete, and you&apos;re all set.
            </p>
            <Button variant={'secondary'} asChild={true}>
              <Link href={'/dashboard'}>Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
