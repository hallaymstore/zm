# Qalbim ♡ — Node.js + MongoDB

Mobile-first couples letter platform. This is an independent branch and directory; it does not replace any prior project.

## Features
- +998 phone/password account, bcrypt password hash, Terms + Privacy opt-in and 30-day HTTP-only login cookie.
- Editable profile and avatar, 6 romantic letter themes, up to four uploaded photos per letter, shareable links, reactions.
- Invitation-token based pair connection with explicit acceptance; one partner per account.
- 1-to-1 text chat, recipient-read-then-leave deletion plus 6h/12h/18h/24h TTL retention policies.
- 3-day / 7-day manually administered Pro. Locked photos served only after server-side auth and Pro verification.
- Three Pro-only mini-games, moderator account management, letters, reports, usage statistics and anonymous chat metadata (no chat text in admin UI).
- Uzbek Terms of Use and Privacy Policy.

## Essential environment on Render

NODE_ENV=production
MONGODB_URI=mongodb+srv://your-user:password@cluster.example.mongodb.net/qalbim?retryWrites=true&w=majority
MONGODB_DB=qalbim
JWT_SECRET=long-random-secret-at-least-32-characters
ADMIN_PHONE=admin
ADMIN_PASSWORD=long-unique-password

Optional: ADMIN_TELEGRAM_URL=https://t.me/your_username

**IMPORTANT:** No usable MongoDB URI is shipped with this repository. Registration and MongoDB-dependent actions intentionally return HTTP 503 until a real MongoDB Atlas connection is configured. There is no temporary in-memory account database, to avoid misleading users about data persistence.

## Render service settings
- Type: Web Service / Node
- Root directory: repository root (the build commands change directory)
- Branch: qalbim-node-mongodb
- Build: cd qalbim-api && npm install --omit=dev
- Start: cd qalbim-api && npm start
- Health: GET /api/health
- Persistent storage: MongoDB Atlas (Render filesystem is ephemeral)
- NODE_ENV=production enables secure cookies over HTTPS.

## Admin
Bootstrap account is created when database first connects and ADMIN_PHONE/ADMIN_PASSWORD are set. The default configurable admin identifier is "admin"; normal users must register with Uzbek phone numbers. Visit /admin.html after login. On the admin page set your Telegram username, then grant 3-day/7-day Pro or cancel active plans. Pricing and actual payments are arranged independently with users by Telegram (not processed in app).

## Important safety limitations
- Not end-to-end encrypted. Avoid sharing extremely sensitive content.
- Disappearing messages cannot prevent recipient screenshots.
- The account phone number is NOT SMS verified. SMS OTP should be introduced before production.
- No automated payments, receipts, or refunds are implemented.
- Letters with a share link are visible to anyone who knows the link. Photos flagged private require owner or Pro authorization.
- Published privacy/terms pages are a technical draft, NOT professional legal certification. Provide operator contact, exact prices, data processing/legal compliance review before commercial launch.
- The service needs a MongoDB Atlas cluster and network access list configuration. The connected user must create/authorize the cluster and paste their own URI securely into Render.


## Telegram Mini App — @maktubimbot
Render-only environment secrets (NEVER publish them to GitHub):
- TELEGRAM_BOT_TOKEN=<rotated BotFather token>
- TELEGRAM_WEBHOOK_SECRET=<strong random url-safe secret>
- PUBLIC_BASE_URL=https://qalbim-juftlik.onrender.com

On MongoDB startup the server verifies the bot username using getMe, sets a signed Telegram webhook at:
  https://qalbim-juftlik.onrender.com/api/telegram/webhook
and configures its menu button, bot commands and Mini App URL. Start the bot at https://t.me/maktubimbot and tap the 💌 Qalbim menu. If you want the direct \`?startapp\` link to launch as the main Mini App, configure the Main Mini App URL through @BotFather for this bot.

Mini App auth uses Telegram's HMAC-SHA256 verified initData, fresh auth_date and user's Telegram ID; the first visit asks for a shared phone/password account and explicit Terms/Privacy consent, or linking an existing web account by its password. Later visits automatically authorize that Telegram ID. Both platforms use one MongoDB users collection and one Pro expiry date.

## Hamyon API — ONLY the standalone website
HAMYON_SHOP_ID=<merchant ID>
HAMYON_SHOP_KEY=<rotated merchant key>
The shop settings in @HamyonAPIBot must be configured with:
  prepare_url: https://qalbim-juftlik.onrender.com/api/hamyon/prepare
  complete_url: https://qalbim-juftlik.onrender.com/api/hamyon/complete

Payment creation requires an admin-set 3-day and 7-day price. Default 0 means *disabled, not free*. Web checkout uses /payment/create on hamyon-api.uz. The callback validates merchant MD5 signature, merchant and recorded order/payment/amount, and independently checks paid status with /payment/status. Entitlements are granted only once via a MongoDB transaction. There is no live payment test until merchant callbacks are configured and a real order is paid. Never transfer funds during integration testing without checking the destination/card.

## Telegram Stars — inside Telegram only
Telegram requires digital goods/subscriptions in bots/Mini Apps to be sold exclusively in Telegram Stars (XTR), not Hamyon/UZS. Admin sets stars3 and stars7 separately, default 0 disabled. The Mini App uses createInvoiceLink / openInvoice, receives pre_checkout_query and successful_payment in the signed bot webhook, and credits the same users.proUntil transactionally and idempotently. Support via /paysupport. Telegram Stars flow should be tested using Telegram's test environment before accepting live payments.

## Security
The bot token and merchant credentials were exposed in the user's chat/screenshot during setup. ROTATE both in BotFather and HamyonAPIBot, then replace only Render Environment variable values; never store them in Git. Set a strong unique ADMIN_PASSWORD and configure real prices, support channel, legal operator identity, and data security practices before launching to the public.
