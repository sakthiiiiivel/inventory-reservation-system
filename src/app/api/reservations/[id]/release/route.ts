import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {

  try {

    const reservationId = Number(params.id);

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

    await prisma.$transaction(async (tx) => {

      await tx.inventory.update({
        where: {
          id: reservation.inventoryId,
        },
        data: {
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
          status: "RELEASED",
        },
      });
    });

    return NextResponse.json({
      message: "Reservation released",
    });

  } catch (error) {

    return NextResponse.json(
      { error: "Release failed" },
      { status: 500 }
    );
  }
}