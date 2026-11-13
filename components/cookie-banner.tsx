"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("ads-consent");
    setChoice(stored);
    setReady(true);
    if (stored === "accepted") enablePixels();
  }, []);

  if (!ready || choice) return null;

  return (
    <div className="banner" role="dialog" aria-label="Cookies">
      <p>We use optional cookies for Meta and Google ads. The shop works if you decline.</p>
      <div className="banner-actions">
        <button className="ghost" type="button" onClick={() => choose("declined")}>Decline</button>
        <button type="button" onClick={() => choose("accepted")}>Accept</button>
      </div>
    </div>
  );

  function choose(value: "accepted" | "declined") {
    window.localStorage.setItem("ads-consent", value);
    setChoice(value);
    if (value === "accepted") enablePixels();
  }
}

function enablePixels() {
  const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const google = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID;
  if (meta && !document.getElementById("meta-pixel")) {
    const script = document.createElement("script");
    script.id = "meta-pixel";
    script.text = `fbq('init', '${meta}')`;
    document.body.appendChild(script);
  }
  if (google && !document.getElementById("google-tag")) {
    const script = document.createElement("script");
    script.id = "google-tag";
    script.text = `gtag('config', '${google}')`;
    document.body.appendChild(script);
  }
}
