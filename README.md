# BRES — Cloudflare Pages website

A responsive, static landing page for BRES on Stellar. The animated hero uses Three.js from jsDelivr and a custom 3D triangular prism. Hovering over the triangle triggers a multi-colour particle burst. The page also includes a transparent token mark and a SEP-0001 manifest template.

## Before launch

1. Edit `config.js` and set `tradeUrl` to the exact BRES trading-pair URL. The yellow Trade button is intentionally inactive until a real destination is supplied.
2. Edit `.well-known/stellar.toml` (and the root `stellar.toml` copy) and replace the issuer placeholder with the real Stellar issuer public key. Confirm the token code and supply policy. Uncomment the `[[CURRENCIES]]` block once those details are correct.
3. If the token ticker is not `BRES`, update `tokenCode` in `config.js` and `code` in the TOML manifest.

## Deploy to the requested Cloudflare Pages project

This folder is prebuilt static output; no build command is needed. In Cloudflare Dashboard:

1. Open **Workers & Pages** and select the existing Pages project `bresxlm`.
2. Choose **Create a new deployment** (or the equivalent production deployment action for the project).
3. Upload the contents of this folder using Direct Upload / drag and drop. Keep `index.html` at the top level and include the `.well-known` folder.
4. Deploy to production. The expected site URL is `https://bresxlm.pages.dev/`.

Alternatively, from a terminal, authenticate to the correct Cloudflare account and deploy the folder:

```bash
npx wrangler login
npx wrangler pages deploy . --project-name=bresxlm --branch=main
```

Cloudflare Pages Direct Upload documentation: https://developers.cloudflare.com/pages/get-started/direct-upload/

## Stellar manifest

SEP-0001 clients look for `https://bresxlm.pages.dev/.well-known/stellar.toml`. The `_headers` file enables cross-origin access and sets a plain-text content type for the manifest. The root `stellar.toml` is included as a convenience copy.

The actual issuer account, final token supply policy, and trading URL were not supplied, so the manifest's currency entry is deliberately left as a commented template and the Trade button is not pointed at an invented destination. Complete these values before publishing the token metadata as final.
