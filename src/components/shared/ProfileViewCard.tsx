"use client";

import Link from "next/link";
import Image from "next/image";
import { profileType, orderType } from "@/lib/validation/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
} from "lucide-react";
import ProfileOrdersHistory from "@/components/shared/ProfileOrdersHistory";

import { IconLogout } from "@tabler/icons-react";
import { signOut } from "@/actions/auth";

interface ProfileViewCardProps {
  profile: profileType;
  orders?: orderType[];
  isAdminView?: boolean;
}

export function ProfileViewCard({
  profile,
  orders = [],
  isAdminView = false,
}: ProfileViewCardProps) {
  const isUserAdmin = profile.role === "admin" || isAdminView;

  const userInitials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  const editHref = isUserAdmin ? "/admin/profile/edit" : "/profile/edit";

  return (
    <div className="space-y-8">
      {/* HEADER CARD */}
      <div className="relative bg-card border border-border rounded-3xl overflow-hidden shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Container */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-muted shrink-0 shadow-md">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || "Profile Avatar"}
                fill
                className="object-cover"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary font-bold text-2xl flex items-center justify-center">
                {userInitials}
              </div>
            )}
          </div>

          {/* Details & Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-heading font-bold text-foreground">
                    {profile.full_name || "User Profile"}
                  </h1>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      profile.role === "admin"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}
                  >
                    {profile.role}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profile.email || "No email available"}
                </p>
              </div>

              {/* Edit Profile Action */}
              <div className="flex flex-col gap-2">
                <Link href={editHref} className="cursor-default">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 rounded-full cursor-default"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </Button>
                </Link>

                {/* logout button */}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-full cursor-default"
                  onClick={() => signOut()}
                >
                  <IconLogout className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>

            {/* Joined Date & Role Description */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground">
              {profile.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined {formatDate(new Date(profile.created_at))}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>
                  {profile.role === "admin"
                    ? "System Administrator Privileges"
                    : "Verified Account Customer"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS GRID (Contact & Address Info) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-sidebar border border-border p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold text-sm text-foreground">
              Contact Details
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground/70">
                  Email Address
                </span>
                <span className="text-foreground font-medium">
                  {profile.email || "Not set"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground/70">
                  Phone Number
                </span>
                <span className="text-foreground font-medium">
                  {profile.phone || "No phone number added"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Default Shipping Address */}
        <div className="bg-sidebar border border-border p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold text-sm text-foreground">
              Default Shipping Location
            </h3>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            {profile.address_line1 || profile.city || profile.country ? (
              <div className="space-y-1 text-foreground font-medium">
                {profile.address_line1 && <p>{profile.address_line1}</p>}
                <p>
                  {[profile.city, profile.postal_code, profile.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No default shipping address set. You can set your location in
                your profile settings.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOMER ORDER HISTORY SECTION (Hidden for Admins) */}
      {!isUserAdmin && <ProfileOrdersHistory orders={orders} />}
    </div>
  );
}
