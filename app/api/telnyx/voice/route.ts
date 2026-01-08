import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log para debugging
    console.log("=== TELNYX WEBHOOK RECIBIDO ===");
    console.log(JSON.stringify(body, null, 2));
    console.log("==============================");
    
    // API v1 y v2 tienen estructuras diferentes
    // API v1: body.data.event_type, body.data.payload
    // API v2: body.event_type, body.payload o body.data
    let eventType: string | undefined;
    let callControlId: string | undefined;
    let payload: any = {};
    
    // Intentar detectar estructura (API v1 o v2)
    if (body?.data?.event_type) {
      // API v1
      eventType = body.data.event_type;
      payload = body.data.payload || body.data || {};
      callControlId = payload.call_control_id || body.data.call_control_id;
    } else if (body?.event_type) {
      // API v2
      eventType = body.event_type;
      payload = body.payload || body.data || body;
      callControlId = payload.call_control_id || body.call_control_id;
    } else {
      console.error("No se pudo detectar la estructura del webhook");
      console.log("Body completo:", body);
      return NextResponse.json({ received: true }, { status: 200 });
    }
    
    console.log(`Event Type: ${eventType}`);
    console.log(`Call Control ID: ${callControlId}`);
    console.log(`Payload:`, payload);

    // Enviar comandos a Telnyx Call Control
    const sendTelnyx = async (command: any) => {
      if (!callControlId) {
        console.error("No call_control_id disponible para enviar comando");
        return;
      }
      
      try {
        console.log(`Enviando comando a Telnyx:`, command);
        const response = await fetch(
          `https://api.telnyx.com/v2/calls/${callControlId}/actions`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.TELNYX_API_KEY}`,
            },
            body: JSON.stringify(command),
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error en Telnyx API: ${response.status} - ${errorText}`);
        } else {
          const result = await response.json();
          console.log(`✅ Comando enviado exitosamente:`, result);
        }
      } catch (error) {
        console.error("Error al enviar comando a Telnyx:", error);
      }
    };

    // Manejar diferentes eventos
    if (eventType === "call.initiated") {
      console.log("📞 Llamada iniciada");
      if (callControlId) {
        await sendTelnyx({ 
          command: "answer"
        });
      } else {
        console.error("❌ call.initiated sin call_control_id");
      }
    }

    if (eventType === "call.answered") {
      console.log("✅ Llamada contestada");
      if (callControlId) {
        await sendTelnyx({
          command: "speak",
          payload: {
            text: "Hola, tu llamada ha llegado correctamente a Mundi A I.",
            voice: "female",
          },
        });
      }
    }

    // Responder rápidamente a Telnyx
    return NextResponse.json({ received: true }, { status: 200 });
    
  } catch (error) {
    console.error("❌ Error procesando webhook de Telnyx:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 200 });
  }
}