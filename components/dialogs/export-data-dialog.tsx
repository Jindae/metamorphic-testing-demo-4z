"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Check } from "lucide-react"

interface ExportDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  data: any
  filename: string
}

export function ExportDataDialog({ open, onOpenChange, title, data, filename }: ExportDataDialogProps) {
  const [copied, setCopied] = useState(false)

  const transformedData = Array.isArray(data)
    ? data.map((item: any) => {
        if (item.image && item.image.startsWith("data:")) {
          // Replace base64 with placeholder path
          return {
            ...item,
            image: `/placeholder-${item.id}.jpg`,
          }
        }
        return item
      })
    : data

  const jsonString = JSON.stringify(transformedData, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Copy the JSON data below and save it to a file named {filename}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <Textarea value={jsonString} readOnly className="font-mono text-sm h-full resize-none" />
        </div>
        <DialogFooter>
          <Button onClick={handleCopy} variant="outline">
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
