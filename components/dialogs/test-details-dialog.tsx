"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trash2 } from "lucide-react"

interface Test {
  id: string
  name: string
  description: string
  image?: string
  prompt: string
  expectedResult: string
  type: string
  registeredAt: string
}

interface TestDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  test: Test | null
  onDeleteTest?: (testId: string) => void
}

export function TestDetailsDialog({ open, onOpenChange, test, onDeleteTest }: TestDetailsDialogProps) {
  if (!test) return null

  const handleDelete = () => {
    if (onDeleteTest) {
      onDeleteTest(test.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{test.name}</DialogTitle>
          <DialogDescription>Seed test details and configuration</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {test.image && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Image</span>
              <img
                src={test.image || "/placeholder.svg"}
                alt={test.name}
                className="w-full max-w-md rounded-lg border border-border object-cover"
              />
              <Separator />
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Type</span>
              <span className="text-sm font-medium">{test.type}</span>
            </div>
            <Separator />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Registered</span>
              <span className="text-sm font-medium">{new Date(test.registeredAt).toLocaleString()}</span>
            </div>
            <Separator />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Description</span>
            <p className="text-sm leading-relaxed">{test.description}</p>
            <Separator />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Prompt</span>
            <p className="text-sm leading-relaxed">{test.prompt}</p>
            <Separator />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Expected Result</span>
            <p className="text-sm leading-relaxed">{test.expectedResult}</p>
          </div>
        </div>
        {onDeleteTest && (
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Seed Test
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
