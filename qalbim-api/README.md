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
