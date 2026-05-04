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
  <style>
    :root {
      color-scheme: dark;
      --bg: #05070a;
      --card: #0b1220;
      --text: #e8eef4;
      --muted: #8b9aad;
      --wa: #25d366;
      --brand-red: #e61e2a;
      --brand-gold: #ffcc33;
      --brand-navy: #0b1b32;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Segoe UI", system-ui, sans-serif;
      background: radial-gradient(120% 80% at 50% -20%, #152238 0%, var(--bg) 55%);
      color: var(--text);
      padding: clamp(0.75rem, 4vw, 1.5rem);
    }
    .card {
      width: 100%;
      max-width: 26rem;
      background: linear-gradient(165deg, #111a2b 0%, var(--card) 100%);
      border-radius: 20px;
      padding: clamp(1.5rem, 5vw, 2rem) clamp(1.25rem, 4vw, 1.75rem);
      text-align: center;
      box-shadow:
        0 12px 48px rgba(0,0,0,.45),
        0 0 0 1px rgba(255,255,255,.06);
    }
    /* Círculo com logo: zoom para cortar margem preta da arte e ganhar tamanho no mobile */
    .logo-orbit {
      --orbit-size: min(13.5rem, 72vw);
      position: relative;
      width: var(--orbit-size);
      height: var(--orbit-size);
      margin: 0 auto 1.35rem;
    }
    .logo-orbit__ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: conic-gradient(
        from 220deg,
        var(--brand-red),
        var(--brand-gold),
        var(--brand-navy),
        var(--brand-red)
      );
      animation: orbit-spin 2.8s linear infinite;
      /* Mostra só o contorno: o centro fica vazio para a logo não girar */
      -webkit-mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 5px),
        #fff calc(100% - 4px)
      );
      mask: radial-gradient(
        farthest-side,
        transparent calc(100% - 5px),
        #fff calc(100% - 4px)
      );
    }
    @media (prefers-reduced-motion: reduce) {
      .logo-orbit__ring { animation: none; }
    }
    @keyframes orbit-spin {
      to { transform: rotate(360deg); }
    }
    .logo-orbit__mask {
      position: absolute;
      inset: 5px;
      border-radius: 50%;
      overflow: hidden;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }
    .logo-orbit__img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: center center;
      padding: 6px;
      box-sizing: border-box;
    }
    h1 {
      font-size: clamp(1.05rem, 3.8vw, 1.3rem);
      font-weight: 600;
      line-height: 1.35;
      margin: 0 0 0.5rem;
    }
    p {
      margin: 0;
      font-size: clamp(0.88rem, 2.8vw, 0.95rem);
      color: var(--muted);
    }
    .wa-note {
      margin-top: 1.25rem;
      font-size: clamp(0.75rem, 2.5vw, 0.8rem);
      opacity: 0.9;
    }
    a {
      color: var(--wa);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-orbit">
      <div class="logo-orbit__ring" aria-hidden="true"></div>
      <div class="logo-orbit__mask">
        <img
          class="logo-orbit__img"
          src="/logo.png"
          width="512"
          height="512"
          alt="Melhor Preço Net"
          decoding="async"
          fetchpriority="high"
        />
      </div>
    </div>
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
