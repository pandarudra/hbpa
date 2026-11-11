import app from './app';
import { env } from './config/env';

// Firebase is initialised lazily on first import of config/firebase.ts
// If credentials are invalid the server will crash on first auth request —
// that's intentional (fail fast rather than silently accept bad config).

app.listen(env.PORT, () => {
  console.log(`✅  HBP backend running on port ${env.PORT} [${env.NODE_ENV}]`);
  console.log(`    Allowed domains: ${env.ALLOWED_EMAIL_DOMAINS.join(', ')}`);
});
