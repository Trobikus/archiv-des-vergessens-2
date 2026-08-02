/**
 * Contact form Worker — POST /api/contact
 * Sends to the verified inbox behind kontakt@grimoire-interactive.de
 */

const CONTACT_TO = "grimoire.interactive@gmail.com";
const CONTACT_FROM = "kontakt@grimoire-interactive.de";
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_SUBJECT = 160;
const MAX_MESSAGE = 5000;

function json(data, status = 200, origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Vary"] = "Origin";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function allowedOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  try {
    const host = new URL(origin).hostname;
    if (
      host === "grimoire-interactive.de" ||
      host === "www.grimoire-interactive.de" ||
      host.endsWith(".grimoire-interactive.pages.dev") ||
      host === "grimoire-interactive.pages.dev" ||
      host === "localhost" ||
      host === "127.0.0.1"
    ) {
      return origin;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handlePost(request, env) {
  const origin = allowedOrigin(request);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Ungültige Anfrage." }, 400, origin);
  }

  if (body.website || body.company) {
    return json({ ok: true }, 200, origin);
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const subject = String(body.subject || "").trim() || "Nachricht über das Kontaktformular";
  const message = String(body.message || "").trim();

  if (!name || name.length > MAX_NAME) {
    return json({ ok: false, error: "Bitte einen gültigen Namen angeben." }, 400, origin);
  }
  if (!email || email.length > MAX_EMAIL || !isValidEmail(email)) {
    return json({ ok: false, error: "Bitte eine gültige E-Mail-Adresse angeben." }, 400, origin);
  }
  if (subject.length > MAX_SUBJECT) {
    return json({ ok: false, error: "Der Betreff ist zu lang." }, 400, origin);
  }
  if (!message || message.length > MAX_MESSAGE) {
    return json({ ok: false, error: "Bitte eine Nachricht eingeben (max. 5000 Zeichen)." }, 400, origin);
  }

  if (!env.EMAIL) {
    return json({ ok: false, error: "E-Mail-Versand ist nicht konfiguriert." }, 503, origin);
  }

  const mailSubject = `[Kontakt] ${subject}`;
  const text = [
    "Neue Nachricht über das Kontaktformular",
    "────────────────────────────────────",
    `Name:    ${name}`,
    `E-Mail:  ${email}`,
    `Betreff: ${subject}`,
    "",
    message,
    "",
    "────────────────────────────────────",
    "Antworten geht an die Absenderadresse (Reply-To).",
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;line-height:1.55;color:#1a1a1a">
      <p style="margin:0 0 1rem;color:#6a6774;font-size:0.9rem">Neue Nachricht über das Kontaktformular</p>
      <p style="margin:0 0 0.35rem"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 0.35rem"><strong>E-Mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      <p style="margin:0 0 1.25rem"><strong>Betreff:</strong> ${escapeHtml(subject)}</p>
      <div style="white-space:pre-wrap;border-top:1px solid #ddd;padding-top:1rem">${escapeHtml(message)}</div>
    </div>
  `.trim();

  try {
    await env.EMAIL.send({
      to: CONTACT_TO,
      from: { email: CONTACT_FROM, name: "Grimoire Interactive" },
      replyTo: { email, name },
      subject: mailSubject,
      text,
      html,
    });
  } catch (err) {
    console.error("contact send failed", err && err.message ? err.message : err);
    return json(
      {
        ok: false,
        error:
          "Versand fehlgeschlagen. Bitte später erneut versuchen oder direkt per E-Mail schreiben.",
      },
      502,
      origin,
    );
  }

  return json({ ok: true }, 200, origin);
}

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request);

    if (request.method === "OPTIONS") {
      if (!origin) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        },
      });
    }

    if (request.method === "POST") {
      return handlePost(request, env);
    }

    return json({ ok: false, error: "Method not allowed" }, 405, origin);
  },
};
