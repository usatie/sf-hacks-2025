import type { Metadata } from "next"
import CreateAssignmentForm from "@/components/create-assignment/create-assignment-form"

export const metadata: Metadata = {
  title: "Create New Assignment | GradeAssist",
  description: "Create a new assignment and generate rubrics automatically",
}

export default function CreateAssignmentPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Assignment</h1>
      </div>
      <CreateAssignmentForm />
    </div>
  )
}

