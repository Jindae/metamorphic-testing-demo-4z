"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Clock } from "lucide-react"
import { RegisterTestDialog } from "@/components/dialogs/register-test-dialog"
import { TestDetailsDialog } from "@/components/dialogs/test-details-dialog"
import { TestSuiteDetailsDialog } from "@/components/dialogs/test-suite-details-dialog"
import { SavedTestSuite } from "@/app/page"

export interface Test {
  id: string
  name: string
  description: string
  image?: string
  prompt: string
  expectedResult: string
  type: string
  registeredAt: string
}

interface TestRegistrationProps {
  tests: Test[]
  setTests: React.Dispatch<React.SetStateAction<Test[]>>
  savedTestSuites: SavedTestSuite[]
  onDeleteTestSuite?: (suiteId: string) => void
}

export function TestRegistration({ tests, setTests, savedTestSuites, onDeleteTestSuite }: TestRegistrationProps) {
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<Test | null>(null)
  const [testSuiteDetailsOpen, setTestSuiteDetailsOpen] = useState(false)
  const [selectedTestSuite, setSelectedTestSuite] = useState<SavedTestSuite | null>(null)

  const handleAddTest = (newTest: Omit<Test, "id" | "registeredAt">) => {
    const test: Test = {
      ...newTest,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
    }
    setTests((prev) => [test, ...prev])
  }

  const handleViewDetails = (test: Test) => {
    setSelectedTest(test)
    setDetailsDialogOpen(true)
  }

  const handleDeleteTest = (testId: string) => {
    setTests((prev) => prev.filter((t) => t.id !== testId))
    setDetailsDialogOpen(false)
  }

  const handleViewTestSuiteDetails = (suite: SavedTestSuite) => {
    setSelectedTestSuite(suite)
    setTestSuiteDetailsOpen(true)
  }

  const handleDeleteTestSuite = (suiteId: string) => {
    if (onDeleteTestSuite) {
      onDeleteTestSuite(suiteId)
    } else {
      const existingTestSuites = JSON.parse(localStorage.getItem("testSuites") || "[]")
      const updatedSuites = existingTestSuites.filter((s: SavedTestSuite) => s.id !== suiteId)
      localStorage.setItem("testSuites", JSON.stringify(updatedSuites))
    }
    setTestSuiteDetailsOpen(false)
  }

  const recentTestsCount = tests.filter((test) => {
    const testDate = new Date(test.registeredAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return testDate >= sevenDaysAgo
  }).length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seed Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tests.length}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentTestsCount}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Seed Tests List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seed Tests</CardTitle>
              <CardDescription>Manage and view all seed test cases</CardDescription>
            </div>
            <Button onClick={() => setRegisterDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Seed Test
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleViewDetails(test)}
              >
                <div className="flex items-center gap-4">
                  {test.image && (
                    <img
                      src={test.image || "/placeholder.svg"}
                      alt={test.name}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-foreground">{test.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {test.type} • Registered <span suppressHydrationWarning>{new Date(test.registeredAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Saved Test Suites</CardTitle>
            <CardDescription>View all saved test suite configurations</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savedTestSuites.length > 0 ? (
              savedTestSuites.map((suite) => (
                <div
                  key={suite.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleViewTestSuiteDetails(suite)}
                >
                  <div>
                    <h3 className="font-medium text-foreground">{suite.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {suite.totalTests} tests • Saved <span suppressHydrationWarning>{new Date(suite.savedAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No saved test suites yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RegisterTestDialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen} onAddTest={handleAddTest} />
      <TestDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        test={selectedTest}
        onDeleteTest={handleDeleteTest}
      />
      <TestSuiteDetailsDialog
        open={testSuiteDetailsOpen}
        onOpenChange={setTestSuiteDetailsOpen}
        testSuite={selectedTestSuite}
        onDeleteTestSuite={handleDeleteTestSuite}
      />
    </div>
  )
}
