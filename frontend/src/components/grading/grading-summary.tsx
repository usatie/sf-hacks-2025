"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, FileText, Search, User } from "lucide-react"

interface GradingSummaryProps {
  submissions: any[]
  assignment: any
}

export default function GradingSummary({ submissions, assignment }: GradingSummaryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate statistics
  const totalSubmissions = submissions.length
  const totalPoints = assignment?.totalPoints || 0
  const scores = submissions.map((sub) => sub.grades?.totalScore || 0)
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0
  const lowestScore = scores.length > 0 ? Math.min(...scores) : 0

  // Calculate grade distribution
  const gradeRanges = [
    { label: "A (90-100%)", min: 90, max: 100, count: 0 },
    { label: "B (80-89%)", min: 80, max: 89, count: 0 },
    { label: "C (70-79%)", min: 70, max: 79, count: 0 },
    { label: "D (60-69%)", min: 60, max: 69, count: 0 },
    { label: "F (0-59%)", min: 0, max: 59, count: 0 },
  ]

  submissions.forEach((sub) => {
    const score = sub.grades?.totalScore || 0
    const percentage = (score / totalPoints) * 100

    for (const range of gradeRanges) {
      if (percentage >= range.min && percentage <= range.max) {
        range.count++
        break
      }
    }
  })

  const exportGrades = () => {
    // In a real app, this would generate a CSV file
    console.log("Exporting grades:", submissions)
    alert("Grades exported successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grading Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold">{totalSubmissions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold">
                    {averageScore.toFixed(1)} / {totalPoints}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({Math.round((averageScore / totalPoints) * 100)}%)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                  <p className="text-2xl font-bold">
                    {highestScore} / {totalPoints}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({Math.round((highestScore / totalPoints) * 100)}%)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lowest Score</p>
                  <p className="text-2xl font-bold">
                    {lowestScore} / {totalPoints}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({Math.round((lowestScore / totalPoints) * 100)}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeRanges.map((range) => (
                <div key={range.label} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{range.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {range.count} student{range.count !== 1 ? "s" : ""}(
                      {Math.round((range.count / totalSubmissions) * 100) || 0}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(range.count / totalSubmissions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Graded Submissions</CardTitle>
          <Button variant="outline" onClick={exportGrades} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Grades
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Submission Type</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => {
                    const score = submission.grades?.totalScore || 0
                    const percentage = (score / totalPoints) * 100
                    let grade = "F"

                    if (percentage >= 90) grade = "A"
                    else if (percentage >= 80) grade = "B"
                    else if (percentage >= 70) grade = "C"
                    else if (percentage >= 60) grade = "D"

                    return (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.studentName}</TableCell>
                        <TableCell>{submission.studentId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {submission.type === "file" ? (
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{submission.type === "file" ? "File Upload" : "Manual Entry"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {score} / {totalPoints}
                        </TableCell>
                        <TableCell>{Math.round(percentage)}%</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              grade === "A"
                                ? "default"
                                : grade === "B"
                                  ? "secondary"
                                  : grade === "C"
                                    ? "outline"
                                    : grade === "D"
                                      ? "destructive"
                                      : "destructive"
                            }
                          >
                            {grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}

                  {filteredSubmissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No submissions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

