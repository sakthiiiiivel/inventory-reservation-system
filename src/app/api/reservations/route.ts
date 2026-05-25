import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {

  try {

    // Read request body
    const body = await req.json();

    const { inventoryId, quantity } = body;

    // Start transaction
    const reservation = await prisma.$transaction(

      async (tx: Prisma.TransactionClient) => {

        // Find inventory row
        const inventory = await tx.inventory.findUnique({
          where: {
            id: inventoryId,
          },
        });

        // Inventory not found
        if (!inventory) {

          throw new Error("INVENTORY_NOT_FOUND");
        }

        // Calculate available stock
        const availableUnits =
          inventory.totalUnits - inventory.reservedUnits;

        // Check stock
        if (availableUnits < quantity) {

          throw new Error("NOT_ENOUGH_STOCK");
        }

        // Safely increase reserved units
        await tx.inventory.update({
          where: {
            id: inventoryId,
          },
          data: {
            reservedUnits: {
              increment: quantity,
            },
          },
        });

        // Create reservation
        const newReservation =
          await tx.reservation.create({
            data: {
              inventoryId,
              quantity,
              status: "RESERVED",
              expiresAt: new Date(
                Date.now() + 10 * 60 * 1000
              ),
            },
          });

        return newReservation;
      },

      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    // Success response
    return NextResponse.json(reservation);

  } catch (error) {

    console.error(error);

    // Inventory missing
    if (
      error instanceof Error &&
      error.message === "INVENTORY_NOT_FOUND"
    ) {

      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    // Stock unavailable
    if (
      error instanceof Error &&
      error.message === "NOT_ENOUGH_STOCK"
    ) {

      return NextResponse.json(
        { error: "Not enough stock available" },
        { status: 409 }
      );
    }

    // General failure
    return NextResponse.json(
      { error: "Reservation failed" },
      { status: 500 }
    );
  }
}