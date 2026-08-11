import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="footer-statement">
        <p>The next edit / Private access</p>
        <h2>Arriva prima.<br /><em>Scegli meglio.</em></h2>
        <Link href="/#private-list">Entra nella lista <span>↗</span></Link>
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
        </div>
        <div className="footer-links">
          <p>Assistenza</p>
          <Link href="/#provenienza">Provenienza e autenticità</Link>
          <Link href="/informazioni-societarie">Contatti</Link>
          <Link href="/checkout">Spedizioni e resi</Link>
          <Link href="/checkout">Pagamenti</Link>
          <Link href="/admin">Area riservata</Link>
        </div>
        <div className="footer-links footer-company">
          <p>Private list</p>
          <span>Nuovi arrivi e selezioni riservate, solo quando conta.</span>
          <Link href="/#private-list">Richiedi accesso</Link>
          <Link href="/informazioni-societarie">Informazioni societarie</Link>
        </div>
      </div>

      <div className="footer-legal">
        <span>© 2026 LCS</span>
        <div><Link href="/">Privacy</Link><Link href="/">Cookie</Link><Link href="/">Termini</Link><Link href="/informazioni-societarie">Società</Link></div>
        <a href="#top">Torna su ↑</a>
      </div>
    </footer>
  );
}
