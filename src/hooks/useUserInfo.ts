// commment
import { useUser } from '@clerk/nextjs';

export function useUserInfo() {
  const { user, isLoaded } = useUser();

  return {
    user: user
      ? {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          user_metadata: {
            full_name: user.fullName || undefined,
          },
        }
      : null,
    isLoaded,
  };
}
