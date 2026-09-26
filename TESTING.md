# ChiyaQuality Manual Regression Checklist

Run this checklist with the deployed Supabase project and at least one admin, one waiter, one kitchen, and one billing account.

- [ ] Admin signs in through the app and remains signed in after browser refresh.
- [ ] Admin creates a menu item, changes availability, uploads an image, and confirms it appears on the waiter/customer menus.
- [ ] Admin creates a table, opens its QR modal, downloads the QR PNG, and scans `/menu/{qr_token}`.
- [ ] Customer QR menu displays the real table code, submits a cart, and creates a `pending_confirmation` order.
- [ ] Waiter sees the customer order without refresh, edits an item quantity, then confirms or rejects it.
- [ ] Customer status changes to Confirmed or Rejected with the rejection reason in Realtime.
- [ ] Waiter confirms an order and the table changes to Preparing.
- [ ] Kitchen receives the KOT without refresh and moves items through Preparing to Ready.
- [ ] Waiter and Billing receive the Ready notification.
- [ ] Billing displays live line items, subtotal, tax, service charge, and total.
- [ ] Waiter Payment QR displays the configured payment image and can mark the bill paid.
- [ ] Billing payment recording closes the session and resets the table to Available everywhere.
- [ ] Billing history contains the paid bill after refresh.
- [ ] Admin report filters update real metrics and CSV export downloads successfully.
- [ ] Refresh each staff role during an active session and confirm the correct home screen is restored.
- [ ] Browser console has no application errors during the complete flow.
