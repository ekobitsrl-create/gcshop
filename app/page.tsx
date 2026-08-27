import Image from "next/image";
import type { Metadata } from "next";
import { NewsletterForm } from "@/components/newsletter-form";
import { StoreFooter } from "@/components/store-footer";
import { StoreHeader } from "@/components/store-header";
import { translate } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return { title: "LCS | The Selected Edit", description: translate(locale, "home.description"), alternates: { canonical: "/" } };
}

export default async function Home() {
  const locale = await getRequestLocale();
  const t = (key: string) => translate(locale, key);
  const categories = [
    { index: "01", title: t("common.woman"), slug: "donna", note: t("home.womanNote"), image: "/images/category-woman.jpg", position: "center" },
    { index: "02", title: t("common.man"), slug: "uomo", note: t("home.manNote"), image: "/images/category-man.jpg", position: "center" },
    { index: "03", title: t("common.accessories"), slug: "accessori", note: t("home.accessoriesNote"), image: "/images/category-accessories.jpg", position: "center" },
  ];
  return (
    <main id="top" className="home-page">
      <StoreHeader />

      <section className="new-hero">
        <div className="hero-copy-panel">
          <p className="micro-label">LCS / Edit 01</p>
          <h1>{t("home.heroTitle")}<br /><em>{t("home.heroEmphasis")}</em></h1>
          <div className="hero-copy-bottom">
            <p>{t("home.heroCopy")}</p>
            <div className="hero-commerce-actions">
              <a className="hero-shop-link" href="/shop?categoria=donna">{t("home.shopWoman")} <span>↗</span></a>
              <a className="hero-shop-link" href="/shop?categoria=uomo">{t("home.shopMan")} <span>↗</span></a>
              <a className="hero-text-link" href="/shop">{t("home.exploreEdit")} <span>→</span></a>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <Image src="/images/editorial.jpg" alt={t("home.editorialAlt")} fill priority sizes="(max-width: 820px) 100vw, 58vw" />
          <div className="hero-visual-tag"><span>The edit</span><strong>01</strong></div>
          <p>{t("home.formMatterCharacter")}</p>
        </div>

        <div className="hero-side-note" aria-hidden="true">{t("home.sideNote")}</div>
      </section>

      <section className="ticker" aria-label={t("home.storeValues")}>
        <div>{t("common.newIn")} <span>✦</span> {t("common.woman")} <span>✦</span> {t("common.man")} <span>✦</span> {t("common.accessories")} <span>✦</span> {t("common.privateList")} <span>✦</span></div>
      </section>

      <section className="manifesto" id="manifesto">
        <div className="manifesto-label"><span>01</span><p>{t("common.manifesto")}</p></div>
        <div className="manifesto-copy">
          <p className="micro-label">{t("home.manifestoEyebrow")}</p>
          <h2>{t("home.manifestoTitle")}<br />{t("home.manifestoEmphasis")}</h2>
          <p className="manifesto-lead">{t("home.manifestoLead")}</p>
          <div className="manifesto-detail">
            <p>{t("home.manifestoCopy")}</p>
            <span>LCS / EDIT 01</span>
          </div>
        </div>
      </section>

      <section className="category-story" aria-labelledby="category-title">
        <div className="category-heading">
          <div><span>02</span><p>{t("home.attitude")}</p></div>
          <h2 id="category-title">{t("home.perspectives")}<br /><em>{t("home.oneInstinct")}</em></h2>
        </div>
        <div className="category-mosaic">
          {categories.map((category) => (
            <a href={`/shop?categoria=${category.slug}`} className="category-tile" key={category.slug}>
              <Image src={category.image} alt={category.note} fill sizes="(max-width: 760px) 100vw, 34vw" style={{ objectPosition: category.position }} />
              <span className="category-index">{category.index}</span>
              <div className="category-tile-copy">
                <p>{category.note}</p>
                <h3>{category.title}</h3>
                <span>{t("home.enter")} ↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="feature-story">
        <div className="feature-image">
          <Image src="/images/product-2.jpg" alt={t("home.graphicLooksAlt")} fill sizes="(max-width: 800px) 100vw, 50vw" />
          <span>{t("home.newForms")}</span>
        </div>
        <div className="feature-copy">
          <p className="micro-label">The edit / Vol. 01</p>
          <h2>{t("home.featureColor")}<br />{t("home.featureContrast")}<br /><em>{t("home.featureCharacter")}</em></h2>
          <p>{t("home.featureCopy")}</p>
          <a className="text-link" href="/shop">{t("home.discoverEdit")} <span>↗</span></a>
          <div className="feature-signature">LCS</div>
        </div>
      </section>

      <section className="objects-section">
        <div className="objects-intro">
          <span>03</span>
          <div><p className="micro-label">{t("home.objectsOfDesire")}</p><h2>{t("home.detailTitle")}<br />{t("home.detailEmphasis")}</h2></div>
          <p>{t("home.detailCopy")}</p>
        </div>
        <div className="objects-grid">
          <a href="/shop?categoria=accessori" className="object-card object-card-large">
            <Image src="/images/product-3.jpg" alt={t("home.floralBagAlt")} fill sizes="(max-width: 760px) 100vw, 54vw" />
            <span>01 / {t("home.bags")}</span>
          </a>
          <a href="/shop?categoria=accessori" className="object-card">
            <Image src="/images/category-accessories.jpg" alt={t("home.redBagAlt")} fill sizes="(max-width: 760px) 100vw, 35vw" />
            <span>02 / Icons</span>
          </a>
        </div>
      </section>

      <section className="trust-story" id="provenienza" aria-labelledby="trust-title">
        <div className="trust-index"><span>04</span><p>{t("home.originAuthenticity")}</p></div>
        <div className="trust-content">
          <p className="micro-label">{t("home.trustMethod")}</p>
          <h2 id="trust-title">{t("home.trustTitle")}<br /><em>{t("home.trustEmphasis")}</em></h2>
          <p className="trust-lead">{t("home.trustLead")}</p>
          <div className="trust-principles">
            <article>
              <span>01</span>
              <h3>{t("home.trustOneTitle")}</h3>
              <p>{t("home.trustOneCopy")}</p>
            </article>
            <article>
              <span>02</span>
              <h3>{t("home.trustTwoTitle")}</h3>
              <p>{t("home.trustTwoCopy")}</p>
            </article>
            <article>
              <span>03</span>
              <h3>{t("home.trustThreeTitle")}</h3>
              <p>{t("home.trustThreeCopy")}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="newsletter-section" id="private-list">
        <div>
          <p className="micro-label">Private list</p>
          <h2>{t("home.newsletterTitle")}<br /><em>{t("home.newsletterEmphasis")}</em></h2>
        </div>
        <div className="newsletter-copy">
          <p>{t("home.newsletterCopy")}</p>
          <NewsletterForm />
        </div>
      </section>

      <StoreFooter />
    </main>
  );
}
