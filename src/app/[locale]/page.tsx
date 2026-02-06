import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { DensityToggle } from "@/components/density-toggle"
import { useTranslations } from "next-intl"
import { Shield } from "lucide-react"

export default function Home() {
  const t = useTranslations("HomePage")

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

      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 glass-panel mx-4 mt-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary shadow-[0_0_15px_var(--color-primary)] flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">{t('title')}</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-lg font-medium text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">{t('nav.dashboard')}</a>
          <a href="#" className="hover:text-primary transition-colors">{t('nav.properties')}</a>
          <a href="#" className="hover:text-primary transition-colors">{t('nav.finance')}</a>
          <a href="#" className="hover:text-primary transition-colors">{t('nav.settings')}</a>
        </nav>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-lg">{t('signIn')}</Button>
          <Button size="lg" className="text-lg shadow-[0_0_20px_var(--color-primary)] hover:shadow-[0_0_30px_var(--color-primary)] transition-all">
            {t('getStarted')}
          </Button>
          <LanguageToggle />
          <DensityToggle />
          <ModeToggle />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16 relative z-10">
        {/* Hero Section */}
        <section className="text-center space-y-8 relative max-w-4xl mx-auto py-20">

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter relative z-10 leading-tight">
            {t('heroSubtitle')} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-cyan-400 animate-pulse">
              {t('heroTitle')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto relative z-10 leading-relaxed">
            {t('heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8 relative z-10">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-[0_0_20px_-5px_var(--color-primary)] hover:scale-105 transition-transform">
              {t('startTrial')}
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full glass-card hover:bg-white/10 hover:scale-105 transition-transform">
              {t('watchDemo')}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
