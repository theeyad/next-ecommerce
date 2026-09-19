import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/shared/ProfileEditForm";
import { profileType } from "@/lib/validation/types";

export default async function EditCustomerProfilePage() {
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

  const fullProfile: profileType = {
    ...(profile || {}),
    id: user.id,
    role: profile?.role || "customer",
    full_name: profile?.full_name || user?.user_metadata?.full_name || null,
    avatar_url: profile?.avatar_url || user?.user_metadata?.avatar_url || null,
    email: user.email,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProfileEditForm profile={fullProfile} isAdminView={false} />
    </div>
  );
}
