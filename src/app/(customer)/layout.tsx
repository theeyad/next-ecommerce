import CustomerNavbar from "@/components/shared/CustomerNavbar";
import CustomerFooter from "@/components/shared/CustomerFooter";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground transition-colors">
      <CustomerNavbar />
      <main className="flex-1">{children}</main>
      <CustomerFooter />
    </div>
  );
}
