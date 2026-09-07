"use client";

import { NavMain } from "@/components/shared/NavMain";
import { NavSecondary } from "@/components/shared/NavSecondary";
import { NavUser } from "@/components/shared/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { adminUserType } from "@/lib/validation/types";

export function AppSidebar({
  userData,
  ...props
}: { userData: adminUserType } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href="/" >
                  <span className="text-base font-semibold">Baskify</span>
                </Link>
              }
              tooltip="Baskify"
              className="data-[slot=sidebar-menu-button]:p-1.5! cursor-default"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser userData={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
