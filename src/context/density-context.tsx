"use client"

import * as React from "react"

export type Density = "super-compact" | "compact" | "normal" | "comfortable" | "spacious"

type DensityContextType = {
    density: Density
    setDensity: (density: Density) => void
}

const DensityContext = React.createContext<DensityContextType | undefined>(undefined)

export function DensityProvider({ children }: { children: React.ReactNode }) {
    const [density, setDensity] = React.useState<Density>("normal")

    React.useEffect(() => {
        const savedDensity = localStorage.getItem("ui-density") as Density
        if (savedDensity) {
            setDensity(savedDensity)
        }
    }, [])

    React.useEffect(() => {
        document.documentElement.setAttribute("data-density", density)
        localStorage.setItem("ui-density", density)
    }, [density])

    return (
        <DensityContext.Provider value={{ density, setDensity }}>
            {children}
        </DensityContext.Provider>
    )
}

export function useDensity() {
    const context = React.useContext(DensityContext)
    if (context === undefined) {
        throw new Error("useDensity must be used within a DensityProvider")
    }
    return context
}
