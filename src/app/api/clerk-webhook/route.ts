/**
 * Clerk Webhook Endpoint
 *
 * Events handled: user.created, user.updated, session.created
 * Auth/Verification: Svix signature headers (svix-id, svix-timestamp, svix-signature)
 * Env required: CLERK_WEBHOOK_SECRET (webhook signing secret from Clerk dashboard)
 * Side effects:
 * - Upserts local User records
 * - Sends welcome email for new users
 * - Triggers subscription sync on login (session.created)
 */
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { upsertUser } from '@/utils/database/user';
import { syncSubscriptionsForUser } from '@/utils/database/sync-subscriptions';
import { sendWelcomeEmail } from '@/utils/email/send-email';

interface ClerkUserData {
  id: string;
  email_addresses: Array<{ id: string; email_address: string }>;
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface ClerkSessionData {
  user_id: string;
}

export async function POST(req: Request) {
  if (!checkRateLimit(req, { bucketId: 'clerk_webhook', maxRequests: 120, refillMs: 60_000 })) {
    return new Response('Too many requests', { status: 429 });
  }
  console.log('Clerk webhook received');
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  console.log('Webhook verified');

  console.log('Webhook data:', evt.data);

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Processing event: ${eventType}`);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    await handleUserEvent(evt.data, eventType === 'user.created');
  } else if (eventType === 'session.created') {
    await handleSessionEvent(evt.data);
  } else {
    console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response('Success', { status: 200 });
}

async function handleUserEvent(userData: ClerkUserData, isNewUser: boolean = false) {
  const { id, email_addresses, first_name, last_name, image_url } = userData;

  // Get primary email
  const primaryEmail = email_addresses.find((email) => email.id === userData.primary_email_address_id);

  if (primaryEmail?.email_address) {
    try {
      await upsertUser({
        clerkUserId: id,
        email: primaryEmail.email_address,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        avatar: image_url || undefined,
      });

      console.log(`✅ Synced user from user event: ${primaryEmail.email_address}`);

      // Send welcome email for new users
      if (isNewUser) {
        try {
          await sendWelcomeEmail({
            to: primaryEmail.email_address,
            firstName: first_name || undefined,
          });
          console.log(`✅ Welcome email sent to: ${primaryEmail.email_address}`);
        } catch (emailError) {
          console.error('❌ Error sending welcome email:', emailError);
          // Don't throw here - we don't want email failures to break user creation
        }
      }
    } catch (error) {
      console.error('❌ Error syncing user from user event:', error);
      throw error;
    }
  }
}

async function handleSessionEvent(sessionData: ClerkSessionData) {
  const { user_id } = sessionData;

  if (!user_id) {
    console.log('No user_id in session data');
    return;
  }

  try {
    // Fetch full user data from Clerk (v6 server export returns a promise client)
    const client = await clerkClient();
    const user = await client.users.getUser(user_id);

    // Get primary email
    const primaryEmail = user.emailAddresses.find((email: { id: string }) => email.id === user.primaryEmailAddressId);

    if (primaryEmail?.emailAddress) {
      await upsertUser({
        clerkUserId: user.id,
        email: primaryEmail.emailAddress,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        avatar: user.imageUrl || undefined,
      });

      console.log(`✅ Synced user from session event: ${primaryEmail.emailAddress}`);

      // SUBSCRIPTION SYNC ON LOGIN: Run subscription sync in background
      // This ensures subscription data is fresh when user logs in
      syncSubscriptionsForUser(user.id, 0).catch((error) => {
        console.error('Background subscription sync failed on login:', error);
      });
    }
  } catch (error) {
    console.error('❌ Error syncing user from session event:', error);
    throw error;
  }
}
