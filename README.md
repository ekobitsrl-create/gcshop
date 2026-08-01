# Luxury Concept Store

Storefront editoriale per **Luxury Concept Store**, sviluppato per Ekobit SRL.

## Identità

- Brand: Luxury Concept Store
- Società: Ekobit SRL
- P. IVA: 02424510796
- Sede: Via Firenze 185, 88900 Crotone (KR)
- Telefono: +39 338 134 6675
- Email: info@ekobit.it

## Sviluppo

Richiede Node.js 22.13 o successivo.

```bash
pnpm install
pnpm dev
pnpm build
node --test tests/rendered-html.test.mjs
```

Il progetto utilizza vinext ed è predisposto per il deploy su Cloudflare tramite
OpenAI Sites. Il contenuto principale è in `app/page.tsx`, lo stile in
`app/globals.css` e gli asset del brand in `public/`.
