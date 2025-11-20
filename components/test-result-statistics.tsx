"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Play,
  Loader2,
  Clock,
  Trash2,
  FolderOpen,
} from "lucide-react"
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { TestGenerationStats, TestExecutionStats, SavedTestSuite, ExecutionHistoryEntry } from "@/app/page"
import testResultsData from "@/data/test-results.json"
import { SelectTestSuiteDialog } from "@/components/dialogs/select-test-suite-dialog"
import { NotificationDialog } from "@/components/dialogs/notification-dialog"

interface TestResultStatisticsProps {
  generationStats: TestGenerationStats
  executionStats: TestExecutionStats
  setExecutionStats: (stats: TestExecutionStats) => void
  savedTestSuites: SavedTestSuite[]
  onLoadTestSuite: (suite: SavedTestSuite) => void
  currentTestSuiteId: string | null
  executionHistory: Record<string, ExecutionHistoryEntry[]>
  onExecutionComplete: (result: ExecutionHistoryEntry) => void
  onDeleteExecutionHistory: (entryIds: string[]) => void
}

export function TestResultStatistics({
  generationStats,
  executionStats,
  setExecutionStats,
  savedTestSuites,
  onLoadTestSuite,
  currentTestSuiteId,
  executionHistory,
  onExecutionComplete,
  onDeleteExecutionHistory,
}: TestResultStatisticsProps) {
  const [selectSuiteDialogOpen, setSelectSuiteDialogOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notificationTitle, setNotificationTitle] = useState("")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set())

  const testSuiteName = generationStats.testSuiteName || "Untitled Test Suite"

  const totalTests = generationStats.totalGenerated
  const passRate = executionStats.successRate
  const passedTests = executionStats.passed
  const failedTests = executionStats.failed

  const passedColor = "oklch(0.65 0.20 180)" // chart-2 green
  const failedColor = "oklch(0.55 0.25 27)" // destructive red

  const mrData = Object.entries(generationStats.mrCounts).map(([name, total]) => {
    const results = executionStats.mrResults[name] || { passed: 0, failed: 0 }
    const successRate = total > 0 ? Math.round((results.passed / total) * 100) : 0
    return {
      name,
      passed: results.passed,
      failed: results.failed,
      total,
      successRate,
    }
  })

  const currentHistory = currentTestSuiteId ? executionHistory[currentTestSuiteId] || [] : []

  const handleExecuteTests = async () => {
    if (generationStats.totalGenerated === 0) {
      setNotificationTitle("No Tests Available")
      setNotificationMessage("No tests to execute. Please generate tests first.")
      setNotificationOpen(true)
      return
    }

    const initialMrResults: Record<string, { passed: number; failed: number }> = {}
    Object.keys(generationStats.mrCounts).forEach((name) => {
      initialMrResults[name] = { passed: 0, failed: 0 }
    })

    setExecutionStats({
      totalExecuted: 0,
      passed: 0,
      failed: 0,
      successRate: 0,
      mrResults: initialMrResults,
      isExecuting: true,
    })

    const finalResults: Record<string, { passed: number; failed: number }> = {}
    let totalPassed = 0
    let totalFailed = 0

    Object.entries(generationStats.mrCounts).forEach(([name, count]) => {
      const jsonResult = testResultsData[name as keyof typeof testResultsData]
      if (jsonResult && count > 0) {
        const scale = count / jsonResult.total
        const passed = Math.round(jsonResult.passed * scale)
        const failed = count - passed
        finalResults[name] = { passed, failed }
        totalPassed += passed
        totalFailed += failed
      } else {
        const passed = Math.floor(count * 0.9)
        const failed = count - passed
        finalResults[name] = { passed, failed }
        totalPassed += passed
        totalFailed += failed
      }
    })

    const totalToExecute = generationStats.totalGenerated
    let currentPassed = 0
    let currentFailed = 0

    const executeTest = async () => {
      const currentExecuted = currentPassed + currentFailed

      if (currentExecuted >= totalToExecute) {
        const finalSuccessRate = Math.round((totalPassed / totalToExecute) * 100)
        setExecutionStats({
          totalExecuted: totalToExecute,
          passed: totalPassed,
          failed: totalFailed,
          successRate: finalSuccessRate,
          mrResults: finalResults,
          isExecuting: false,
        })

        const executionResult: ExecutionHistoryEntry = {
          id: `exec-${Date.now()}`,
          timestamp: new Date().toISOString(),
          totalTests: totalToExecute,
          passed: totalPassed,
          failed: totalFailed,
          successRate: finalSuccessRate,
          mrResults: finalResults,
        }
        onExecutionComplete(executionResult)
        return
      }

      const availableMrs = Object.entries(generationStats.mrCounts).filter(([name, count]) => {
        const executed = initialMrResults[name].passed + initialMrResults[name].failed
        return executed < count
      })

      if (availableMrs.length > 0) {
        const [mrName] = availableMrs[Math.floor(Math.random() * availableMrs.length)]
        const targetPassed = finalResults[mrName].passed
        const targetFailed = finalResults[mrName].failed
        const currentMrPassed = initialMrResults[mrName].passed
        const currentMrFailed = initialMrResults[mrName].failed

        let passed = false
        if (currentMrPassed < targetPassed && currentMrFailed < targetFailed) {
          const remainingPassed = targetPassed - currentMrPassed
          const remainingFailed = targetFailed - currentMrFailed
          passed = Math.random() < remainingPassed / (remainingPassed + remainingFailed)
        } else if (currentMrPassed < targetPassed) {
          passed = true
        } else {
          passed = false
        }

        if (passed) {
          initialMrResults[mrName].passed++
          currentPassed++
        } else {
          initialMrResults[mrName].failed++
          currentFailed++
        }

        const newExecuted = currentPassed + currentFailed

        setExecutionStats({
          totalExecuted: newExecuted,
          passed: currentPassed,
          failed: currentFailed,
          successRate: newExecuted > 0 ? Math.round((currentPassed / newExecuted) * 100) : 0,
          mrResults: { ...initialMrResults },
          isExecuting: true,
        })

        const baseSpeed = 40
        const variation = baseSpeed * 0.2
        const delay = baseSpeed + (Math.random() * variation * 2 - variation)

        setTimeout(executeTest, delay)
      }
    }

    executeTest()
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const handleHistoryClick = (entry: ExecutionHistoryEntry) => {
    if (selectedHistoryIds.has(entry.id)) {
      const newSelection = new Set(selectedHistoryIds)
      newSelection.delete(entry.id)
      setSelectedHistoryIds(newSelection)
    } else {
      // Load the execution results
      setExecutionStats({
        totalExecuted: entry.totalTests,
        passed: entry.passed,
        failed: entry.failed,
        successRate: entry.successRate,
        mrResults: entry.mrResults,
        isExecuting: false,
      })
    }
  }

  const toggleHistorySelection = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newSelection = new Set(selectedHistoryIds)
    if (newSelection.has(entryId)) {
      newSelection.delete(entryId)
    } else {
      newSelection.add(entryId)
    }
    setSelectedHistoryIds(newSelection)
  }

  const handleDeleteSelected = () => {
    if (selectedHistoryIds.size > 0) {
      onDeleteExecutionHistory(Array.from(selectedHistoryIds))
      setSelectedHistoryIds(new Set())
    }
  }

  const handleRightClickDelete = (entryId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDeleteExecutionHistory([entryId])
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{testSuiteName}</CardTitle>
              <CardDescription>Test suite execution overview</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setSelectSuiteDialogOpen(true)}>
                <FolderOpen className="h-4 w-4" />
                Select Test Suite
              </Button>
              <Button
                className="gap-2"
                onClick={handleExecuteTests}
                disabled={executionStats.isExecuting || generationStats.totalGenerated === 0}
              >
                {executionStats.isExecuting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Execute Tests
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">Generated tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{passRate}%</div>
            <p className="text-xs text-muted-foreground">Execution success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">{passedTests}</div>
            <p className="text-xs text-muted-foreground">Successful tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{failedTests}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold">Tests by Metamorphic Relation</h3>
          <p className="text-sm text-muted-foreground">Individual test results for each metamorphic relation</p>
        </div>

        {mrData.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mrData.map((mr) => (
              <Card key={mr.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{mr.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {mr.total} test{mr.total !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <ChartContainer
                    config={{
                      passed: {
                        label: "Passed",
                        color: passedColor,
                      },
                      failed: {
                        label: "Failed",
                        color: failedColor,
                      },
                    }}
                    className="h-[200px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={[mr]} margin={{ top: 20, right: 10, left: -10, bottom: 10 }} barSize={60}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" hide />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, mr.total]} />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="font-semibold text-sm">{data.name}</div>
                                  <div className="flex flex-col gap-1 text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-chart-2" />
                                      <span>Passed: {data.passed}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="h-2 w-2 rounded-full bg-destructive" />
                                      <span>Failed: {data.failed}</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="passed" stackId="a" fill={passedColor} radius={[0, 0, 0, 0]}>
                          <LabelList
                            dataKey="passed"
                            position="inside"
                            content={(props: any) => {
                              const { x, y, width, height, value } = props
                              if (value === 0) return null
                              return (
                                <text
                                  x={x + width / 2}
                                  y={y + height / 2}
                                  fill="white"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize={14}
                                  fontWeight="bold"
                                >
                                  {value}
                                </text>
                              )
                            }}
                          />
                        </Bar>
                        <Bar dataKey="failed" stackId="a" fill={failedColor} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="failed"
                            position="inside"
                            content={(props: any) => {
                              const { x, y, width, height, value } = props
                              if (value === 0) return null
                              return (
                                <text
                                  x={x + width / 2}
                                  y={y + height / 2}
                                  fill="white"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontSize={14}
                                  fontWeight="bold"
                                >
                                  {value}
                                </text>
                              )
                            }}
                          />
                          <LabelList
                            dataKey="successRate"
                            position="top"
                            formatter={(value: number) => `${value}%`}
                            style={{ fill: "hsl(var(--foreground))", fontSize: "14px", fontWeight: "600" }}
                          />
                        </Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
              No test execution data available
            </CardContent>
          </Card>
        )}
      </div>

      {currentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Execution History
                </CardTitle>
                <CardDescription>Previous test execution results for this suite</CardDescription>
              </div>
              {selectedHistoryIds.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Results ({selectedHistoryIds.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentHistory
                .slice()
                .reverse()
                .map((entry) => (
                  <div
                    key={entry.id}
                    onClick={() => handleHistoryClick(entry)}
                    onContextMenu={(e) => handleRightClickDelete(entry.id, e)}
                    className={`flex items-center justify-between rounded-lg border p-4 transition-colors cursor-pointer ${
                      selectedHistoryIds.has(entry.id)
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{formatTimestamp(entry.timestamp)}</span>
                        <span className="text-xs text-muted-foreground">
                          {entry.totalTests} test{entry.totalTests !== 1 ? "s" : ""} executed
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-2" />
                        <span className="text-sm font-medium text-chart-2">{entry.passed} passed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">{entry.failed} failed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{entry.successRate}% success</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedHistoryIds.has(entry.id)}
                        onChange={(e) => toggleHistorySelection(entry.id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <SelectTestSuiteDialog
        open={selectSuiteDialogOpen}
        onOpenChange={setSelectSuiteDialogOpen}
        onSelectTestSuite={onLoadTestSuite}
        testSuites={savedTestSuites}
      />

      <NotificationDialog
        open={notificationOpen}
        onOpenChange={setNotificationOpen}
        title={notificationTitle}
        message={notificationMessage}
        type="info"
      />
    </div>
  )
}
