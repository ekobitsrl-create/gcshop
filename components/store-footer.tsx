import Link from "next/link";
import { catalogCategories } from "@/lib/catalog";

export function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link className="store-wordmark store-wordmark-light" href="/">
            <strong>Lusso</strong><span>Concept store</span>
          </Link>
          <p>Abbigliamento e accessori firmati, selezionati con cura e presentati con informazioni semplici e chiare.</p>
        </div>
        <div className="footer-links">
          <p>Shop</p>
          <Link href="/shop">Tutti i prodotti</Link>
          {catalogCategories.map((category) => (
            <Link href={`/shop?categoria=${category.slug}`} key={category.slug}>{category.name}</Link>
          ))}
        </div>
        <div className="footer-links">
          <p>Informazioni</p>
          <Link href="/#provenienza">Prodotti e verifiche</Link>
          <Link href="/contatti">Contatti e assistenza</Link>
          <Link href="/spedizioni-e-resi">Spedizioni e resi</Link>
          <Link href="/informazioni-societarie">Informazioni societarie</Link>
          <Link href="/admin">Area riservata</Link>
        </div>
      </div>

      <div className="footer-legal">
        <span>© 2026 Lusso Concept Store</span>
        <div><Link href="/privacy">Privacy</Link><Link href="/cookie-policy">Cookie</Link><Link href="/termini-e-condizioni">Termini</Link><Link href="/informazioni-societarie">Società</Link></div>
        <a href="#top">Torna su ↑</a>
      </div>
    </footer>
  );
}
