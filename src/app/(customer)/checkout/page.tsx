import { createClient } from "@/lib/supabase/server";
import { CheckoutClient } from "@/app/(customer)/checkout/CheckoutClient";

export default async function CustomerCheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const initialUser = {
    fullName: profile?.full_name || user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    addressLine1: profile?.address_line1 || "",
    city: profile?.city || "",
    postalCode: profile?.postal_code || "",
    country: profile?.country || "",
  };

  return <CheckoutClient initialUser={initialUser} />;
}
