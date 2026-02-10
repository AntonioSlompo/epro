"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { PageHeader } from "@/components/ui/page-header"

export default function FileUploadDemoPage() {
    const t = useTranslations("FileUploadDemo")
    const [files, setFiles] = useState<File[]>([])

    const handleFilesChange = (newFiles: File[]) => {
        setFiles(newFiles)
        console.log("Arquivos selecionados:", newFiles)
    }

    const handleRemove = (file: File) => {
        console.log("Arquivo removido:", file.name)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (files.length === 0) {
            alert(t("noFilesError"))
            return
        }
        const fileNames = files.map(f => f.name).join(", ")
        alert(`${t("uploadSuccess")}: ${fileNames}`)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={t("title")}
                description={t("description")}
            />

            <Card>
                <CardHeader>
                    <CardTitle>{t("cardTitle")}</CardTitle>
                    <CardDescription>{t("cardDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
                        <FileUpload
                            onFilesChange={handleFilesChange}
                            onRemove={handleRemove}
                            value={files}
                            maxFiles={5}
                            accept={{
                                'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                                'application/pdf': ['.pdf']
                            }}
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={files.length === 0}>
                                {t("submit")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
