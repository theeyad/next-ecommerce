import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileViewCard } from "@/components/shared/ProfileViewCard";
import { profileType } from "@/lib/validation/types";

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const fullProfile: profileType = {
    ...(profile || {}),
    id: user.id,
    role: "admin",
    full_name: profile?.full_name || user?.user_metadata?.full_name || null,
    avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || null,
    email: user.email,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Admin Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your system administrator credentials and settings.
        </p>
      </div>

      <ProfileViewCard profile={fullProfile} isAdminView={true} />
    </div>
  );
}
