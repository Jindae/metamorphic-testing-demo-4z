"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface GenerateTestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GenerateTestDialog({ open, onOpenChange }: GenerateTestDialogProps) {
  const [sourceTest, setSourceTest] = useState("")
  const [relation, setRelation] = useState("")
  const [count, setCount] = useState("5")

  const handleGenerate = () => {
    console.log("Generating tests:", { sourceTest, relation, count })
    onOpenChange(false)
    setSourceTest("")
    setRelation("")
    setCount("5")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Metamorphic Tests</DialogTitle>
          <DialogDescription>
            Create new test cases using metamorphic relations
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="source-test">Source Test</Label>
            <Select value={sourceTest} onValueChange={setSourceTest}>
              <SelectTrigger id="source-test">
                <SelectValue placeholder="Select source test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auth">User Authentication Test</SelectItem>
                <SelectItem value="payment">Payment Processing Test</SelectItem>
                <SelectItem value="api">API Response Validation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="relation">Metamorphic Relation</Label>
            <Select value={relation} onValueChange={setRelation}>
              <SelectTrigger id="relation">
                <SelectValue placeholder="Select relation type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permutation">Input Permutation</SelectItem>
                <SelectItem value="inverse">Inverse Transformation</SelectItem>
                <SelectItem value="addition">Additive Property</SelectItem>
                <SelectItem value="multiplication">Multiplicative Property</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="count">Number of Tests</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>Generate Tests</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
