"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { DensityToggle } from "@/components/density-toggle"
import { useTranslations } from "next-intl"
import { Shield, X } from "lucide-react"

export default function Home() {
  console.log("HomePage: Rendering");
  const t = useTranslations("HomePage")
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen w-full bg-background font-[family-name:var(--font-geist-sans)] transition-colors duration-300 flex flex-col relative overflow-hidden">
      {/* Background Grid & Radar Effect */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Rotating Radar Sweep */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0_340deg,var(--color-primary)_360deg)] opacity-10 rounded-full animate-radar-spin pointer-events-none z-0 blur-3xl" />

      {/* Pulsar Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-primary/20 animate-pulsar pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary/10 animate-pulsar delay-1000 pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/5 animate-pulsar delay-2000 pointer-events-none z-0" />

      {/* Monitored Points (Blinking Dots) */}
      <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-primary animate-ping" />
      <div className="absolute top-3/4 left-2/3 h-2 w-2 rounded-full bg-red-500 animate-ping delay-700" />
      <div className="absolute top-1/3 right-1/4 h-2 w-2 rounded-full bg-green-500 animate-ping delay-300" />

      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 glass-panel mx-4 mt-4 rounded-2xl transition-all duration-500">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary shadow-[0_0_15px_var(--color-primary)] flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t('title')}</span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-lg cursor-pointer hover:bg-primary/10 transition-all"
            onClick={() => setShowLogin(true)}
          >
            {t('signIn')}
          </Button>
          <LanguageToggle />
          <DensityToggle />
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto flex items-center justify-center p-6 mt-16 relative z-10 h-[calc(100vh-100px)]">

        {/* Left Side (Hero) */}
        <div className={`flex-1 flex flex-col justify-center transition-all duration-700 ease-in-out ${showLogin ? "items-start text-left lg:max-w-[50%]" : "items-center text-center max-w-4xl"}`}>
          <section className="space-y-8 relative pointer-events-auto">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter relative z-10 leading-tight">
              {t('heroSubtitle')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400 animate-pulse">
                {t('heroTitle')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground relative z-10 leading-relaxed max-w-2xl">
              {t('heroDescription')}
            </p>
          </section>
        </div>

        {/* Right Side (Login) */}
        <div className={`relative flex flex-col justify-center items-center transition-all duration-700 ease-in-out overflow-hidden ${showLogin ? "w-full lg:max-w-[50%] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-20"}`}>
          <div className="w-full max-w-md mx-auto relative z-10">
            <LoginForm onClose={() => setShowLogin(false)} />
          </div>
        </div>

      </main>

      {/* Overlay for small screens if needed, or remove if handling responsiveness differently */}
      {showLogin && (
        <div className="lg:hidden fixed inset-0 z-[55] bg-background/80 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
      )}
    </div>
  );
}
