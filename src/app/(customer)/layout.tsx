import CustomerNavbar from "@/components/shared/CustomerNavbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <CustomerNavbar />
      {children}
    </div>
  );
}
