import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="footer-statement">
        <p>LCS Vision / Virtual Try-On</p>
        <h2>See the look.<br /><em>Make it yours.</em></h2>
        <Link href="/try-on">Scopri il progetto AR <span>↗</span></Link>
      </div>

      <div className="footer-grid">
        <Link className="store-wordmark store-wordmark-light" href="/">
          <strong>LCS</strong><span>Selected edit</span>
        </Link>
        <div className="footer-links">
          <p>Shop</p>
          <Link href="/shop">New in</Link>
          <Link href="/shop?categoria=donna">Donna</Link>
          <Link href="/shop?categoria=uomo">Uomo</Link>
          <Link href="/shop?categoria=accessori">Accessori</Link>
          <Link href="/try-on">Virtual Try-On</Link>
        </div>
        <div className="footer-links">
          <p>Assistenza</p>
          <Link href="/#provenienza">Provenienza e autenticità</Link>
          <a href="mailto:info@ekobit.it">Contattaci</a>
          <Link href="/checkout">Spedizioni e resi</Link>
          <Link href="/checkout">Pagamenti</Link>
          <Link href="/admin">Area riservata</Link>
        </div>
        <address className="footer-links footer-company">
          <p>Ekobit SRL</p>
          <span>P. IVA 02424510796</span>
          <span>Via Firenze 185</span>
          <span>88900 KR</span>
          <a href="tel:+393381346675">+39 338 134 6675</a>
          <a href="mailto:info@ekobit.it">info@ekobit.it</a>
        </address>
      </div>

      <div className="footer-legal">
        <span>© 2026 Ekobit SRL</span>
        <div><Link href="/">Privacy</Link><Link href="/">Cookie</Link><Link href="/">Termini</Link></div>
        <a href="#top">Torna su ↑</a>
      </div>
    </footer>
  );
}
