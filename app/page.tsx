import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { placeholderProducts } from "@/lib/placeholder-products";

export const metadata: Metadata = {
  title: "Lusso Concept Store | Nuovi arrivi",
  description: "Abbigliamento e accessori firmati selezionati da Lusso Concept Store.",
  alternates: { canonical: "/" },
};

const categoryCards = [
  {
    title: "T-shirt",
    note: "Essenziali quotidiani",
    image: "/images/catalog/gucci-logo-embroidered-tshirt.png",
    href: "/shop?categoria=t-shirt",
  },
  {
    title: "Cinture",
    note: "Accessori",
    image: "/images/catalog/gucci-cintura-interlocking-g.png",
    href: "/shop?categoria=cinture",
  },
  {
    title: "Felpe e cardigan",
    note: "Strati leggeri",
    image: "/images/catalog/dior-cardigan-oblique.png",
    href: "/shop?categoria=felpe-e-cardigan",
  },
  {
    title: "Pantaloni",
    note: "Denim e sportswear",
    image: "/images/catalog/dior-cargo-jeans-blue.png",
    href: "/shop?categoria=pantaloni",
  },
  {
    title: "Camicie e polo",
    note: "Maniche corte",
    image: "/images/catalog/gucci-gg-silk-jacquard-bowling-shirt-black.png",
    href: "/shop?categoria=camicie-e-polo",
  },
  {
    title: "Giacche",
    note: "Strati esterni",
    image: "/images/catalog/burberry-check-hooded-jacket.png",
    href: "/shop?categoria=giacche",
  },
];

const featuredProducts = placeholderProducts.slice(-6).reverse();

export default function Home() {
  return (
    <div id="top" className="simple-home">
      <StoreHeader />

      <main>

      <section className="lusso-hero">
        <div className="lusso-hero-visual">
          <Image
            src="/images/lusso-concept-store-hero.png"
            alt="Interno di Lusso Concept Store con pareti in marmo chiaro, arredi neri e insegna luminosa"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 62vw"
          />
        </div>
        <div className="lusso-hero-copy">
          <p className="lusso-hero-index">Concept store · Italia</p>
          <div>
            <p className="simple-eyebrow">La nuova selezione</p>
            <h1>Lusso,<br />con semplicità.</h1>
            <p>Abbigliamento e accessori firmati, scelti con cura e presentati in modo chiaro.</p>
            <div className="simple-actions">
              <Link className="simple-button simple-button-light" href="/shop">Scopri lo shop</Link>
              <Link className="lusso-text-link" href="#categorie">Esplora le categorie <span>↘</span></Link>
            </div>
          </div>
          <p className="lusso-hero-foot">Marchi selezionati · Foto reali · Assistenza diretta</p>
        </div>
      </section>

      <section className="simple-benefits" aria-label="Servizi del negozio">
        <p>Spedizione in tutta Italia</p>
        <p>Assistenza prima dell’acquisto</p>
        <p>Foto reali dei prodotti</p>
      </section>

      <section className="simple-section" id="categorie" aria-labelledby="categories-title">
        <div className="simple-section-heading">
          <div>
            <p className="simple-eyebrow">Categorie</p>
            <h2 id="categories-title">Trova subito quello che cerchi.</h2>
          </div>
          <Link href="/shop">Vedi tutto <span>→</span></Link>
        </div>
        <div className="simple-category-grid">
          {categoryCards.map((category) => (
            <Link className="simple-category-card" href={category.href} key={category.title}>
              <div>
                <Image src={category.image} alt="" fill sizes="(max-width: 720px) 100vw, 33vw" />
              </div>
              <p>{category.note}</p>
              <h3>{category.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="simple-section simple-products" aria-labelledby="arrivals-title">
        <div className="simple-section-heading">
          <div>
            <p className="simple-eyebrow">Appena arrivati</p>
            <h2 id="arrivals-title">Gli ultimi arrivi.</h2>
          </div>
          <Link href="/shop">Vai allo shop <span>→</span></Link>
        </div>
        <div className="simple-product-grid">
          {featuredProducts.map((product) => (
            <article className="simple-product-card" key={product.id}>
              <Link href={`/prodotto/${product.slug}`}>
                <div className="simple-product-media">
                  <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 720px) 100vw, 33vw" />
                </div>
                <div className="simple-product-copy">
                  <p>{product.brand}</p>
                  <h3>{product.name}</h3>
                  <span>Prezzo da definire</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="simple-note" id="provenienza">
        <p className="simple-eyebrow">Informazioni sui prodotti</p>
        <h2>Schede chiare, prima dell’acquisto.</h2>
        <p>Nomi e descrizioni sono stati ricostruiti confrontando i modelli presenti nei cataloghi dei marchi. Prezzi, taglie, composizione, condizioni e autenticità verranno verificati e completati prima della vendita.</p>
      </section>

      <section className="simple-newsletter" id="private-list">
        <div>
          <p className="simple-eyebrow">Aggiornamenti</p>
          <h2>Nuovi arrivi, senza rumore.</h2>
        </div>
        <div>
          <p>Lascia la tua email per sapere quando aggiungiamo nuovi prodotti e quando saranno disponibili i prezzi.</p>
          <NewsletterForm />
        </div>
      </section>

      </main>

      <StoreFooter />
    </div>
  );
}
