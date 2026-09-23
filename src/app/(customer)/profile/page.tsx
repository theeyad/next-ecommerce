import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileViewCard } from "@/components/shared/ProfileViewCard";
import { profileType } from "@/lib/validation/types";

export default async function CustomerProfilePage() {
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

  const { data: userOrders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ProfileViewCard
        profile={fullProfile}
        orders={(userOrders as any) || []}
        isAdminView={false}
      />
    </div>
  );
}
