# Muhammad Raheel Portfolio

## Files

- `index.html` - page structure and CV-based content
- `styles.css` - responsive visual design
- `script.js` - navigation, reveal effects, and contact-form submission
- `server.js` - Express contact endpoint

## Run locally

1. Run `npm install`.
2. Optionally copy `.env.example` to `.env` and add SMTP credentials to email contact messages.
3. Run `npm start` and open `http://localhost:3000`.

Without SMTP settings, submitted messages are safely saved to `data/messages.json` on the server. Do not deploy that file to a public repository.
