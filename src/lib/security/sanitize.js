// src/lib/security/sanitize.js
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHTML(dirty) {
  const input = dirty == null ? "" : String(dirty);
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [
      // HTML básico
      "a","b","strong","i","em","u","p","br","ul","ol","li","blockquote","hr",
      "h1","h2","h3","h4","h5","h6","span","div","img","table","thead","tbody","tr","th","td","pre","code",
      // SVG p/ QR Code e ícones inline
      "svg","g","path","rect","circle","line","polyline","polygon","defs","clipPath","mask","title","desc","use"
    ],
    ALLOWED_ATTR: [
      // comuns
      "href","target","rel","src","alt","title","width","height","class","id",
      // SVG
      "viewBox","fill","stroke","stroke-width","stroke-linecap","stroke-linejoin","d","x","y",
      "cx","cy","r","x1","y1","x2","y2","points","transform","preserveAspectRatio",
      "xmlns","xmlns:xlink","version","aria-hidden","focusable","role","opacity",
      // <use>
      "xlink:href","href"
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script","iframe","object","embed","link","meta","form","input","button","textarea","select"],
    FORBID_ATTR: ["onerror","onload","onclick","onmouseover","onfocus","onpointerover","style"],
    RETURN_TRUSTED_TYPE: false
  });
}
