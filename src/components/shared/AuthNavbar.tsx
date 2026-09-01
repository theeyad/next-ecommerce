"use client";

import { CoolThemeToggle } from "@/components/lightswind/cool-theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AuthNavbar() {
  const isMobile = useIsMobile();
  return (
    <>
      {isMobile ? (
        <></>
      ) : (
        <div className={`fixed top-5 right-5`}>
          <CoolThemeToggle />
        </div>
      )}
    </>
  );
}
