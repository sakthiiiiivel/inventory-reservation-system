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

    // Reservation missing
    if (!reservation) {

      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Reservation expired
    if (new Date() > reservation.expiresAt) {

      return NextResponse.json(
        { error: "Reservation expired" },
        { status: 410 }
      );
    }

    // Transaction
    await prisma.$transaction(async (tx) => {

      // Permanently reduce stock
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

      // Update reservation status
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