import { Input } from "@/components/ui/input"
import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field"

interface MoneyInputProps extends Omit<CurrencyInputProps, "className"> {
    className?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function MoneyInput({
    className,
    ...props
}: MoneyInputProps) {
    return (
        <CurrencyInput
            decimalsLimit={2}
            decimalScale={2}
            prefix="R$ "
            groupSeparator="."
            decimalSeparator=","
            allowNegativeValue={false}
            intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${className}`}
            {...props}
        />
    )
}
