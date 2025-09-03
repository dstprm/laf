import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/utils/database/user';

export async function getCustomerId() {
  const { userId } = await auth();

  if (!userId) {
    return '';
  }

  const user = await getUserByClerkId(userId);
  if (user?.customer?.paddleCustomerId) {
    return user.customer.paddleCustomerId;
  }

  return '';
}
