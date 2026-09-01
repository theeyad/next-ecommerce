import AuthNavbar from "@/components/shared/AuthNavbar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
        <AuthNavbar />
      {children}
    </div>
  );
}
