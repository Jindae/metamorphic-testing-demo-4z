"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { SavedTestSuite } from "@/app/page"

interface TestSuiteDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  testSuite: SavedTestSuite | null
  onDeleteTestSuite?: (suiteId: string) => void
}

export function TestSuiteDetailsDialog({
  open,
  onOpenChange,
  testSuite,
  onDeleteTestSuite,
}: TestSuiteDetailsDialogProps) {
  if (!testSuite) return null

  const handleDelete = () => {
    if (onDeleteTestSuite) {
      onDeleteTestSuite(testSuite.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{testSuite.name}</DialogTitle>
          <DialogDescription>Test suite configuration and details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Description</span>
            <p className="text-sm leading-relaxed">{testSuite.description}</p>
            <Separator />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Seed Test</span>
            <p className="text-sm leading-relaxed">
              {testSuite.selectedSeedTest ? testSuite.selectedSeedTest.name : "None selected"}
            </p>
            <Separator />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Metamorphic Relations</span>
            <div className="text-sm leading-relaxed">
              {testSuite.metamorphicRelations.length > 0 ? (
                <ul className="list-inside list-disc space-y-1">
                  {testSuite.metamorphicRelations.map((mr) => (
                    <li key={mr.name}>
                      {mr.name} ({mr.generatedCount} tests)
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No metamorphic relations added</p>
              )}
            </div>
            <Separator />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Total Generated Tests</span>
            <p className="text-sm leading-relaxed">{testSuite.totalTests}</p>
            <Separator />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Saved At</span>
            <p className="text-sm leading-relaxed">{new Date(testSuite.savedAt).toLocaleString()}</p>
          </div>
        </div>
        {onDeleteTestSuite && (
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Test Suite
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
