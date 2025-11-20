"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Test } from "@/components/test-registration"

interface SelectSeedTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTest: (test: Test) => void
  seedTests: Test[]
}

export function SelectSeedTestDialog({ open, onOpenChange, onSelectTest, seedTests }: SelectSeedTestDialogProps) {
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)

  const handleSelect = () => {
    if (selectedTest) {
      onSelectTest(selectedTest)
      onOpenChange(false)
      setSelectedTest(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Seed Test</DialogTitle>
          <DialogDescription>
            Choose a seed test to use for metamorphic test generation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4 max-h-[400px] overflow-y-auto">
          {seedTests.map((test) => (
            <div
              key={test.id}
              className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                selectedTest?.id === test.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:bg-accent/50'
              }`}
              onClick={() => setSelectedTest(test)}
            >
              {test.image && (
                <img 
                  src={test.image || "/placeholder.svg"} 
                  alt={test.name}
                  className="h-16 w-16 rounded-md object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{test.name}</h3>
                <p className="text-sm text-muted-foreground">{test.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{test.type}</p>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedTest}>
            Select Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
