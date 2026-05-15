/**
 * notify-pathologist-consultation
 *
 * Edge Function acionada via Database Webhook no INSERT da tabela
 * `pathologist_consultations`. Envia um e-mail HTML estilizado para o
 * endereço do laboratório informando os dados do solicitante.
 *
 * Variáveis de ambiente necessárias (configure em Supabase > Settings > Edge Functions):
 *   SMTP_HOST             smtp.gmail.com
 *   SMTP_PORT             587
 *   SMTP_USER             sistemas@laboratoriolab.com.br
 *   SMTP_PASS             <app-password>
 *   SMTP_FROM             Laboratorio LAB <no-reply@laboratoriolab.com.br>
 *   NOTIFY_TO             patologista@laboratoriolab.com.br (ou múltiplos separados por vírgula)
 *   NOTIFY_WEBHOOK_SECRET <string-aleatoria-segura>  (validado no header Authorization)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.0.0/mod.ts";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ConsultationRecord {
  id: string;
  created_at: string;
  nome?: string;
  email?: string;
  telefone?: string;
  mensagem?: string;
  especialidade?: string;
  status?: string;
  [key: string]: unknown;
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: ConsultationRecord;
  old_record: ConsultationRecord | null;
}

// ─── Configuração SMTP ────────────────────────────────────────────────────────

const SMTP_HOST   = Deno.env.get("SMTP_HOST")  ?? "smtp.gmail.com";
const SMTP_PORT   = Number(Deno.env.get("SMTP_PORT") ?? 587);
const SMTP_USER   = Deno.env.get("SMTP_USER")!;
const SMTP_PASS   = Deno.env.get("SMTP_PASS")!;
const SMTP_FROM   = Deno.env.get("SMTP_FROM")  ?? SMTP_USER;
// E-mail(s) que receberão a notificação. Suporta múltiplos separados por vírgula.
// Ex: "patologista@lab.com.br,administrativo@lab.com.br"
const NOTIFY_TO   = Deno.env.get("NOTIFY_TO")  ?? SMTP_USER;
const WEBHOOK_SECRET = Deno.env.get("NOTIFY_WEBHOOK_SECRET");

// ─── Utilitários ──────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Template HTML do e-mail ──────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  nome:          "Nome",
  email:         "E-mail",
  telefone:      "Telefone",
  mensagem:      "Mensagem",
  especialidade: "Especialidade",
  status:        "Status",
};

const SYSTEM_FIELDS = new Set(["id", "created_at", "updated_at"]);

function buildEmailHTML(record: ConsultationRecord): string {
  const date = record.created_at ? formatDate(record.created_at) : "—";

  const rows = Object.entries(record)
    .filter(([key, value]) => !SYSTEM_FIELDS.has(key) && value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      const label =
        FIELD_LABELS[key] ??
        key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
      const display = String(value).replace(/\n/g, "<br>");
      return `
        <tr>
          <td style="
            padding:10px 20px;
            background:#f1f5f9;
            font-size:13px;font-weight:600;
            color:#475569;
            white-space:nowrap;
            border-bottom:1px solid #e2e8f0;
            width:150px;
            vertical-align:top
          ">${label}</td>
          <td style="
            padding:10px 20px;
            font-size:14px;
            color:#1e293b;
            border-bottom:1px solid #e2e8f0;
            line-height:1.6
          ">${display}</td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Nova Solicitação de Contato com Patologista</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background:#f8fafc">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f8fafc;padding:40px 16px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%">

          <!-- ── Cabeçalho ───────────────────────────────────────────── -->
          <tr>
            <td style="
              background:linear-gradient(135deg,#1d4ed8 0%,#4338ca 100%);
              border-radius:14px 14px 0 0;
              padding:36px 40px;
              text-align:center
            ">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:2.5px;color:#bfdbfe;text-transform:uppercase">
                LAB – Laboratório e Medicina Diagnóstica
              </p>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;line-height:1.35">
                Nova Solicitação de Contato<br>com Patologista
              </h1>
              <p style="margin:14px 0 0;font-size:13px;color:#93c5fd">
                Recebida em ${date} (horário de Brasília)
              </p>
            </td>
          </tr>

          <!-- ── Banner de alerta ────────────────────────────────────── -->
          <tr>
            <td style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px 24px">
              <p style="margin:0;font-size:13px;color:#1e40af;font-weight:500;line-height:1.55">
                ⚕️ &nbsp;Um paciente entrou em contato solicitando consulta com o patologista.
                Verifique os detalhes abaixo e retorne o contato o mais breve possível.
              </p>
            </td>
          </tr>

          <!-- ── Corpo: dados do registro ───────────────────────────── -->
          <tr>
            <td style="background:#ffffff;padding:0">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:24px 20px 4px">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8">
                      Dados da Solicitação
                    </p>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:2px solid #e2e8f0;margin-top:4px">
                ${rows.length > 0 ? rows : `
                <tr>
                  <td style="padding:20px;font-size:13px;color:#94a3b8;text-align:center">
                    (sem dados adicionais)
                  </td>
                </tr>`}
              </table>
            </td>
          </tr>

          <!-- ── Rodapé do card: ID do registro ─────────────────────── -->
          <tr>
            <td style="background:#ffffff;padding:16px 20px 28px;border-top:1px solid #f1f5f9">
              <p style="margin:0;font-size:11px;color:#94a3b8">
                ID do registro:&nbsp;
                <code style="font-family:'Courier New',monospace;background:#f1f5f9;padding:2px 8px;border-radius:5px;font-size:11px">${record.id}</code>
              </p>
            </td>
          </tr>

          <!-- ── Rodapé do e-mail ────────────────────────────────────── -->
          <tr>
            <td style="
              background:#1e293b;
              border-radius:0 0 14px 14px;
              padding:22px 40px;
              text-align:center
            ">
              <p style="margin:0 0 4px;font-size:12px;color:#475569">
                Este é um e-mail automático gerado pelo sistema LAB. Não responda a esta mensagem.
              </p>
              <p style="margin:0;font-size:12px;color:#334155">
                © ${new Date().getFullYear()} Laboratório LAB · Brasília-DF
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Handler principal ────────────────────────────────────────────────────────

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Validar secret do webhook (se configurado)
  if (WEBHOOK_SECRET) {
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  // Processar apenas INSERT
  if (payload.type !== "INSERT") {
    return new Response(
      JSON.stringify({ skipped: true, reason: "not an INSERT event" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const record = payload.record;

  if (!SMTP_USER || !SMTP_PASS) {
    console.error("SMTP credentials not configured");
    return new Response("SMTP not configured", { status: 500 });
  }

  const html = buildEmailHTML(record);
  const subject = `[LAB] Nova solicitação de contato com Patologista${record.nome ? ` — ${record.nome}` : ""}`;

  const client = new SMTPClient({
    connection: {
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      tls: false,   // false = STARTTLS (porta 587); use true para porta 465
      auth: {
        username: SMTP_USER,
        password: SMTP_PASS,
      },
    },
  });

  try {
    await client.send({
      from: SMTP_FROM,
      to: NOTIFY_TO,
      subject,
      html,
    });
    await client.close();
    console.log(`E-mail enviado com sucesso — ID: ${record.id}`);
  } catch (err) {
    console.error("Erro ao enviar e-mail:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({ success: true, record_id: record.id }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
