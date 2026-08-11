import type { ReactNode } from "react";
import { isAdminEmail, requireAdminPage } from "@/lib/admin-auth";
import "./admin.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdminPage("/admin");

  if (!isAdminEmail(user.email)) {
    return (
      <main className="admin-access-denied">
        <div className="admin-access-card">
          <span className="admin-mini-mark">LC</span>
          <p className="admin-eyebrow">Area riservata</p>
          <h1>Account non autorizzato.</h1>
          <p>
            L’account <strong>{user.email}</strong> non è presente nell’elenco amministratori.
            Contatta Ekobit SRL per richiedere l’accesso.
          </p>
          <a href="/auth/logout?return_to=/accesso-admin">Accedi con un altro account</a>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/admin" aria-label="LCS Admin">
          <span>LC</span>
          <div><strong>Luxury</strong><small>Concept Store Admin</small></div>
        </a>
        <nav aria-label="Amministrazione">
          <a href="/admin"><span>01</span>Panoramica</a>
          <a href="/admin/prodotti"><span>02</span>Prodotti</a>
          <a href="/admin/ordini"><span>03</span>Ordini</a>
          <a href="/admin/pagamenti"><span>04</span>Pagamenti</a>
          <a href="/shop"><span>05</span>Vedi negozio</a>
        </nav>
        <div className="admin-user">
          <span>{user.displayName.slice(0, 1).toUpperCase()}</span>
          <div><strong>{user.displayName}</strong><small>{user.email}</small></div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div><span className="admin-status-dot" /> Sistema operativo</div>
          <a href="/auth/logout?return_to=/">Esci</a>
        </header>
        {children}
      </div>
    </div>
  );
}
