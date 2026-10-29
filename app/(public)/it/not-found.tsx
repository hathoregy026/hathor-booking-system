import type { Metadata } from "next";
import Link from "next/link";
import "../../it-not-found.css";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  robots: { index: false, follow: true },
};

/** Italian 404 for every /it address that has no page, inside the public site chrome. */
export default function ItalianNotFound() {
  return (
    <main className="it-404">
      <p className="it-404__eyebrow">Errore 404</p>
      <h1 className="it-404__title">Pagina non trovata</h1>
      <p className="it-404__lede">
        L’indirizzo che ha aperto non esiste o è stato spostato. Può tornare alla
        pagina iniziale o scegliere il Suo viaggio sul Nilo.
      </p>
      <div className="it-404__actions">
        <Link href="/it" className="public-btn-outline-gold">
          Pagina iniziale
        </Link>
        <Link href="/it/voyages" className="public-btn-dark">
          I viaggi
        </Link>
      </div>
    </main>
  );
}
