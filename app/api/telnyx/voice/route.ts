import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const eventType = body?.data?.event_type;
  const callControlId = body?.data?.payload?.call_control_id;

  // Enviar comandos a Telnyx Call Control
  const sendTelnyx = async (command: any) => {
    await fetch("https://api.telnyx.com/v2/calls/" + callControlId + "/actions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
      },
      body: JSON.stringify(command),
    });
  };

  // Primera conexión (call.initiated)
  if (eventType === "call.initiated") {
    await sendTelnyx({ command: "answer" });
  }

  // Cuando la llamada se responde
  if (eventType === "call.answered") {
    await sendTelnyx({
      command: "speak",
      payload: {
        text: "Hola, tu llamada ha llegado correctamente a Mundi A I.",
        voice: "female",
      },
    });
  }

  return NextResponse.json({ ok: true });
}