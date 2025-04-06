import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, CheckSquare } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Assignments | GradeAssist",
  description: "Manage your assignments and grading",
}

export default function AssignmentsPage() {
  // Mock data for assignments
  const assignments = [
    {
      id: "123",
      title: "CSC 671 - Deep Learning Midterm Exam",
      description: "Midterm exam covering neural networks, backpropagation, CNNs, and other deep learning concepts",
      questions: 15,
      totalPoints: 25,
      createdAt: "2023-10-15",
    },
    {
      id: "456",
      title: "MATH 301 - Calculus Quiz",
      description: "Quiz on derivatives and integrals",
      questions: 8,
      totalPoints: 16,
      createdAt: "2023-10-10",
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <Button asChild>
          <Link href="/dashboard/assignments/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Assignment
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <CardTitle>{assignment.title}</CardTitle>
              <CardDescription>{assignment.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-lg font-medium">{assignment.questions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-lg font-medium">{assignment.totalPoints}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">Created on {assignment.createdAt}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/assignments/${assignment.id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/assignments/${assignment.id}/grade`}>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Grade
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

