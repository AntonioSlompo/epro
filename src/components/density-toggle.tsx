"use client"

import * as React from "react"
import { Check, Columns } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Density, useDensity } from "@/context/density-context"

const densities: { value: Density; label: string }[] = [
    { value: "super-compact", label: "Super Compacto" },
    { value: "compact", label: "Compacto" },
    { value: "normal", label: "Normal" },
    { value: "comfortable", label: "Confortável" },
    { value: "spacious", label: "Espaçoso" },
]

export function DensityToggle() {
    const { density, setDensity } = useDensity()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Columns className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Toggle density</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {densities.map((item) => (
                    <DropdownMenuItem
                        key={item.value}
                        onClick={() => setDensity(item.value)}
                    >
                        <span className="flex-1">{item.label}</span>
                        {density === item.value && <Check className="ml-2 h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
