"use client"

import { useState, useEffect } from "react"
import { TestRegistration, type Test } from "@/components/test-registration"
import { MetamorphicTestGeneration, type MetamorphicRelation } from "@/components/metamorphic-test-generation"
import { TestResultStatistics } from "@/components/test-result-statistics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FlaskConical, GitBranch, BarChart3 } from "lucide-react"
import { NotificationDialog } from "@/components/dialogs/notification-dialog"
import defaultSeedTests from "@/data/seed-tests.json"
import defaultTestSuites from "@/data/test-suites.json"

export interface TestGenerationStats {
  totalGenerated: number
  successRate: number
  mrCounts: Record<string, number>
  testSuiteName?: string
}

export interface TestExecutionStats {
  totalExecuted: number
  passed: number
  failed: number
  successRate: number
  mrResults: Record<string, { passed: number; failed: number }>
  isExecuting: boolean
}

export interface GeneratedTest {
  id: string
  name: string
  image: string
  mrUsed: string
  expectedResult: string
}

export interface SavedTestSuite {
  id: string
  name: string
  description: string
  selectedSeedTest: Test | null
  metamorphicRelations: MetamorphicRelation[]
  generatedTests: GeneratedTest[]
  totalTests: number
  savedAt: string
}

export interface ExecutionHistoryEntry {
  id: string
  timestamp: string
  totalTests: number
  passed: number
  failed: number
  successRate: number
  mrResults: Record<string, { passed: number; failed: number }>
}

export default function TestMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("registration")
  const [seedTests, setSeedTests] = useState<Test[]>([])
  const [generationStats, setGenerationStats] = useState<TestGenerationStats>({
    totalGenerated: 0,
    successRate: 0,
    mrCounts: {},
    testSuiteName: "Untitled Test Suite",
  })

  const [testSuiteName, setTestSuiteName] = useState("Untitled Test Suite")
  const [testSuiteDescription, setTestSuiteDescription] = useState("")
  const [selectedSeedTest, setSelectedSeedTest] = useState<Test | null>(null)
  const [metamorphicRelations, setMetamorphicRelations] = useState<MetamorphicRelation[]>([])
  const [generatedTests, setGeneratedTests] = useState<GeneratedTest[]>([])

  const [executionStats, setExecutionStats] = useState<TestExecutionStats>({
    totalExecuted: 0,
    passed: 0,
    failed: 0,
    successRate: 0,
    mrResults: {},
    isExecuting: false,
  })

  const [savedTestSuites, setSavedTestSuites] = useState<SavedTestSuite[]>([])
  const [executionHistory, setExecutionHistory] = useState<Record<string, ExecutionHistoryEntry[]>>({})
  const [currentTestSuiteId, setCurrentTestSuiteId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      // Load seed tests
      const storedSeedTests = localStorage.getItem("seedTests")
      if (storedSeedTests) {
        setSeedTests(JSON.parse(storedSeedTests))
      } else {
        setSeedTests(defaultSeedTests)
      }

      // Load test suites
      const storedTestSuites = localStorage.getItem("savedTestSuites")
      if (storedTestSuites) {
        setSavedTestSuites(JSON.parse(storedTestSuites))
      } else {
        setSavedTestSuites(defaultTestSuites)
      }

      // Load execution history
      const storedHistory = localStorage.getItem("executionHistory")
      if (storedHistory) {
        setExecutionHistory(JSON.parse(storedHistory))
      }

      setIsLoaded(true)
    } catch (error) {
      console.error("Failed to load data from localStorage:", error)
      setSeedTests(defaultSeedTests)
      setSavedTestSuites(defaultTestSuites)
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("seedTests", JSON.stringify(seedTests))
    } catch (error) {
      console.error("Failed to save seed tests to localStorage:", error)
    }
  }, [seedTests, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("savedTestSuites", JSON.stringify(savedTestSuites))
    } catch (error) {
      console.error("Failed to save test suites to localStorage:", error)
    }
  }, [savedTestSuites, isLoaded])

  useEffect(() => {
    if (!isLoaded) return
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("executionHistory", JSON.stringify(executionHistory))
    } catch (error) {
      console.error("Failed to save execution history to localStorage:", error)
    }
  }, [executionHistory, isLoaded])

  const handleSaveTestSuite = () => {
    const suiteId = currentTestSuiteId || Date.now().toString()

    const newSuite: SavedTestSuite = {
      id: suiteId,
      name: testSuiteName,
      description: testSuiteDescription,
      selectedSeedTest,
      metamorphicRelations: metamorphicRelations.map((mr) => ({ ...mr })),
      generatedTests: generatedTests.map((test) => ({ ...test })),
      totalTests: generationStats.totalGenerated,
      savedAt: new Date().toISOString(),
    }

    setSavedTestSuites((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === suiteId)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = newSuite
        return updated
      }
      return [...prev, newSuite]
    })

    setCurrentTestSuiteId(suiteId)
    setNotificationTitle("Success")
    setNotificationMessage(`Test suite "${testSuiteName}" saved successfully!`)
    setNotificationType("success")
    setNotificationOpen(true)
  }

  const handleLoadTestSuite = (suite: SavedTestSuite) => {
    setTestSuiteName(suite.name)
    setTestSuiteDescription(suite.description)
    setSelectedSeedTest(suite.selectedSeedTest)
    setMetamorphicRelations(suite.metamorphicRelations.map((mr) => ({ ...mr })))
    setGeneratedTests(suite.generatedTests.map((test) => ({ ...test })))

    setCurrentTestSuiteId(suite.id)

    const mrCounts: Record<string, number> = {}
    suite.metamorphicRelations.forEach((mr) => {
      mrCounts[mr.name] = mr.generatedCount
    })

    setGenerationStats({
      totalGenerated: suite.totalTests,
      successRate: 100,
      mrCounts,
      testSuiteName: suite.name,
    })

    setExecutionStats({
      totalExecuted: 0,
      passed: 0,
      failed: 0,
      successRate: 0,
      mrResults: {},
      isExecuting: false,
    })

    setNotificationTitle("Success")
    setNotificationMessage(`Test suite "${suite.name}" loaded successfully!`)
    setNotificationType("success")
    setNotificationOpen(true)
  }

  const handleExecutionComplete = (executionResult: ExecutionHistoryEntry) => {
    const suiteId = currentTestSuiteId || `temp-${Date.now()}`
    if (!currentTestSuiteId) {
      setCurrentTestSuiteId(suiteId)
    }

    setExecutionHistory((prev) => {
      const suiteHistory = prev[suiteId] || []
      return {
        ...prev,
        [suiteId]: [...suiteHistory, executionResult],
      }
    })
  }

  const handleDeleteExecutionHistory = (entryIds: string[]) => {
    if (!currentTestSuiteId) return

    setExecutionHistory((prev) => {
      const suiteHistory = prev[currentTestSuiteId] || []
      const updatedHistory = suiteHistory.filter((entry) => !entryIds.includes(entry.id))
      return {
        ...prev,
        [currentTestSuiteId]: updatedHistory,
      }
    })
  }

  const handleDeleteTestSuite = (suiteId: string) => {
    setExecutionHistory((prev) => {
      const updated = { ...prev }
      delete updated[suiteId]
      return updated
    })

    setSavedTestSuites((prev) => {
      const updated = prev.filter((s) => s.id !== suiteId)
      return updated
    })
  }

  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState<"success" | "error" | "info">("success")

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <FlaskConical className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Metamorphic Testing Dashboard</h1>
                <p className="text-sm text-muted-foreground">A Metamorphic Testing Framework for Physical AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-muted px-3 py-1.5">
                <span className="text-sm font-medium text-foreground">Demo</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
            <TabsTrigger value="registration" className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Test Info</span>
              <span className="sm:hidden">Info</span>
            </TabsTrigger>
            <TabsTrigger value="generation" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden sm:inline">Test Generation</span>
              <span className="sm:hidden">Generation</span>
            </TabsTrigger>
            <TabsTrigger value="execution" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Test Execution</span>
              <span className="sm:hidden">Execution</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registration" className="mt-6">
            <TestRegistration
              tests={seedTests}
              setTests={setSeedTests}
              savedTestSuites={savedTestSuites}
              onDeleteTestSuite={handleDeleteTestSuite}
            />
          </TabsContent>

          <TabsContent value="generation" className="mt-6">
            <MetamorphicTestGeneration
              seedTests={seedTests}
              generationStats={generationStats}
              setGenerationStats={setGenerationStats}
              testSuiteName={testSuiteName}
              setTestSuiteName={setTestSuiteName}
              testSuiteDescription={testSuiteDescription}
              setTestSuiteDescription={setTestSuiteDescription}
              selectedSeedTest={selectedSeedTest}
              setSelectedSeedTest={setSelectedSeedTest}
              metamorphicRelations={metamorphicRelations}
              setMetamorphicRelations={setMetamorphicRelations}
              generatedTests={generatedTests}
              setGeneratedTests={setGeneratedTests}
              onSaveTestSuite={handleSaveTestSuite}
              savedTestSuites={savedTestSuites}
              onLoadTestSuite={handleLoadTestSuite}
            />
          </TabsContent>

          <TabsContent value="execution" className="mt-6">
            <TestResultStatistics
              generationStats={generationStats}
              executionStats={executionStats}
              setExecutionStats={setExecutionStats}
              savedTestSuites={savedTestSuites}
              onLoadTestSuite={handleLoadTestSuite}
              currentTestSuiteId={currentTestSuiteId}
              executionHistory={executionHistory}
              onExecutionComplete={handleExecutionComplete}
              onDeleteExecutionHistory={handleDeleteExecutionHistory}
            />
          </TabsContent>
        </Tabs>
      </main>

      <NotificationDialog
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
        title={notificationTitle}
        message={notificationMessage}
        type={notificationType}
      />
    </div>
  )
}
