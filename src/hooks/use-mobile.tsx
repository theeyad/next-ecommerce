// @ts-nocheck

import { useState, useEffect } from "react"

const MOBILE_BREAKPOINT = 767

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    window.addEventListener('resize', checkMobile)
    checkMobile() // Initial check
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}
