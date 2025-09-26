"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

const DEFAULT_THEME = "default"

type ThemeContextType = {
  activeTheme: string
  setActiveTheme: (theme: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ActiveThemeProvider({
  children,
}: {
  children: ReactNode
}) {
  const [activeTheme, setActiveTheme] = useState<string>(DEFAULT_THEME)

  // Read theme from cookies on client side
  useEffect(() => {
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const savedTheme = getCookieValue('activeTheme');
    if (savedTheme) {
      setActiveTheme(savedTheme);
    }
  }, [])

  // Custom setActiveTheme function that also persists to cookies
  const handleSetActiveTheme = (theme: string) => {
    setActiveTheme(theme)
    // Persist theme to cookies
    document.cookie = `activeTheme=${theme}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year
  }

  useEffect(() => {
    Array.from(document.body.classList)
      .filter((className) => className.startsWith("theme-"))
      .forEach((className) => {
        document.body.classList.remove(className)
      })
    document.body.classList.add(`theme-${activeTheme}`)
    if (activeTheme.endsWith("-scaled")) {
      document.body.classList.add("theme-scaled")
    }
  }, [activeTheme])

  return (
    <ThemeContext.Provider value={{ activeTheme, setActiveTheme: handleSetActiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeConfig() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useThemeConfig must be used within an ActiveThemeProvider")
  }
  return context
}