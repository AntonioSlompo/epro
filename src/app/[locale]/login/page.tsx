
import { LoginForm } from "@/components/auth/login-form"
import { useTranslations } from "next-intl"

export default function LoginPage() {
    const t = useTranslations("LoginPage")
    return (
        <div className="min-h-screen w-full bg-background font-[family-name:var(--font-geist-sans)] flex flex-col items-center justify-center relative overflow-hidden p-4">
            {/* Background Grid & Radar Effect (Reused) */}
            <div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            {/* Rotating Radar Sweep */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0_340deg,var(--color-primary)_360deg)] opacity-10 rounded-full animate-radar-spin pointer-events-none z-0 blur-3xl" />

            {/* Floating Elements */}
            <div className="absolute top-1/4 left-1/4 h-32 w-32 rounded-full bg-primary/20 blur-[100px] animate-pulsar pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 h-32 w-32 rounded-full bg-secondary/20 blur-[100px] animate-pulsar delay-1000 pointer-events-none" />

            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                <LoginForm />
                <p className="mt-8 text-center text-sm text-muted-foreground">
                    {t('noAccount')}{" "}
                    <a href="#" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all">
                        {t('contactAdmin')}
                    </a>
                </p>
            </div>
        </div>
    )
}
