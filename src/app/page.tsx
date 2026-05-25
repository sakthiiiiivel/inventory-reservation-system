"use client";

import { useEffect, useState } from "react";

type ProductData = {
  inventoryId: number;
  product: string;
  warehouse: string;
  availableUnits: number;
};

type Reservation = {
  id: number;
  expiresAt: string;
};

export default function HomePage() {

  const [products, setProducts] = useState<ProductData[]>([]);
  const [reservation, setReservation] =
    useState<Reservation | null>(null);

  const [timeLeft, setTimeLeft] = useState("");

  // Fetch products
  async function fetchProducts() {

    const res = await fetch("/api/products");

    const data = await res.json();

    setProducts(data);
  }

  // Reserve product
  async function reserveProduct(
    inventoryId: number
  ) {

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inventoryId,
        quantity: 1,
      }),
    });

    const data = await res.json();

    if (res.ok) {

      setReservation({
        id: data.id,
        expiresAt: data.expiresAt,
      });

      fetchProducts();

    } else {

      alert(data.error);
    }
  }

  // Confirm reservation
  async function confirmReservation() {

    if (!reservation) return;

    await fetch(
      `/api/reservations/${reservation.id}/confirm`,
      {
        method: "POST",
      }
    );

    alert("Purchase confirmed");

    setReservation(null);

    fetchProducts();
  }

  // Cancel reservation
  async function cancelReservation() {

    if (!reservation) return;

    await fetch(
      `/api/reservations/${reservation.id}/release`,
      {
        method: "POST",
      }
    );

    alert("Reservation cancelled");

    setReservation(null);

    fetchProducts();
  }

  // Countdown timer
  useEffect(() => {

    if (!reservation) return;

    const interval = setInterval(() => {

      const now = new Date().getTime();

      const expiry =
        new Date(reservation.expiresAt).getTime();

      const distance = expiry - now;

      if (distance <= 0) {

        cancelReservation();

        clearInterval(interval);

        return;
      }

      const minutes =
        Math.floor(distance / 1000 / 60);

      const seconds =
        Math.floor((distance / 1000) % 60);

      setTimeLeft(
        `${minutes}:${seconds
          .toString()
          .padStart(2, "0")}`
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [reservation]);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main className="p-10">

      <h1 className="text-4xl font-bold mb-8">
        Inventory Reservation System
      </h1>

      <table className="border-collapse border w-full">

        <thead>

          <tr className="bg-gray-200">

            <th className="border p-3">
              Product
            </th>

            <th className="border p-3">
              Warehouse
            </th>

            <th className="border p-3">
              Available
            </th>

            <th className="border p-3">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {products.map((item) => (

            <tr key={item.inventoryId}>

              <td className="border p-3">
                {item.product}
              </td>

              <td className="border p-3">
                {item.warehouse}
              </td>

              <td className="border p-3">
                {item.availableUnits}
              </td>

              <td className="border p-3">

                <button
                  onClick={() =>
                    reserveProduct(item.inventoryId)
                  }
                  className="bg-black text-white px-4 py-2"
                >
                  Reserve
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {reservation && (

        <div className="mt-10 border p-6">

          <h2 className="text-2xl font-bold mb-4">
            Active Reservation
          </h2>

          <p className="mb-4">
            Expires In: {timeLeft}
          </p>

          <div className="flex gap-4">

            <button
              onClick={confirmReservation}
              className="bg-green-600 text-white px-4 py-2"
            >
              Confirm Purchase
            </button>

            <button
              onClick={cancelReservation}
              className="bg-red-600 text-white px-4 py-2"
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </main>
  );
}