"use client";

import {
  IconDashboard,
  IconList,
  IconListDetails,
  IconShoppingBag,
  IconUsers,
} from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const navItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: IconDashboard,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: IconListDetails,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: IconShoppingBag,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: IconList,
  },
];

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                render={
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                }
                tooltip={item.title}
                className="cursor-default"
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
