import type { Metadata } from "next"
import GradingInterface from "@/components/grading/grading-interface"

export const metadata: Metadata = {
  title: "Grade Assignment | GradeAssist",
  description: "Grade student submissions with automatic rubric application",
}

export default function GradeAssignmentPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grade Assignment</h1>
        <p className="text-muted-foreground">Upload student submissions and apply rubrics automatically</p>
      </div>
      <GradingInterface assignmentId={params.id} />
    </div>
  )
}

