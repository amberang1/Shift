# Activate alter AI

The app stays at https://amberang1.github.io/Shift/. The backend is a Firebase HTTPS function in Singapore. No sign-in is required for visitors.

Default model: `gemini-3.5-flash-lite`. It is configurable with the server environment variable `GEMINI_MODEL`. No key belongs in `ai-config.js`.

## Requirements

- A Firebase project on the Blaze plan with a default Firestore database in Native mode.
- A Gemini API key created in Google AI Studio. Prefer a paid API project for production user situations: Google's free tier may use submitted content to improve its products.
- Google Cloud Shell signed into the account that owns the project, with permission to deploy functions and manage secrets.

## Deployment from Cloud Shell

```bash
git clone https://github.com/amberang1/Shift.git alter
cd alter
bash backend/deploy.sh YOUR_FIREBASE_PROJECT_ID
```

The script asks for the key through Firebase's secret prompt. Paste it there, not into chat or GitHub. If Firebase CLI asks for sign-in, finish that account sign-in and rerun. The project needs billing enabled before deployment. The script deploys only the `alter` functions codebase and enables automatic cleanup of quota documents.

After it finishes, send Codex the public HTTPS URL printed for `alterAdvice`. Set that exact URL as `endpoint` in `ai-config.js` and publish that file. It is a public URL, not a secret. Until it is configured, the public app clearly says that custom replies are not connected, and its curated situations continue working.

## Behaviour and cost limits

- Each reply receives the selected ego's server-owned profile and the actual situation.
- Custom egos send only the text fields needed to describe the character; no images or browser backup data.
- At most 2,000 characters for the original situation, 1,000 for each browser follow-up, and three follow-ups per conversation.
- The browser keeps the conversation in memory only; refreshing clears it. Choosing another ego starts a clean answer to the same original situation.
- The function does not log or save conversations. Google processes the messages according to the API project's terms. Firebase still produces normal request logs, so do not put messages in URLs.
- Firestore transactions enforce 300 provider calls per UTC day across the app and 20 per IP address per hour. Failed provider calls count too. These conservative launch limits can be adjusted after observing real usage. CORS is an origin check, not authentication; the global quota is the spending control against direct callers.
- Requests have input/output limits and a timeout. Output is validated before the browser displays it. No automatic retries that might silently multiply paid calls.
- The code is tested with simulated provider responses. Real model writing quality and end-to-end production connectivity must be checked after the key and endpoint are configured.

## Tests

```bash
node --test backend/functions/core.test.mjs
```
