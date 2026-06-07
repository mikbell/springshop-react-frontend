import * as React from "react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export function AuthShell({
    children,
    description,
    footer,
    title,
}: {
    children: React.ReactNode
    description: string
    footer: React.ReactNode
    title: string
}) {
    return (
        <div className="grid min-h-[calc(100svh-7rem)] place-items-center px-4 py-6">
            <Card className="w-full max-w-md rounded-xl border shadow-md animate-in fade-in-50 duration-200">
                <CardHeader className="space-y-1.5 text-center sm:text-left">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">
                        {description}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    {children}

                    <div className="mt-2 border-t pt-4 text-center text-sm text-muted-foreground">
                        {footer}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}