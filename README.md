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

Il flusso principale usa Next.js su Node.js; gli script `*:sites` conservano il precedente percorso vinext.
Per carte, PayPal e bonifici gestiti da Stripe nel checkout seguire [la configurazione dei pagamenti](docs/stripe-setup.md).
Il contenuto principale è in `app/page.tsx`, lo stile in
`app/globals.css` e gli asset del brand in `public/`.
