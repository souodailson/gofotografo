// src/components/SafeHTML.jsx
import React, { memo } from "react";
import { sanitizeHTML } from "@/lib/security/sanitize.js";

function SafeHTML({ html, className = "" }) {
  const clean = sanitizeHTML(String(html ?? ""));
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
export default memo(SafeHTML);
