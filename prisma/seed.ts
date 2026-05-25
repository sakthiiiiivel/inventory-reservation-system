import "dotenv/config";
import { PrismaClient } from "@prisma/client";


console.log("DATABASE_URL =", process.env.DATABASE_URL);

const prisma = new PrismaClient();


async function main() {

  await prisma.inventory.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Products
  const iphone = await prisma.product.create({
    data: {
      name: "iPhone 15",
      sku: "IP15",
    },
  });

  const samsung = await prisma.product.create({
    data: {
      name: "Samsung S24",
      sku: "SS24",
    },
  });

  const pixel = await prisma.product.create({
    data: {
      name: "Google Pixel 9",
      sku: "GP9",
    },
  });

  const oneplus = await prisma.product.create({
    data: {
      name: "OnePlus 13",
      sku: "OP13",
    },
  });

  const nothing = await prisma.product.create({
    data: {
      name: "Nothing Phone 3",
      sku: "NP3",
    },
  });

  // Warehouses
  const chennai = await prisma.warehouse.create({
    data: {
      name: "Chennai Warehouse",
      city: "Chennai",
    },
  });

  const bangalore = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse",
      city: "Bangalore",
    },
  });

  const mumbai = await prisma.warehouse.create({
    data: {
      name: "Mumbai Warehouse",
      city: "Mumbai",
    },
  });

  // Inventory
  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId: chennai.id,
        totalUnits: 5,
      },
      {
        productId: iphone.id,
        warehouseId: bangalore.id,
        totalUnits: 3,
      },
      {
        productId: samsung.id,
        warehouseId: chennai.id,
        totalUnits: 4,
      },
      {
        productId: pixel.id,
        warehouseId: mumbai.id,
        totalUnits: 2,
      },
      {
        productId: oneplus.id,
        warehouseId: bangalore.id,
        totalUnits: 6,
      },
      {
        productId: nothing.id,
        warehouseId: chennai.id,
        totalUnits: 1,
      },
    ],
  });

  console.log("Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });