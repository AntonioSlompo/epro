import { cn } from "@/lib/utils";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    backHref?: string;
}

export function PageHeader({ title, description, children, backHref }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 pb-6 pt-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
                {backHref && (
                    <Button variant="ghost" size="icon" asChild className="shrink-0">
                        <Link href={backHref}>
                            <MoveLeft className="h-5 w-5" />
                            <span className="sr-only">Back</span>
                        </Link>
                    </Button>
                )}
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-glow md:text-3xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-muted-foreground md:text-base">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    );
}
