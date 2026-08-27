"use client";

import Link from "next/link";
import { useI18n } from "@/components/locale-provider";

export function StoreFooter() {
  const { t } = useI18n();
  return (
    <footer className="store-footer">
      <div className="footer-statement">
        <p>{t("footer.nextEdit")}</p>
        <h2>{t("footer.statement")}<br /><em>{t("footer.statementEmphasis")}</em></h2>
        <Link href="/#private-list">{t("footer.join")} <span>↗</span></Link>
      </div>

      <div className="footer-grid">
        <Link className="store-wordmark store-wordmark-light" href="/">
          <strong>LCS</strong><span>Selected edit</span>
        </Link>
        <div className="footer-links">
          <p>Shop</p>
          <Link href="/shop">New in</Link>
          <Link href="/shop?categoria=donna">{t("common.woman")}</Link>
          <Link href="/shop?categoria=uomo">{t("common.man")}</Link>
          <Link href="/shop?categoria=accessori">{t("common.accessories")}</Link>
        </div>
        <div className="footer-links">
          <p>{t("footer.support")}</p>
          <Link href="/#provenienza">{t("footer.origin")}</Link>
          <Link href="/informazioni-societarie">{t("footer.contacts")}</Link>
          <Link href="/checkout">{t("footer.shippingReturns")}</Link>
          <Link href="/checkout">{t("footer.payments")}</Link>
          <Link href="/admin">{t("footer.reserved")}</Link>
        </div>
        <div className="footer-links footer-company">
          <p>Private list</p>
          <span>{t("footer.privateCopy")}</span>
          <Link href="/#private-list">{t("footer.requestAccess")}</Link>
          <Link href="/informazioni-societarie">{t("footer.company")}</Link>
        </div>
      </div>

      <div className="footer-legal">
        <span>© 2026 LCS</span>
        <div><Link href="/">{t("footer.privacy")}</Link><Link href="/">{t("footer.cookies")}</Link><Link href="/">{t("footer.terms")}</Link><Link href="/informazioni-societarie">{t("footer.companyShort")}</Link></div>
        <a href="#top">{t("footer.backTop")} ↑</a>
      </div>
    </footer>
  );
}
