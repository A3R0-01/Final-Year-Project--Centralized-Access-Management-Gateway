"use client"

import type * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  children: React.ReactNode
}

export function CheckboxGroup({ className, children, ...props }: CheckboxGroupProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  )
}

export interface CheckboxItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  description?: string
}

export function CheckboxItem({
  className,
  checked,
  onCheckedChange,
  label,
  description,
  id,
  ...props
}: CheckboxItemProps) {
  return (
    <div className="flex items-start space-x-2">
      <div className="flex items-center h-5">
        <div
          className={cn(
            "h-4 w-4 rounded border border-primary shrink-0 flex items-center justify-center",
            checked && "bg-primary text-primary-foreground",
            "transition-colors cursor-pointer",
          )}
          onClick={() => onCheckedChange && onCheckedChange(!checked)}
        >
          {checked && <CheckIcon className="h-3 w-3" />}
        </div>
      </div>
      <div className="flex flex-col">
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          onClick={() => onCheckedChange && onCheckedChange(!checked)}
        >
          {label}
        </label>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  )
}
