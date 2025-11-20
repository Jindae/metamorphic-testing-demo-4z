"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const mrOptions = [
  { id: "rotation", name: "Rotation", description: "Rotate the image by various angles" },
  { id: "greyscale", name: "Greyscale", description: "Convert image to greyscale" },
  { id: "noise", name: "Noise Injection", description: "Add noise to the image" },
  { id: "scale", name: "Size Adjustment", description: "Scale the image to different sizes" }
]

interface AddMRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMRs: (selectedMRs: string[]) => void
}

export function AddMRDialog({ open, onOpenChange, onAddMRs }: AddMRDialogProps) {
  const [selectedMRs, setSelectedMRs] = useState<string[]>([])

  const handleToggleMR = (mrName: string) => {
    setSelectedMRs(prev => 
      prev.includes(mrName) 
        ? prev.filter(id => id !== mrName)
        : [...prev, mrName]
    )
  }

  const handleAdd = () => {
    if (selectedMRs.length > 0) {
      onAddMRs(selectedMRs)
      setSelectedMRs([])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Metamorphic Relations</DialogTitle>
          <DialogDescription>
            Select metamorphic relations to apply for test generation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {mrOptions.map((mr) => (
            <div
              key={mr.id}
              className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                selectedMRs.includes(mr.name)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-accent/50'
              }`}
              onClick={() => handleToggleMR(mr.name)}
            >
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {mr.name}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {mr.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={selectedMRs.length === 0}>
            Add Selected ({selectedMRs.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
