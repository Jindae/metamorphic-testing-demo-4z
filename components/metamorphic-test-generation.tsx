"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { GitBranch, Play, Zap, Plus, Pencil, Minus, FileText, FolderOpen, Save, Sprout } from "lucide-react"
import { SelectSeedTestDialog } from "@/components/dialogs/select-seed-test-dialog"
import { AddMRDialog } from "@/components/dialogs/add-mr-dialog"
import { SelectTestSuiteDialog } from "@/components/dialogs/select-test-suite-dialog"
import type { Test } from "@/components/test-registration"
import type { TestGenerationStats, GeneratedTest, SavedTestSuite } from "@/app/page"

export interface MetamorphicRelation {
  id: string
  name: string
  type: string
  generatedCount: number
}

interface MetamorphicTestGenerationProps {
  seedTests: Test[]
  generationStats: TestGenerationStats
  setGenerationStats: React.Dispatch<React.SetStateAction<TestGenerationStats>>
  testSuiteName: string
  setTestSuiteName: (name: string) => void
  testSuiteDescription: string
  setTestSuiteDescription: (desc: string) => void
  selectedSeedTest: Test | null
  setSelectedSeedTest: (test: Test | null) => void
  metamorphicRelations: MetamorphicRelation[]
  setMetamorphicRelations: React.Dispatch<React.SetStateAction<MetamorphicRelation[]>>
  generatedTests: GeneratedTest[]
  setGeneratedTests: React.Dispatch<React.SetStateAction<GeneratedTest[]>>
  onSaveTestSuite: () => void
  savedTestSuites?: SavedTestSuite[]
  onLoadTestSuite?: (suite: SavedTestSuite) => void
}

const MR_TEST_COUNTS: Record<string, number> = {
  "Noise Injection": 10,
  Greyscale: 5,
  Rotation: 20,
  "Size Adjustment": 10,
}

const MR_GENERATION_SPEEDS: Record<string, number> = {
  "Noise Injection": 120,
  Greyscale: 40,
  Rotation: 120,
  "Size Adjustment": 40,
}

// Function to randomize speed with ±20% variation
const getRandomizedSpeed = (baseSpeed: number): number => {
  const variation = baseSpeed * 0.2 // 20% of base speed
  const randomOffset = (Math.random() * 2 - 1) * variation // Random value between -variation and +variation
  return Math.round(baseSpeed + randomOffset)
}

export function MetamorphicTestGeneration({
  seedTests,
  generationStats,
  setGenerationStats,
  testSuiteName,
  setTestSuiteName,
  testSuiteDescription,
  setTestSuiteDescription,
  selectedSeedTest,
  setSelectedSeedTest,
  metamorphicRelations,
  setMetamorphicRelations,
  generatedTests,
  setGeneratedTests,
  onSaveTestSuite,
  savedTestSuites = [],
  onLoadTestSuite,
}: MetamorphicTestGenerationProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingName, setEditingName] = useState("")
  const [selectSeedDialogOpen, setSelectSeedDialogOpen] = useState(false)
  const [addMRDialogOpen, setAddMRDialogOpen] = useState(false)
  const [selectTestSuiteDialogOpen, setSelectTestSuiteDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedMRIds, setSelectedMRIds] = useState<Set<string>>(new Set())

  const handleSelectSeedTest = (test: Test) => {
    setSelectedSeedTest(test)
  }

  const handleAddMRs = (selectedMRs: string[]) => {
    const newRelations = selectedMRs.map((mr) => ({
      id: Date.now().toString() + Math.random(),
      name: mr,
      type: mr,
      generatedCount: 0,
    }))
    setMetamorphicRelations((prev) => [...prev, ...newRelations])
  }

  const handleRemoveMRs = (mrIds: string[]) => {
    const removedTestCount = metamorphicRelations
      .filter((r) => mrIds.includes(r.id))
      .reduce((sum, r) => sum + r.generatedCount, 0)

    setMetamorphicRelations((prev) => prev.filter((r) => !mrIds.includes(r.id)))
    setSelectedMRIds(new Set())

    // Update global stats to subtract removed tests
    setGenerationStats((prev) => {
      const newMRCounts = { ...prev.mrCounts }
      metamorphicRelations
        .filter((r) => mrIds.includes(r.id))
        .forEach((r) => {
          delete newMRCounts[r.name]
        })

      return {
        totalGenerated: Math.max(0, prev.totalGenerated - removedTestCount),
        successRate: prev.totalGenerated - removedTestCount > 0 ? prev.successRate : 0,
        mrCounts: newMRCounts,
        testSuiteName: prev.testSuiteName,
      }
    })

    const removedMRNames = metamorphicRelations.filter((r) => mrIds.includes(r.id)).map((r) => r.name)
    setGeneratedTests((prev) => prev.filter((test) => !removedMRNames.includes(test.mrUsed)))
  }

  const handleContextMenu = (e: React.MouseEvent, mrId: string) => {
    e.preventDefault()
    handleRemoveMRs([mrId])
  }

  const handleToggleSelect = (mrId: string) => {
    setSelectedMRIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(mrId)) {
        newSet.delete(mrId)
      } else {
        newSet.add(mrId)
      }
      return newSet
    })
  }

  const handleRemoveSelected = () => {
    handleRemoveMRs(Array.from(selectedMRIds))
  }

  const handleGenerateTests = async () => {
    if (isGenerating || metamorphicRelations.length === 0 || !selectedSeedTest) return

    setIsGenerating(true)

    // Reset counts and generated tests
    setMetamorphicRelations((prev) => prev.map((r) => ({ ...r, generatedCount: 0 })))
    setGenerationStats({
      totalGenerated: 0,
      successRate: 100,
      mrCounts: {},
      testSuiteName: testSuiteName,
    })
    setGeneratedTests([])

    const mrCounters = metamorphicRelations.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      current: 0,
      target: MR_TEST_COUNTS[r.name] || 5,
      baseSpeed: MR_GENERATION_SPEEDS[r.name] || 100,
    }))

    let testCounter = 0

    // Create individual generators for each MR that run in parallel
    const generators = mrCounters.map((mr) => {
      return (async () => {
        for (let i = 0; i < mr.target; i++) {
          const speed = getRandomizedSpeed(mr.baseSpeed)
          await new Promise((resolve) => setTimeout(resolve, speed))

          mr.current++
          testCounter++

          const newTest: GeneratedTest = {
            id: `test-${Date.now()}-${Math.random()}`,
            name: `Test ${testCounter}`,
            image: selectedSeedTest.image || "",
            mrUsed: mr.name,
            expectedResult: selectedSeedTest.expectedResult,
          }

          setGeneratedTests((prev) => [...prev, newTest])

          // Update the specific MR count
          setMetamorphicRelations((prev) =>
            prev.map((r) => (r.id === mr.id ? { ...r, generatedCount: r.generatedCount + 1 } : r)),
          )

          // Update global stats
          setGenerationStats((prev) => ({
            totalGenerated: prev.totalGenerated + 1,
            successRate: 100,
            mrCounts: {
              ...prev.mrCounts,
              [mr.name]: (prev.mrCounts[mr.name] || 0) + 1,
            },
            testSuiteName: prev.testSuiteName,
          }))
        }
      })()
    })

    // Wait for all generators to complete
    await Promise.all(generators)

    setIsGenerating(false)
  }

  const handleStartEditName = () => {
    setEditingName(testSuiteName)
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    if (editingName.trim()) {
      setTestSuiteName(editingName.trim())
      // Update the test suite name in generation stats
      setGenerationStats((prev) => ({
        ...prev,
        testSuiteName: editingName.trim(),
      }))
    }
    setIsEditingName(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName()
    } else if (e.key === "Escape") {
      setIsEditingName(false)
    }
  }

  const handleNewTestSuite = () => {
    setTestSuiteName("Untitled Test Suite")
    setTestSuiteDescription("")
    setSelectedSeedTest(null)
    setMetamorphicRelations([])
    setGeneratedTests([])
    setGenerationStats({
      totalGenerated: 0,
      successRate: 0,
      mrCounts: {},
      testSuiteName: "Untitled Test Suite",
    })
  }

  const handleSelectTestSuite = (suite: SavedTestSuite) => {
    if (onLoadTestSuite) {
      onLoadTestSuite(suite)
      setSelectTestSuiteDialogOpen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relations</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metamorphicRelations.length}</div>
            <p className="text-xs text-muted-foreground">Metamorphic relations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generationStats.totalGenerated}</div>
            <p className="text-xs text-muted-foreground">Total test cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Suite Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              {isEditingName ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSaveName}
                  autoFocus
                  className="text-xl font-semibold h-auto py-1 max-w-md"
                />
              ) : (
                <>
                  <CardTitle className="text-xl">{testSuiteName}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleStartEditName}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleNewTestSuite} variant="outline" className="gap-2 bg-transparent">
                <FileText className="h-4 w-4" />
                New Test Suite
              </Button>
              <Button
                onClick={() => setSelectTestSuiteDialogOpen(true)}
                variant="outline"
                className="gap-2 bg-transparent"
              >
                <FolderOpen className="h-4 w-4" />
                Select Test Suite
              </Button>
              <Button
                onClick={onSaveTestSuite}
                variant="outline"
                className="gap-2 bg-transparent"
                disabled={isGenerating || !testSuiteName.trim()}
              >
                <Save className="h-4 w-4" />
                Save Test Suite
              </Button>
              <Button onClick={handleGenerateTests} className="gap-2" disabled={isGenerating || !selectedSeedTest}>
                <Play className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Tests"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suite-description">Description</Label>
            <Textarea
              id="suite-description"
              placeholder="Enter test suite description"
              value={testSuiteDescription}
              onChange={(e) => setTestSuiteDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seed Test */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seed Test</CardTitle>
              <CardDescription>Select a seed test for generation</CardDescription>
            </div>
            <Button onClick={() => setSelectSeedDialogOpen(true)} className="gap-2">
              <Sprout className="h-4 w-4" />
              Select Seed Test
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedSeedTest ? (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-4">
                {selectedSeedTest.image && (
                  <img
                    src={selectedSeedTest.image || "/placeholder.svg"}
                    alt={selectedSeedTest.name}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium text-foreground">{selectedSeedTest.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedSeedTest.description}</p>
                  <div className="text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Type:</span> {selectedSeedTest.type}
                    </div>
                    <div>
                      <span className="font-medium">Prompt:</span> {selectedSeedTest.prompt}
                    </div>
                    <div>
                      <span className="font-medium">Expected Result:</span> {selectedSeedTest.expectedResult}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No seed test selected</div>
          )}
        </CardContent>
      </Card>

      {/* Metamorphic Relations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Metamorphic Relations</CardTitle>
              <CardDescription>Manage metamorphic relations for test generation</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setAddMRDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add MR
              </Button>
              <Button
                onClick={handleRemoveSelected}
                variant={selectedMRIds.size === 0 ? "outline" : "destructive"}
                className="gap-2"
                disabled={selectedMRIds.size === 0}
              >
                <Minus className="h-4 w-4" />
                Remove MR
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {metamorphicRelations.length > 0 ? (
            <div className="space-y-4">
              {metamorphicRelations.map((relation) => (
                <div
                  key={relation.id}
                  onClick={() => handleToggleSelect(relation.id)}
                  onContextMenu={(e) => handleContextMenu(e, relation.id)}
                  className={`flex items-center justify-between rounded-lg border cursor-pointer transition-colors p-4 ${
                    selectedMRIds.has(relation.id)
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <GitBranch className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{relation.name}</h3>
                      <p className="text-sm text-muted-foreground">{relation.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{relation.generatedCount}</div>
                    <p className="text-xs text-muted-foreground">tests generated</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No metamorphic relations added yet</div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SelectTestSuiteDialog
        open={selectTestSuiteDialogOpen}
        onOpenChange={setSelectTestSuiteDialogOpen}
        onSelectTestSuite={handleSelectTestSuite}
        testSuites={savedTestSuites}
      />
      <SelectSeedTestDialog
        open={selectSeedDialogOpen}
        onOpenChange={setSelectSeedDialogOpen}
        onSelectTest={handleSelectSeedTest}
        seedTests={seedTests}
      />
      <AddMRDialog open={addMRDialogOpen} onOpenChange={setAddMRDialogOpen} onAddMRs={handleAddMRs} />
    </div>
  )
}
