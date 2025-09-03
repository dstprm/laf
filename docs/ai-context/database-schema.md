Database Schema

### User

- id: String
- clerkUserId: String
- email: String
- firstName: String?
- lastName: String?
- avatar: String?
- isAdmin: Boolean
- overrideTier: String?
- overrideExpiresAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
- customer: Customer?

### Customer

- id: String
- paddleCustomerId: String
- userId: String
- currentTier: String?
- overrideTier: String?
- overrideExpiresAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
- user: User
- subscriptions: Subscription[]
- payments: Payment[]

### Subscription

- subscriptionId: String
- subscriptionStatus: String
- priceId: String?
- productId: String?
- scheduledChange: String?
- customerId: String
- createdAt: DateTime
- updatedAt: DateTime
- customer: Customer

### Payment

- id: String
- paddleTransactionId: String
- paddleCustomerId: String
- customerId: String?
- subscriptionId: String?
- amount: Float
- subtotal: Float
- tax: Float
- currency: String
- status: String
- createdAt: DateTime
- updatedAt: DateTime
- customer: Customer?

### ContactRequest

- id: String
- name: String
- email: String
- subject: String?
- message: String
- source: String?
- userAgent: String?
- ipAddress: String?
- createdAt: DateTime
