"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "@/i18n/routing"
import { useState, useTransition } from "react"
import { LoginFormValues, loginSchema } from "@/schemas/auth-schema"
import { login } from "@/actions/auth-actions"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Mail, Loader2, X } from "lucide-react"
import { useTranslations } from "next-intl"

interface LoginFormProps {
    onClose?: () => void
}

export function LoginForm({ onClose }: LoginFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const t = useTranslations("LoginPage")

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(data: LoginFormValues) {
        console.log("Submitting login form...", data);
        setError(null)
        startTransition(async () => {
            try {
                const result = await login(data)
                console.log("Login result:", result);
                if (result.success) {
                    console.log("Redirecting to dashboard...");
                    router.push("/dashboard")
                } else {
                    console.log("Login failed with error:", result.error);
                    setError(result.error || "Authentication failed")
                }
            } catch (err) {
                console.error("Login action threw error:", err);
                setError("An unexpected error occurred")
            }
        })
    }

    return (
        <Card className="w-full max-w-md border-border/50 bg-card/60 backdrop-blur-xl relative overflow-hidden group">
            {onClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-primary/10 transition-colors"
                    onClick={onClose}
                    type="button"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
            {/* Neon Glow Border Effect */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-75 group-hover:opacity-100 transition-opacity" />

            <CardHeader className="space-y-2 text-center pb-8 pt-10">
                <div className="mx-auto h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                    <Shield className="h-7 w-7 text-primary animate-pulse" />
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight">
                    {t('title')}
                </CardTitle>
                <CardDescription className="text-muted-foreground/80 font-medium">
                    {t('subtitle')}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm font-medium text-center animate-shake">
                                {error}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="sr-only">{t('emailLabel')}</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder={t('emailPlaceholder')}
                                                className="pl-10 h-10 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-lg"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-1">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">{t('passwordLabel')}</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="password"
                                                    placeholder={t('passwordPlaceholder')}
                                                    className="pl-10 h-10 bg-background/50 border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-lg"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end">
                                <Button variant="link" size="sm" className="px-0 font-normal text-xs text-muted-foreground hover:text-primary transition-colors">
                                    {t('forgotPassword')}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-medium shadow-[0_0_20px_-5px_var(--color-primary)] hover:shadow-[0_0_25px_-5px_var(--color-primary)] transition-all rounded-lg bg-gradient-to-r from-primary to-primary/80"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('authenticating')}
                                </>
                            ) : (
                                t('signIn')
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 text-center pb-8">
                <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted/30" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">{t('orContinue')}</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:text-primary transition-colors">
                        Google
                    </Button>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:text-primary transition-colors">
                        GitHub
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
