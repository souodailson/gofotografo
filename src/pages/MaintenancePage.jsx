// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App.jsx";
import "@/index.css";

// estilos de libs (sem barra inicial!)
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { pdfjs } from "react-pdf";
// worker do pdf (ok no dev)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
