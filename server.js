/**
 * Servidor simples: exibe mensagem e redireciona para wa.me usando WHATSAPP_NUMBER.
 * Railway define PORT automaticamente.
 */

const express = require("express");

const app = express();

function normalizeWhatsAppNumber(raw) {
  if (!raw || typeof raw !== "string") return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

function buildWhatsAppUrl(phoneDigits, message) {
  let url = `https://wa.me/${phoneDigits}`;
  if (message && String(message).trim()) {
    url += "?text=" + encodeURIComponent(String(message).trim());
  }
  return url;
}

app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("ok");
});

app.get("/", (_req, res) => {
  const phone = normalizeWhatsAppNumber(process.env.WHATSAPP_NUMBER || "");
  if (!phone) {
    res
      .status(500)
      .type("html")
      .send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Configuração necessária</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 36rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    code { background: #f2f2f2; padding: 0.15rem 0.4rem; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Variável de ambiente ausente</h1>
  <p>Configure <code>WHATSAPP_NUMBER</code> no Railway com o número completo em dígitos (código do país + DDD + número), por exemplo para Brasil: <code>5511999998888</code>.</p>
</body>
</html>`);
    return;
  }

  const waUrl = buildWhatsAppUrl(phone, process.env.WHATSAPP_MESSAGE || "");
  const delayRaw = parseInt(process.env.REDIRECT_DELAY_MS || "2000", 10);
  const delayMs = Number.isFinite(delayRaw)
    ? Math.min(Math.max(delayRaw, 300), 15000)
    : 2000;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="${Math.ceil(delayMs / 1000)};url=${escapeHtmlAttr(
    waUrl
  )}">
  <title>Redirecionando</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #0f1419;
      --card: #1a2332;
      --text: #e8eef4;
      --muted: #8b9aad;
      --accent: #25d366;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f4f6f8;
        --card: #ffffff;
        --text: #1a1a1a;
        --muted: #5c6b7a;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Segoe UI", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 1.25rem;
    }
    .card {
      width: 100%;
      max-width: 26rem;
      background: var(--card);
      border-radius: 16px;
      padding: 2rem 1.75rem;
      text-align: center;
      box-shadow: 0 12px 40px rgba(0,0,0,.18);
    }
    .spinner {
      width: 48px;
      height: 48px;
      margin: 0 auto 1.25rem;
      border: 3px solid color-mix(in srgb, var(--accent) 25%, transparent);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.85s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1 {
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.35;
      margin: 0 0 0.5rem;
    }
    p {
      margin: 0;
      font-size: 0.95rem;
      color: var(--muted);
    }
    .wa-note {
      margin-top: 1.25rem;
      font-size: 0.8rem;
      opacity: 0.85;
    }
    a {
      color: var(--accent);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner" aria-hidden="true"></div>
    <h1>Encaminhando para o melhor vendedor da sua região</h1>
    <p>Aguarde um instante…</p>
    <p class="wa-note">Se não abrir automaticamente, <a href="${escapeHtmlAttr(
      waUrl
    )}">toque aqui para ir ao WhatsApp</a>.</p>
  </div>
  <script>
    (function () {
      var url = ${JSON.stringify(waUrl)};
      var ms = ${delayMs};
      setTimeout(function () {
        window.location.href = url;
      }, ms);
    })();
  </script>
</body>
</html>`;

  res.status(200).type("html").send(html);
});

function escapeHtmlAttr(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log("Servidor em http://0.0.0.0:" + port);
});
