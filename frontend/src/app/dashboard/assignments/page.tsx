import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, CheckSquare } from "lucide-react"
import type { Metadata } from "next"
import { API_URL } from "@/config"

export const metadata: Metadata = {
  title: "Assignments | GradeAssist",
  description: "Manage your assignments and grading",
}

async function getAssignments() {
  try {
    const response = await fetch(`${API_URL}/assignments`, {
      cache: 'no-store' // Don't cache this request
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.assignments;
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    // Return empty array in case of error
    return [];
  }
}

export default async function AssignmentsPage() {
  // Fetch assignments from the API
  const assignments = await getAssignments();

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

