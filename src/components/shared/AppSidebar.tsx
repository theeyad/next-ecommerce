"use client";

import {
  IconDashboard,
  IconList,
  IconListDetails,
  IconShoppingBag,
  IconUsers,
} from "@tabler/icons-react";

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

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Categories",
      url: "#",
      icon: IconListDetails,
    },
    {
      title: "Products",
      url: "#",
      icon: IconShoppingBag,
    },
    {
      title: "Orders",
      url: "#",
      icon: IconList,
    },
    {
      title: "Users",
      url: "#",
      icon: IconUsers,
    },
  ],
};

export function AppSidebar({
  userData,
  ...props
}: { userData: adminUserType } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href="/">
                  <span className="text-base font-semibold">Baskify</span>
                </Link>
              }
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser userData={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
