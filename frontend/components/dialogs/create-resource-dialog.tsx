"use client"

import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface CreateResourceDialogProps {
  title: string
  description: string
  triggerLabel: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateResourceDialog({
  title,
  description,
  triggerLabel,
  children,
  open,
  onOpenChange,
}: CreateResourceDialogProps) {
  // Ensure all props are defined with fallbacks to prevent undefined errors
  const safeTitle = title || "Create Resource"
  const safeDescription = description || "Add a new resource to the system"
  const safeTriggerLabel = triggerLabel || "New Resource"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {safeTriggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{safeTitle}</DialogTitle>
          <DialogDescription>{safeDescription}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
