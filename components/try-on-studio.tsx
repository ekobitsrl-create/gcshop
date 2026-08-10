"use client";

import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";

export type TryOnProduct = {
  name: string;
  slug: string;
  imageUrl: string;
  categoryName: string;
};

type TryOnStudioProps = {
  products: TryOnProduct[];
  initialProduct?: string;
};

function cssUrl(value: string) {
  return `url(${JSON.stringify(value)})`;
}

export function TryOnStudio({ products, initialProduct }: TryOnStudioProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const scanTimer = useRef<number | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(
    products.some((product) => product.slug === initialProduct) ? initialProduct! : products[0]?.slug ?? "",
  );
  const [portrait, setPortrait] = useState<string | null>(null);
  const [message, setMessage] = useState("Carica una foto frontale per iniziare.");
  const [processing, setProcessing] = useState(false);
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(72);
  const [positionY, setPositionY] = useState(51);
  const [opacity, setOpacity] = useState(64);

  const selectedProduct = products.find((product) => product.slug === selectedSlug) ?? products[0];

  useEffect(() => () => {
    if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
  }, []);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Scegli un file immagine in formato JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setMessage("L'immagine supera 12 MB. Scegline una più leggera.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPortrait(String(reader.result));
      setReady(false);
      setMessage("Foto pronta. Avvia la preview e regola il look.");
    };
    reader.onerror = () => setMessage("Non siamo riusciti a leggere l'immagine.");
    reader.readAsDataURL(file);
  }

  function generatePreview() {
    if (!portrait) {
      fileInput.current?.click();
      return;
    }
    setProcessing(true);
    setReady(false);
    setMessage("Analisi di prospettiva e proporzioni in corso…");
    if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
    scanTimer.current = window.setTimeout(() => {
      setProcessing(false);
      setReady(true);
      setMessage("Preview pronta. Usa i controlli per perfezionare il fitting.");
    }, 1150);
  }

  function resetControls() {
    setScale(72);
    setPositionY(51);
    setOpacity(64);
  }

  return (
    <div className="tryon-studio">
      <section className="tryon-stage" aria-label="Anteprima Virtual Try-On">
        <div
          className={`tryon-canvas ${portrait ? "has-portrait" : ""} ${processing ? "is-processing" : ""} ${ready ? "is-ready" : ""}`}
          role="img"
          aria-label={portrait ? `Anteprima di ${selectedProduct?.name ?? "look"} sulla foto caricata` : "Area di caricamento della foto"}
          style={portrait ? { backgroundImage: cssUrl(portrait) } : undefined}
        >
          {!portrait ? (
            <button className="tryon-upload-zone" type="button" onClick={() => fileInput.current?.click()}>
              <span>+</span>
              <strong>Carica la tua foto</strong>
              <small>Figura intera o mezzo busto · max 12 MB</small>
            </button>
          ) : null}

          {portrait && selectedProduct ? (
            <div
              className="tryon-garment-layer"
              aria-hidden="true"
              style={{
                backgroundImage: cssUrl(selectedProduct.imageUrl),
                top: `${positionY}%`,
                opacity: ready ? opacity / 100 : 0,
                transform: `translate(-50%, -50%) scale(${scale / 100})`,
              }}
            />
          ) : null}

          <div className="tryon-coordinate-grid" aria-hidden="true" />
          <div className="tryon-scan-line" aria-hidden="true" />
          <div className="tryon-canvas-meta" aria-hidden="true">
            <span>LCS / VISION 01</span>
            <span>{processing ? "SCANNING" : ready ? "PREVIEW READY" : "STANDBY"}</span>
          </div>
          <div className="tryon-body-axis" aria-hidden="true"><i /><i /><i /></div>
        </div>

        <div className="tryon-privacy-note">
          <span>Private by design</span>
          <p>La foto resta sul tuo dispositivo e non viene salvata.</p>
        </div>
      </section>

      <aside className="tryon-console">
        <div className="tryon-console-heading">
          <p>Virtual fitting room / Beta</p>
          <h2>Costruisci<br /><em>la tua preview.</em></h2>
        </div>

        <div className="tryon-step">
          <div className="tryon-step-title"><span>01</span><strong>Immagine</strong></div>
          <input ref={fileInput} className="tryon-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={choosePhoto} />
          <button className="tryon-secondary-button" type="button" onClick={() => fileInput.current?.click()}>
            {portrait ? "Cambia foto" : "Scegli una foto"}<span>＋</span>
          </button>
        </div>

        <fieldset className="tryon-step tryon-products">
          <legend><span>02</span><strong>Scegli il pezzo</strong></legend>
          <div>
            {products.map((product) => (
              <label className={selectedSlug === product.slug ? "is-selected" : ""} key={product.slug}>
                <input
                  type="radio"
                  name="tryon-product"
                  value={product.slug}
                  checked={selectedSlug === product.slug}
                  onChange={() => {
                    setSelectedSlug(product.slug);
                    setReady(false);
                  }}
                />
                <i style={{ backgroundImage: cssUrl(product.imageUrl) }} />
                <span><small>{product.categoryName}</small><strong>{product.name}</strong></span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="tryon-step tryon-adjustments">
          <div className="tryon-step-title"><span>03</span><strong>Regola il fitting</strong></div>
          <label>Scala <output>{scale}%</output><input type="range" min="45" max="120" value={scale} onChange={(event) => setScale(Number(event.target.value))} /></label>
          <label>Posizione <output>{positionY}%</output><input type="range" min="30" max="72" value={positionY} onChange={(event) => setPositionY(Number(event.target.value))} /></label>
          <label>Fusione <output>{opacity}%</output><input type="range" min="30" max="92" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /></label>
          <button type="button" onClick={resetControls}>Reset parametri</button>
        </div>

        <button className="tryon-primary-button" type="button" disabled={processing} onClick={generatePreview}>
          <span>{processing ? "Elaborazione…" : portrait ? "Genera preview" : "Carica e inizia"}</span><b>↗</b>
        </button>
        <p className="tryon-status" role="status">{message}</p>
        <p className="tryon-disclaimer">Anteprima creativa in beta: non sostituisce le misure del capo o una prova fisica.</p>
      </aside>
    </div>
  );
}
