/**
 * Servidor simples: exibe mensagem e redireciona para wa.me usando WHATSAPP_NUMBER.
 * Railway define PORT automaticamente.
 */

const path = require("path");
const express = require("express");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

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
  <title>Redirecionando — Melhor Preço Net</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #000000;
      --navy: #0a192f;
      --red: #e61e2a;
      --gold: #ffd700;
      --text: #f0f4f8;
      --muted: #9aacbf;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Montserrat", "Segoe UI", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 1.25rem;
    }
    .card {
      width: 100%;
      max-width: 26rem;
      background: linear-gradient(165deg, rgba(10, 25, 47, 0.55) 0%, rgba(0, 0, 0, 0.92) 100%);
      border: 1px solid rgba(10, 25, 47, 0.9);
      border-radius: 20px;
      padding: 2rem 1.75rem 2.25rem;
      text-align: center;
      box-shadow:
        0 0 0 1px rgba(230, 30, 42, 0.12),
        0 24px 48px rgba(0, 0, 0, 0.55);
    }
    .loader {
      position: relative;
      width: min(200px, 52vw);
      height: min(200px, 52vw);
      margin: 0 auto 1.5rem;
    }
    .loader-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 5px solid rgba(10, 25, 47, 0.65);
      border-top-color: var(--red);
      border-right-color: var(--red);
      animation: spin 0.95s linear infinite;
      filter: drop-shadow(0 0 12px rgba(230, 30, 42, 0.25));
    }
    .loader-inner {
      position: absolute;
      inset: 11px;
      border-radius: 50%;
      background: var(--bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: min(14px, 3vw);
      overflow: hidden;
    }
    .loader-inner img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1 {
      font-size: clamp(1.05rem, 3.8vw, 1.2rem);
      font-weight: 600;
      line-height: 1.4;
      margin: 0 0 0.6rem;
      letter-spacing: 0.01em;
    }
    h1 .accent {
      color: var(--red);
      font-weight: 700;
    }
    p {
      margin: 0;
      font-size: 0.92rem;
      color: var(--muted);
      font-weight: 500;
    }
    .wa-note {
      margin-top: 1.35rem;
      font-size: 0.78rem;
      opacity: 0.92;
      line-height: 1.45;
    }
    a {
      color: var(--gold);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    a:hover {
      color: #ffe566;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="loader" role="status" aria-live="polite" aria-label="A redirecionar">
      <div class="loader-ring" aria-hidden="true"></div>
      <div class="loader-inner">
        <img src="/logo-melhor-preco-net.png" width="200" height="200" alt="Melhor Preço Net">
      </div>
    </div>
    <h1>Encaminhando para o <span class="accent">melhor vendedor</span> da sua região</h1>
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
