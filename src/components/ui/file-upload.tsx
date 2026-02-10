"use client"

import * as React from "react"
import { useDropzone, type DropzoneOptions } from "react-dropzone"
import { Upload, X, File, FileIcon, Trash2 } from "lucide-react" // Import icons
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploadProps extends DropzoneOptions {
    className?: string
    onFilesChange?: (files: File[]) => void
    value?: File[]
    onRemove?: (file: File) => void
}

export function FileUpload({
    className,
    onFilesChange,
    value = [],
    onRemove,
    ...dropzoneOptions
}: FileUploadProps) {
    const [files, setFiles] = React.useState<File[]>(value)

    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        const newFiles = [...files, ...acceptedFiles]
        setFiles(newFiles)
        onFilesChange?.(newFiles)
    }, [files, onFilesChange])

    const handleRemove = (fileToRemove: File) => {
        const newFiles = files.filter(f => f !== fileToRemove)
        setFiles(newFiles)
        onFilesChange?.(newFiles)
        onRemove?.(fileToRemove)
    }

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        ...dropzoneOptions
    })

    return (
        <div className={cn("space-y-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 text-center",
                    isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    isDragReject && "border-destructive bg-destructive/5",
                    className
                )}
            >
                <input {...getInputProps()} />
                <div className={cn(
                    "p-3 rounded-full bg-muted transition-colors",
                    isDragActive ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}>
                    <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium">
                        {isDragActive ? "Solte os arquivos aqui" : "Arraste e solte arquivos aqui"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        ou clique para selecionar
                    </p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-3 p-3 rounded-md border bg-card/50 hover:bg-card transition-colors group"
                        >
                            <div className="p-2 rounded-md bg-muted">
                                <FileIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemove(file)}
                            >
                                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
