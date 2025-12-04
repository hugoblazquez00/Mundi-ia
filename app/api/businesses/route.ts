import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { businesses, businessSettings } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createBusinessSchema = z.object({
  name: z.string().min(1),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  openingHours: z.any().optional(),
});

const updateBusinessSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  openingHours: z.any().optional(),
});

// GET - Listar businesses del usuario
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userBusinesses = await db
      .select()
      .from(businesses)
      .where(eq(businesses.ownerId, user.id));

    return NextResponse.json(userBusinesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Crear business
export async function POST(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = createBusinessSchema.parse(body);

    const [newBusiness] = await db
      .insert(businesses)
      .values({
        ownerId: user.id,
        name: validated.name,
        phoneNumber: validated.phoneNumber,
        address: validated.address,
        openingHours: validated.openingHours
          ? JSON.stringify(validated.openingHours)
          : null,
      })
      .returning();

    // Crear settings por defecto
    await db.insert(businessSettings).values({
      businessId: newBusiness.id,
      prompt: 'Eres un asistente de voz amigable para un restaurante. Ayuda a los clientes a hacer reservas de manera profesional y cordial.',
      maxReservationsHour: 10,
      aiTone: 'professional',
    });

    return NextResponse.json(newBusiness, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar business
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
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Verificar que el business pertenece al usuario
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    if (!business || business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validated = updateBusinessSchema.parse(updateData);
    const updateValues: any = {};

    if (validated.name) updateValues.name = validated.name;
    if (validated.phoneNumber !== undefined)
      updateValues.phoneNumber = validated.phoneNumber;
    if (validated.address !== undefined) updateValues.address = validated.address;
    if (validated.openingHours !== undefined)
      updateValues.openingHours = JSON.stringify(validated.openingHours);

    const [updated] = await db
      .update(businesses)
      .set(updateValues)
      .where(eq(businesses.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar business
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
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Verificar que el business pertenece al usuario
    const [business] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, parseInt(id)))
      .limit(1);

    if (!business || business.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(businesses).where(eq(businesses.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}