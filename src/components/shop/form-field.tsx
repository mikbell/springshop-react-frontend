import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Definiamo i tipi estendendo direttamente le proprietà native dell'Input di Radix/Shadcn
interface FieldProps extends React.ComponentProps<typeof Input> {
  name: string
  label: string
  error?: string
}

export function Field({
  error,
  label,
  name,
  className,
  id,
  ...props
}: FieldProps) {
  const inputId = id ?? name

  return (
    <div className="grid gap-1.5 w-full">
      {/* Label stilizzata secondo gli standard Shadcn */}
      <Label
        htmlFor={inputId}
        className={cn(error && "text-destructive")}
      >
        {label}
      </Label>

      {/* Input con gestione avanzata degli stati di errore e focus */}
      <Input
        id={inputId}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "rounded-lg shadow-sm transition-colors",
          error && "border-destructive text-destructive placeholder:text-destructive/60 focus-visible:ring-destructive",
          className
        )}
        {...props}
      />

      {/* Messaggio di Errore con micro-animazione d'ingresso */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs font-medium text-destructive tracking-tight animate-in fade-in-50 slide-in-from-top-1 duration-150"
        >
          {error}
        </p>
      )}
    </div>
  )
}