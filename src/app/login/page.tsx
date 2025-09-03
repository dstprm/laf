import { SignIn } from '@clerk/nextjs';

interface Props {
  searchParams: Promise<{ return_url?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const redirectUrl = params.return_url || '/dashboard';

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        redirectUrl={redirectUrl}
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-none',
            headerTitle: 'text-[30px] leading-[36px] font-medium tracking-[-0.6px] text-center',
            headerSubtitle: 'hidden',
            formButtonPrimary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
            footerActionLink: 'text-primary hover:text-primary/80',
            dividerLine: 'bg-border',
            dividerText: 'text-border text-xs font-medium',
            formFieldInput: 'border-border rounded-xs',
            formFieldLabel: 'text-muted-foreground leading-5',
          },
        }}
      />
    </div>
  );
}
