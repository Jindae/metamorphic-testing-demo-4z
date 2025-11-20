"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GitBranch } from "lucide-react"
import type { SavedTestSuite } from "@/app/page"

interface SelectTestSuiteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTestSuite: (suite: SavedTestSuite) => void
  testSuites: SavedTestSuite[]
}

export function SelectTestSuiteDialog({
  open,
  onOpenChange,
  onSelectTestSuite,
  testSuites,
}: SelectTestSuiteDialogProps) {
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null)

  const handleSelect = () => {
    const suite = testSuites.find((s) => s.id === selectedSuiteId)
    if (suite) {
      onSelectTestSuite(suite)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Test Suite</DialogTitle>
          <DialogDescription>Choose a saved test suite to execute</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          {testSuites.length > 0 ? (
            <div className="space-y-3">
              {testSuites.map((suite) => (
                <div
                  key={suite.id}
                  onClick={() => setSelectedSuiteId(suite.id)}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    selectedSuiteId === suite.id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/50 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{suite.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(suite.savedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{suite.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          <span>{suite.metamorphicRelations.length} MRs</span>
                        </div>
                        <div>
                          <span>{suite.totalTests} tests</span>
                        </div>
                        {suite.selectedSeedTest && (
                          <div>
                            <span>Seed: {suite.selectedSeedTest.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No saved test suites yet
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedSuiteId}>
            Load Test Suite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
