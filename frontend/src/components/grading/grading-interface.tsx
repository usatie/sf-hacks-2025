"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SubmissionUploader from "./submission-uploader"
import GradingResults from "./grading-results"
import GradingSummary from "./grading-summary"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"

interface GradingInterfaceProps {
  assignmentId: string
}

export default function GradingInterface({ assignmentId }: GradingInterfaceProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upload")
  const [assignment, setAssignment] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0)
  const [isGrading, setIsGrading] = useState(false)
  const [isAllGraded, setIsAllGraded] = useState(false)

  // Fetch assignment data
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        // Import the API URL from config
        const { API_URL } = await import('@/config');
        
        console.log(`Fetching from: ${API_URL}/assignments/${assignmentId}`);
        
        const response = await fetch(`${API_URL}/assignments/${assignmentId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors', // Enable CORS
          cache: 'no-store' // Don't cache this request
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const assignmentData = await response.json();
        console.log("API Response:", assignmentData);
        
        // Clean up the data to ensure it matches our expected format
        const fetchedAssignment = {
          ...assignmentData,
          id: assignmentId
        };

        // Calculate total points as the sum of all rubric addition criteria if not already provided
        if (!fetchedAssignment.totalPoints) {
          fetchedAssignment.totalPoints = fetchedAssignment.questions.reduce((sum, question) => {
            const additionPoints = question.rubric.additionCriteria.reduce(
              (criteriaSum, criteria) => criteriaSum + criteria.points,
              0,
            )
            return sum + additionPoints
          }, 0)
        }

        setAssignment(fetchedAssignment);
      } catch (error) {
        console.error("Failed to fetch assignment:", error);
        // Fallback to mock data if API request fails
        alert('Failed to fetch assignment data from API. Using mock data instead.');
        setAssignment({
          id: assignmentId,
          title: "Example Assignment (Mock Data)",
          description: "This is a fallback example using mock data",
          questions: [
            {
              id: "q1",
              text: "Sample question",
              answerType: "numerical",
              expectedAnswer: "42",
              points: 1,
              rubric: {
                additionCriteria: [{ id: "a1", text: "Correct answer", points: 1 }],
                deductionCriteria: [],
              },
            }
          ],
          totalPoints: 1
        });
      }
    };

    fetchAssignment();
  }, [assignmentId])

  const handleSubmissionsUpload = (uploadedSubmissions: any[]) => {
    setSubmissions(uploadedSubmissions)
    setActiveTab("grade")
  }

  const handleGradeSubmission = (submissionId: string, grades: any) => {
    // Update the grades for the current submission
    setSubmissions((prev) => prev.map((sub) => (sub.id === submissionId ? { ...sub, grades, isGraded: true } : sub)))

    // Check if all submissions are graded
    const allGraded = submissions.every((sub) => (sub.id === submissionId ? true : sub.isGraded))
    setIsAllGraded(allGraded)

    // Move to the next submission if available
    if (currentSubmissionIndex < submissions.length - 1) {
      setCurrentSubmissionIndex((prev) => prev + 1)
    } else {
      // All submissions have been graded
      setActiveTab("summary")
    }
  }

  const handleSaveGrades = () => {
    // In a real app, this would save the grades to the database
    console.log("Saving grades:", submissions)
    alert("Grades saved successfully!")
    router.push("/dashboard/assignments")
  }

  const currentSubmission = submissions[currentSubmissionIndex]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{assignment?.title || "Loading..."}</CardTitle>
          <CardDescription>{assignment?.description || ""}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Submissions</TabsTrigger>
          <TabsTrigger value="grade" disabled={submissions.length === 0}>
            Grade Submissions
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={!isAllGraded}>
            Grading Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <SubmissionUploader assignmentId={assignmentId} onSubmissionsUploaded={handleSubmissionsUpload} />
        </TabsContent>

        <TabsContent value="grade" className="mt-4">
          {currentSubmission && assignment && (
            <GradingResults
              submission={currentSubmission}
              assignment={assignment}
              onGradeSubmission={handleGradeSubmission}
              currentIndex={currentSubmissionIndex}
              totalSubmissions={submissions.length}
            />
          )}
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <GradingSummary submissions={submissions} assignment={assignment} />

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setActiveTab("grade")} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Grading
            </Button>

            <Button onClick={handleSaveGrades} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save All Grades
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

