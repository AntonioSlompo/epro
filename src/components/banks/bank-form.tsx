"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bankSchema, type BankFormValues } from "@/schemas/bank-schema"
import { useTranslations } from "next-intl"
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
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransition, useState } from "react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"
import { createBank, updateBank } from "@/actions/bank-actions"
import { Upload, X, Building2, Landmark, Image as ImageIcon } from "lucide-react"

interface BankFormProps {
  initialData?: any
  isEditing?: boolean
}

export function BankForm({ initialData, isEditing = false }: BankFormProps) {
  const t = useTranslations("Banks")
  const tCommon = useTranslations("Common")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null)

  const form = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema) as any,
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      nickname: initialData?.nickname || "",
      logo: initialData?.logo || "",
      active: initialData?.active ?? true,
    } as any,
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Imagem muito grande. Máximo 1MB.")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setLogoPreview(base64String)
        form.setValue("logo", base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoPreview(null)
    form.setValue("logo", "")
  }

  async function onSubmit(data: BankFormValues) {
    startTransition(async () => {
      const result = isEditing 
        ? await updateBank(initialData.id, data)
        : await createBank(data)

      if (result.success) {
        toast.success(isEditing ? t("form.updateSuccess") : t("form.createSuccess"))
        router.push("/banks")
        router.refresh()
      } else {
        toast.error(result.error || tCommon("error"))
      }
    })
  }

  return (
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* 1. Dados Principais */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" />
              {t("form.identification")}
            </CardTitle>
            <FormField
              control={form.control as any}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-xs font-normal text-muted-foreground uppercase tracking-wider">
                    {t("form.active")}
                  </FormLabel>
                </FormItem>
              )}
            />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormField
              control={form.control as any}
              name="code"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>{t("form.code")} *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>{t("form.name")} *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Banco do Brasil S.A." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as any}
              name="nickname"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel>{t("form.nickname")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Banco do Brasil" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 2. Logo */}
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              {t("form.logoTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/20 hover:border-primary/50 transition-colors shrink-0">
                {logoPreview ? (
                  <>
                    <img 
                      src={logoPreview} 
                      alt="Bank Logo" 
                      className="w-full h-full object-contain p-2"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={removeLogo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                    <Building2 className="w-8 h-8 opacity-50" />
                    <span className="text-xs font-medium">Sem Logo</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Logotipo do Banco</p>
                  <p className="text-xs text-muted-foreground">
                    Carregue uma imagem no formato PNG, JPG ou SVG. O arquivo deve ter no máximo 1MB.
                  </p>
                </div>
                
                <label 
                  htmlFor="logo-upload" 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {logoPreview ? "Alterar Logo" : "Upload Logo"}
                  <input 
                    id="logo-upload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoChange}
                    disabled={isPending}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? tCommon("saving") : tCommon("save")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
