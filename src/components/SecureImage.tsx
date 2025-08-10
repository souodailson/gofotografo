// src/components/SecureImage.tsx
import React, { useEffect, useState } from "react";
import { signedUrl } from "../lib/storage";

type Props = {
  bucket: "uploads" | "propostas" | "contratos";
  path: string;           // ex.: user/<uid>/...
  alt?: string;
  className?: string;
};

export default function SecureImage({ bucket, path, alt = "", className }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const u = await signedUrl(bucket, path);
        if (alive) setUrl(u);
      } catch (e) {
        console.error("SecureImage signedUrl error", e);
      }
    })();
    return () => { alive = false; };
  }, [bucket, path]);

  if (!url) return <div className={className} aria-busy />;
  return <img src={url} alt={alt} className={className} loading="lazy" />;
}
