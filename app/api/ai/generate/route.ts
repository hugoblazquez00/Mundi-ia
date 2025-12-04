import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/db/drizzle';
import { businesses, businessSettings, conversations, conversationMessages } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateSchema = z.object({
  text: z.string().min(1),
  businessId: z.number(),
  conversationId: z.number().nullable().optional(), // Acepta null o undefined
});

type AIAction =
  | { type: 'create_reservation'; data: CreateReservationData }
  | { type: 'ask_question'; data: { response: string } }
  | { type: 'request_info'; data: { info: string } }
  | { type: 'greeting'; data: { response: string } }
  | { type: 'end_conversation'; data: { reason: string } };

type CreateReservationData = {
  customerName: string;
  customerPhone?: string;
  partySize: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
};

// Función para normalizar fechas
function normalizeDate(dateString: string): string {
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Si contiene referencias a funciones, reemplazarlas
  if (dateString.includes('${getTomorrowDate()}')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Si dice "mañana" o "tomorrow"
  if (dateString.toLowerCase().includes('mañana') || dateString.toLowerCase().includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Si dice "hoy" o "today"
  if (dateString.toLowerCase().includes('hoy') || dateString.toLowerCase().includes('today')) {
    return today;
  }
  
  // Si ya está en formato YYYY-MM-DD, validarlo
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Intentar parsear la fecha
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  
  // Si no se puede parsear, devolver mañana por defecto
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Función para normalizar horas
function normalizeTime(timeString: string): string {
  // Si ya está en formato HH:MM, validarlo
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Intentar extraer hora y minutos de diferentes formatos
  const timeMatch = timeString.match(/(\d{1,2}):?(\d{2})?/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    
    // Si la hora es PM y es menor a 12, sumar 12
    if (timeString.toLowerCase().includes('pm') && hours < 12) {
      hours += 12;
    }
    // Si la hora es AM y es 12, convertir a 0
    if (timeString.toLowerCase().includes('am') && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  
  // Si no se puede parsear, devolver 20:00 por defecto
  return '20:00';
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { text, businessId, conversationId } = generateSchema.parse(body);

    // Obtener configuración del business
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Obtener settings del business
    const [settings] = await db
      .select()
      .from(businessSettings)
      .where(eq(businessSettings.businessId, businessId))
      .limit(1);

    if (!settings || !settings.prompt) {
      return NextResponse.json(
        { error: 'Business settings not found or prompt not configured' },
        { status: 404 }
      );
    }

    // Obtener o crear conversación
    let currentConversation;
    if (conversationId) {
      [currentConversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId))
        .limit(1);
      
      // Si la conversación existe pero está terminada, crear una nueva
      if (currentConversation && currentConversation.status !== 'active') {
        currentConversation = null; // Forzar creación de nueva conversación
      }
    }

    if (!currentConversation) {
      // Crear nueva conversación
      [currentConversation] = await db
        .insert(conversations)
        .values({
          businessId,
          status: 'active',
        })
        .returning();
    }

    // Guardar mensaje del usuario con manejo de errores
    try {
      await db.insert(conversationMessages).values({
        conversationId: currentConversation.id,
        role: 'user',
        content: text,
      });
      console.log('Mensaje del usuario guardado:', text.substring(0, 50));
    } catch (insertError) {
      console.error('Error guardando mensaje del usuario:', insertError);
      // Continuar aunque falle el guardado
    }

    // Obtener historial de mensajes desde la BD (últimos 20 para no exceder tokens)
    const historyMessages = await db
      .select()
      .from(conversationMessages)
      .where(eq(conversationMessages.conversationId, currentConversation.id))
      .orderBy(desc(conversationMessages.createdAt))
      .limit(20);

    // Invertir para tener orden cronológico
    const orderedMessages = historyMessages.reverse();

    // Construir mensajes para OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: settings.prompt },
    ];

    // Agregar solo los mensajes de la conversación
    orderedMessages.forEach((msg) => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    let action: AIAction;
    let reservationData: Partial<CreateReservationData> = {};

    // Cargar datos parciales existentes de la conversación
    if (currentConversation.reservationData) {
      try {
        const existingData = JSON.parse(currentConversation.reservationData);
        reservationData = { ...existingData };
      } catch (e) {
        console.error('Error parsing existing reservation data:', e);
      }
    }

    try {
      const parsed = JSON.parse(responseText);
      
      // Detectar si el usuario quiere cancelar/terminar (solo si dice explícitamente "no" o "cancelar")
      const cancelKeywords = ['cancelar', 'nada', 'no quiero', 'olvídalo', 'no gracias', 'no, gracias'];
      const textLower = text.toLowerCase().trim();
      // Solo cancelar si dice explícitamente "no" al inicio o contiene palabras de cancelación
      const wantsToCancel = cancelKeywords.some(keyword => textLower.includes(keyword)) ||
        (textLower.startsWith('no') && textLower.length < 10); // "no" corto al inicio
      
      if (wantsToCancel) {
        await db
          .update(conversations)
          .set({ 
            status: 'cancelled', 
            updatedAt: new Date(),
            reservationData: null,
          })
          .where(eq(conversations.id, currentConversation.id));

        action = {
          type: 'end_conversation',
          data: { reason: 'Usuario canceló la conversación' },
        };
      } else if (parsed.type === 'create_reservation' && parsed.data) {
        // Acumular datos de la reserva (combinar con datos existentes)
        if (parsed.data.customerName && parsed.data.customerName.trim() !== '' && parsed.data.customerName.toLowerCase() !== 'cliente') {
          reservationData.customerName = parsed.data.customerName;
        }
        if (parsed.data.customerPhone && parsed.data.customerPhone.trim() !== '') {
          reservationData.customerPhone = parsed.data.customerPhone;
        }
        if (parsed.data.partySize) {
          reservationData.partySize = parsed.data.partySize;
        }
        if (parsed.data.date) {
          reservationData.date = normalizeDate(parsed.data.date);
        }
        if (parsed.data.time) {
          reservationData.time = normalizeTime(parsed.data.time);
        }

        // Validar que tenemos TODOS los datos necesarios
        const hasAllRequiredData = 
          reservationData.customerName && 
          reservationData.customerName.trim() !== '' &&
          reservationData.customerName.toLowerCase() !== 'cliente' &&
          reservationData.partySize && 
          reservationData.date && 
          reservationData.time;

        if (!hasAllRequiredData) {
          // Guardar datos parciales en la conversación
          await db
            .update(conversations)
            .set({
              reservationData: JSON.stringify(reservationData),
              updatedAt: new Date(),
            })
            .where(eq(conversations.id, currentConversation.id));

          // Construir mensaje preguntando por los datos faltantes
          const missingFields: string[] = [];
          if (!reservationData.customerName || reservationData.customerName.toLowerCase() === 'cliente') {
            missingFields.push('tu nombre');
          }
          if (!reservationData.partySize) {
            missingFields.push('cuántas personas serán');
          }
          if (!reservationData.date) {
            missingFields.push('qué día prefieres');
          }
          if (!reservationData.time) {
            missingFields.push('a qué hora');
          }

          let question = 'Para completar tu reserva, todavía necesito: ';
          if (missingFields.length === 1) {
            question += missingFields[0];
          } else if (missingFields.length === 2) {
            question += `${missingFields[0]} y ${missingFields[1]}`;
          } else {
            question += missingFields.slice(0, -1).join(', ') + ` y ${missingFields[missingFields.length - 1]}`;
          }
          question += '. ¿Podrías proporcionarme esta información?';

          action = {
            type: 'ask_question',
            data: { response: question },
          };
        } else {
          // Tenemos todos los datos, crear la acción de reserva
          // Limpiar datos parciales de la conversación
          await db
            .update(conversations)
            .set({
              reservationData: null,
              updatedAt: new Date(),
            })
            .where(eq(conversations.id, currentConversation.id));

          action = {
            type: 'create_reservation',
            data: {
              customerName: reservationData.customerName!,
              customerPhone: reservationData.customerPhone,
              partySize: reservationData.partySize!,
              date: reservationData.date!,
              time: reservationData.time!,
            },
          };
        }
      } else {
        // Si no es create_reservation, pero tenemos todos los datos acumulados, forzar creación
        const hasAllRequiredData = 
          reservationData.customerName && 
          reservationData.customerName.trim() !== '' &&
          reservationData.customerName.toLowerCase() !== 'cliente' &&
          reservationData.partySize && 
          reservationData.date && 
          reservationData.time;

        if (hasAllRequiredData) {
          // Limpiar datos parciales
          await db
            .update(conversations)
            .set({
              reservationData: null,
              updatedAt: new Date(),
            })
            .where(eq(conversations.id, currentConversation.id));

          action = {
            type: 'create_reservation',
            data: {
              customerName: reservationData.customerName!,
              customerPhone: reservationData.customerPhone,
              partySize: reservationData.partySize!,
              date: reservationData.date!,
              time: reservationData.time!,
            },
          };
        } else {
          action = parsed as AIAction;
        }
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Si hay error pero tenemos todos los datos, crear la reserva de todas formas
      const hasAllRequiredData = 
        reservationData.customerName && 
        reservationData.customerName.trim() !== '' &&
        reservationData.customerName.toLowerCase() !== 'cliente' &&
        reservationData.partySize && 
        reservationData.date && 
        reservationData.time;

      if (hasAllRequiredData) {
        await db
          .update(conversations)
          .set({
            reservationData: null,
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, currentConversation.id));

        action = {
          type: 'create_reservation',
          data: {
            customerName: reservationData.customerName!,
            customerPhone: reservationData.customerPhone,
            partySize: reservationData.partySize!,
            date: reservationData.date!,
            time: reservationData.time!,
          },
        };
      } else {
        action = {
          type: 'ask_question',
          data: { response: responseText },
        };
      }
    }

    // Guardar respuesta del asistente
    const assistantMessage = action.type === 'ask_question' || action.type === 'greeting' 
      ? action.data.response 
      : action.type === 'end_conversation'
      ? 'Entendido, gracias por contactarnos. ¡Que tengas un buen día!'
      : action.type === 'create_reservation'
      ? `¡Perfecto! He confirmado tu reserva para ${action.data.partySize} ${action.data.partySize === 1 ? 'persona' : 'personas'} el ${new Date(action.data.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${action.data.time}. Te esperamos, ${action.data.customerName}!`
      : 'Procesando tu solicitud...';

    // Guardar mensaje del asistente con manejo de errores
    try {
      await db.insert(conversationMessages).values({
        conversationId: currentConversation.id,
        role: 'assistant',
        content: assistantMessage,
      });
      console.log('Mensaje del asistente guardado:', assistantMessage.substring(0, 50));
    } catch (insertError) {
      console.error('Error guardando mensaje del asistente:', insertError);
      // Continuar aunque falle el guardado
    }

    return NextResponse.json({
      action,
      rawResponse: responseText,
      businessId: businessId,
      conversationId: currentConversation.id,
      assistantMessage,
      reservationData: action.type === 'create_reservation' ? action.data : undefined,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate AI response',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
