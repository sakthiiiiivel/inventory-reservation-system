import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {

  try {

    const { id } = await context.params;

    const reservationId = Number(id);

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id: reservationId,
        },
      });

    if (!reservation) {

      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    if (new Date() > reservation.expiresAt) {

      return NextResponse.json(
        { error: "Reservation expired" },
        { status: 410 }
      );
    }

    await prisma.$transaction(async (tx) => {

      await tx.inventory.update({
        where: {
          id: reservation.inventoryId,
        },
        data: {
          totalUnits: {
            decrement: reservation.quantity,
          },
          reservedUnits: {
            decrement: reservation.quantity,
          },
        },
      });

      await tx.reservation.update({
        where: {
          id: reservation.id,
        },
        data: {
          status: "CONFIRMED",
        },
      });
    });

    return NextResponse.json({
      message: "Reservation confirmed",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Confirmation failed" },
      { status: 500 }
    );
  }
}
