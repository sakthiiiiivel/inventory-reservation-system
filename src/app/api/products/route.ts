import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {

  const inventory = await prisma.inventory.findMany({
    include: {
      product: true,
      warehouse: true,
    },
  });

  const result = inventory.map((item) => ({
    inventoryId: item.id,
    product: item.product.name,
    warehouse: item.warehouse.name,
    availableUnits:
      item.totalUnits - item.reservedUnits,
  }));

  return NextResponse.json(result);
}