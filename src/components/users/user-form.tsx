"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition, useRef } from "react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createUser, updateUser } from "@/actions/user-actions"
import { UserFormValues, userSchema } from "@/schemas/user-schema"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Need to create/verify Avatar component
import { Camera } from "lucide-react"
import { useTranslations } from "next-intl"

interface UserFormProps {
    initialData?: any // Relaxed type to match potential DB return
    mode: "create" | "edit"
}

export function UserForm({ initialData, mode }: UserFormProps) {
    const router = useRouter()
    const t = useTranslations("Users.form")
    const tCommon = useTranslations("Common")
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<string | null>(initialData?.image || null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            password: "", // Always empty by default
            image: initialData?.image || "",
            active: initialData?.active ?? true,
        },
    })

    function onSubmit(data: UserFormValues) {
        setError(null)
        startTransition(async () => {
            let result
            if (mode === "edit" && initialData?.id) {
                result = await updateUser(initialData.id, data as UserFormValues)
            } else {
                result = await createUser(data as UserFormValues)
            }

            if (result.success) {
                router.push("/users")
                router.refresh()
            } else {
                setError(typeof result.error === 'string' ? result.error : tCommon("error"))
            }
        })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                setPreview(base64String)
                form.setValue("image", base64String) // Store base64 in form
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Image Upload Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative h-32 w-32">
                                {/* We need an Avatar component or just basic img for now */}
                                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-muted bg-muted flex items-center justify-center relative">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-4xl text-muted-foreground">?</span>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="icon"
                                    className="absolute bottom-0 right-0 rounded-full"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Camera className="h-4 w-4" />
                                </Button>
                            </div>
                            <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("nameLabel")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("namePlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("emailLabel")}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t("emailPlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t("passwordLabel")} {mode === 'edit' && <span className="text-xs font-normal text-muted-foreground">{t("passwordHint")}</span>}</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder={t("passwordPlaceholder")} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="accent-primary h-4 w-4"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            {t("activeLabel")}
                                        </FormLabel>
                                        <FormDescription>
                                            {t("activeDesc")}
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isPending}
                            >
                                {tCommon("cancel")}
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? tCommon("saving") : mode === "create" ? t("createPayload") : tCommon("saveChanges")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
