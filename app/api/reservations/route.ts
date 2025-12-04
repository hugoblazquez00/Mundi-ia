import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { reservations, businesses, conversations } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const createReservationSchema = z.object({
  businessId: z.number(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  partySize: z.number().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  status: z.string().default('pending'),
  source: z.string().default('phone'),
});

const updateReservationSchema = z.object({
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().optional(),
  partySize: z.number().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  status: z.string().optional(),
});

// GET - Listar reservations
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId');

    // Si se especifica businessId, permitir acceso sin autenticación (para dashboard)
    if (businessId) {
      const results = await db
        .select({
          reservation: reservations,
          business: businesses,
        })
        .from(reservations)
        .innerJoin(businesses, eq(reservations.businessId, businesses.id))
        .where(eq(reservations.businessId, parseInt(businessId)));

      return NextResponse.json(
        results.map((r) => ({
          ...r.reservation,
          business: r.business,
        }))
      );
    }

    // Si no hay businessId, requiere autenticación y muestra todas las reservas del usuario
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conditions = [eq(businesses.ownerId, user.id)];

    const results = await db
      .select({
        reservation: reservations,
        business: businesses,
      })
      .from(reservations)
      .innerJoin(businesses, eq(reservations.businessId, businesses.id))
      .where(and(...conditions));

    return NextResponse.json(
      results.map((r) => ({
        ...r.reservation,
        business: r.business,
      }))
    );
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Crear reservation
// Permite crear reservas sin autenticación cuando source es 'phone' (llamadas)
// Para otras fuentes, requiere autenticación y verifica ownership
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createReservationSchema.parse(body);

    // Si la fuente es 'phone', no requiere autenticación (viene de llamada)
    // Solo verificamos que el business existe
    if (validated.source === 'phone') {
      const [business] = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, validated.businessId))
        .limit(1);

      if (!business) {
        return NextResponse.json(
          { error: 'Business not found' },
          { status: 404 }
        );
      }

      // Crear la reserva usando el mismo patrón que el resto del código
      const [newReservation] = await db
        .insert(reservations)
        .values({
          businessId: validated.businessId,
          customerName: validated.customerName,
          customerPhone: validated.customerPhone,
          partySize: validated.partySize,
          date: validated.date,
          time: validated.time,
          status: validated.status,
          source: validated.source,
        })
        .returning();

      // Si hay conversationId en el body, actualizar la conversación
      const conversationId = body.conversationId;
      if (conversationId) {
        await db
          .update(conversations)
          .set({
            reservationId: newReservation.id,
            status: 'completed',
            updatedAt: new Date(),
          })
          .where(eq(conversations.id, conversationId));
      }

      return NextResponse.json(newReservation, { status: 201 });
    }

    // Para otras fuentes (web, etc.), requiere autenticación y verificar ownership
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar que el business pertenece al usuario
    const [business] = await db
      .select()
      .from(businesses)
      .where(
        and(
          eq(businesses.id, validated.businessId),
          eq(businesses.ownerId, user.id)
        )
      )
      .limit(1);

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or unauthorized' },
        { status: 403 }
      );
    }

    // Crear la reserva usando el mismo patrón
    const [newReservation] = await db
      .insert(reservations)
      .values({
        businessId: validated.businessId,
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        partySize: validated.partySize,
        date: validated.date,
        time: validated.time,
        status: validated.status,
        source: validated.source,
      })
      .returning();

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar reservation (requiere autenticación)
export async function PUT(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Reservation ID is required' },
        { status: 400 }
      );
    }

    // Verificar que la reservation pertenece a un business del usuario
    const [reservation] = await db
      .select({
        reservation: reservations,
        business: businesses,
      })
      .from(reservations)
      .innerJoin(businesses, eq(reservations.businessId, businesses.id))
      .where(
        and(
          eq(reservations.id, id),
          eq(businesses.ownerId, user.id)
        )
      )
      .limit(1);

    if (!reservation) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validated = updateReservationSchema.parse(updateData);
    const [updated] = await db
      .update(reservations)
      .set(validated)
      .where(eq(reservations.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar reservation (requiere autenticación)
export async function DELETE(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Reservation ID is required' },
        { status: 400 }
      );
    }

    // Verificar que la reservation pertenece a un business del usuario
    const [reservation] = await db
      .select({
        reservation: reservations,
        business: businesses,
      })
      .from(reservations)
      .innerJoin(businesses, eq(reservations.businessId, businesses.id))
      .where(
        and(
          eq(reservations.id, parseInt(id)),
          eq(businesses.ownerId, user.id)
        )
      )
      .limit(1);

    if (!reservation) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(reservations).where(eq(reservations.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
