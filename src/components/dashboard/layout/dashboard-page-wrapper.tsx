import { ReactNode } from 'react';

interface DashboardPageWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component for dashboard pages that provides consistent padding and layout.
 * Use this to wrap the content of all dashboard pages to ensure consistent spacing.
 */
export function DashboardPageWrapper({ children }: DashboardPageWrapperProps) {
  return <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-8">{children}</main>;
}
