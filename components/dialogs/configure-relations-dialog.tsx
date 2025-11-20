"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface MetamorphicRelation {
  id: string
  name: string
  sourceTest: string
  relation: string
  generatedTests: number
}

interface ConfigureRelationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  relation: MetamorphicRelation | null
}

export function ConfigureRelationsDialog({ open, onOpenChange, relation }: ConfigureRelationsDialogProps) {
  if (!relation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configure Relation</DialogTitle>
          <DialogDescription>{relation.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Source Test</Label>
            <Input value={relation.sourceTest} disabled />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Relation Type</Label>
            <Input value={relation.relation} disabled />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Generated Tests</Label>
            <div className="text-2xl font-bold">{relation.generatedTests}</div>
            <p className="text-sm text-muted-foreground">
              Test cases created from this relation
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
