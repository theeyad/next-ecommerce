import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userData = {
    fullName: user?.user_metadata?.full_name,
    email: user?.user_metadata?.email,
    avatar: user?.user_metadata?.avatar_url,
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" userData={userData} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2"></div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
