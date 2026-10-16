"use client";

import { useMemo, useState } from "react";
import { removeBackground } from "@imgly/background-removal";
import ComparisonSlider from "@/components/ComparisonSlider";
import DropZone from "@/components/DropZone";

type Mode = "enhance" | "rembg";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("enhance");
  const [position, setPosition] = useState(50);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  async function submit() {
    if (!file) return;

    setBusy(true);
    setError(null);
    setResultUrl(null);

    try {
      if (mode === "rembg") {
        // Client-side Free Background Removal (No Replicate API required)
        const imageBlob = await removeBackground(file);
        const url = URL.createObjectURL(imageBlob);
        setResultUrl(url);
      } else {
        // Replicate AI Photo Enhancement
        const body = new FormData();
        body.append("image", file);
        body.append("mode", mode);

        const response = await fetch("/api/enhance", {
          method: "POST",
          body,
        });
        const data = (await response.json()) as { url?: string; error?: string };

        if (!response.ok || !data.url) {
          throw new Error(data.error || "Processing failed.");
        }

        setResultUrl(data.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const afterLabel = mode === "rembg" ? "No background" : "Enhanced";
  const busyLabel = mode === "rembg" ? "Removing background…" : "Enhancing…";

  return (
    <main className="app">
      <header className="header">
        <h1>AI Photo Enhancer</h1>
        <p>
          Enhance faces with CodeFormer, or cut out the background with rembg.
        </p>
      </header>

      <section className="card">
        <DropZone
          disabled={busy}
          onFile={(next) => {
            setFile(next);
            setResultUrl(null);
            setError(null);
            setPosition(50);
          }}
        />

        <fieldset className="mode" disabled={busy}>
          <legend>Choose an action</legend>
          <label className={mode === "enhance" ? "selected" : ""}>
            <input
              type="radio"
              name="mode"
              value="enhance"
              checked={mode === "enhance"}
              onChange={() => setMode("enhance")}
            />
            Enhance Photo
          </label>
          <label className={mode === "rembg" ? "selected" : ""}>
            <input
              type="radio"
              name="mode"
              value="rembg"
              checked={mode === "rembg"}
              onChange={() => setMode("rembg")}
            />
            Remove Background
          </label>
        </fieldset>

        <div className="actions">
          <button className="button" disabled={!file || busy} onClick={submit}>
            {busy ? busyLabel : "Submit"}
          </button>
          {file && (
            <button
              className="button ghost"
              disabled={busy}
              onClick={() => {
                setFile(null);
                setResultUrl(null);
                setError(null);
              }}
            >
              Clear
            </button>
          )}
          <p className="status">
            {file ? file.name : "No photo selected yet"}
          </p>
        </div>

        {error && <p className="error">{error}</p>}

        {originalUrl && resultUrl && (
          <>
            <div style={{ backgroundColor: mode === "rembg" ? "#ffffff" : "transparent", borderRadius: "8px", overflow: "hidden" }}>
              <ComparisonSlider
                beforeSrc={originalUrl}
                afterSrc={resultUrl}
                position={position}
                onPositionChange={setPosition}
                afterLabel={afterLabel}
                checkerboard={mode === "rembg"}
              />
            </div>
            <a className="button download" href={resultUrl} target="_blank" rel="noreferrer">
              Open result
            </a>
          </>
        )}

        {originalUrl && !resultUrl && (
          <div className="slider">
            <img src={originalUrl} alt="Photo ready to process" />
          </div>
        )}
      </section>
    </main>
  );
}