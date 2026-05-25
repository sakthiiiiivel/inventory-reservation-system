import "./globals.css";

export const metadata = {
  title: "Inventory Reservation System",
  description: "Multi-Warehouse Inventory Reservation System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}