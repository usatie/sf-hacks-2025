"use client"

import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Upload, FileText, User, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SubmissionUploaderProps {
  assignmentId: string
  onSubmissionsUploaded: (submissions: any[]) => void
}

export default function SubmissionUploader({ assignmentId, onSubmissionsUploaded }: SubmissionUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [studentName, setStudentName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [manualEntries, setManualEntries] = useState<any[]>([])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles])
    },
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeManualEntry = (index: number) => {
    setManualEntries((prev) => prev.filter((_, i) => i !== index))
  }

  const addManualEntry = () => {
    if (studentName.trim() && studentId.trim()) {
      setManualEntries((prev) => [
        ...prev,
        {
          id: `manual-${Date.now()}`,
          studentName,
          studentId,
          type: "manual",
        },
      ])
      setStudentName("")
      setStudentId("")
    }
  }

  const handleUpload = async () => {
    if (files.length === 0 && manualEntries.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 5
      })
    }, 100)

    // Simulate processing the files
    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)

      // Create mock submissions from the files
      const fileSubmissions = files.map((file, index) => ({
        id: `file-${Date.now()}-${index}`,
        fileName: file.name,
        studentName: file.name.split(".")[0].replace(/_/g, " "),
        studentId: `S${100000 + index}`,
        submissionDate: new Date().toISOString(),
        answers: generateMockAnswers(index),
        type: "file",
      }))

      // Combine with manual entries
      const allSubmissions = [
        ...fileSubmissions,
        ...manualEntries.map((entry, index) => ({
          ...entry,
          submissionDate: new Date().toISOString(),
          answers: generateMockAnswers(index + files.length),
          type: "manual",
        })),
      ]

      setTimeout(() => {
        setIsUploading(false)
        onSubmissionsUploaded(allSubmissions)
      }, 500)
    }, 2000)
  }

  // Generate mock student answers for demo purposes
  const generateMockAnswers = (studentIndex = 0) => {
    // Create slightly different answers for each student
    // This ensures variety in the grading experience
    const studentVariation = studentIndex % 3 // 0, 1, or 2

    return [
      // Q1: Numerical answer - correct but with slight typo for some students
      {
        questionId: "q1",
        answer: studentVariation === 1 ? "6.0" : "6",
        isCorrect: true,
      },

      // Q2: Multiple choice - all correct
      {
        questionId: "q2",
        answer: "B. a=4, b=1",
        isCorrect: true,
      },

      // Q3: Multiple choice - some students get it wrong
      {
        questionId: "q3",
        answer: studentVariation === 0 ? "A. True" : "B. False",
        isCorrect: studentVariation !== 0,
      },

      // Q4: Multiple choice - all correct
      {
        questionId: "q4",
        answer: "A. 0",
        isCorrect: true,
      },

      // Q5: Multiple choice - all correct
      {
        questionId: "q5",
        answer: "B. False",
        isCorrect: true,
      },

      // Q6: Numerical - all correct
      {
        questionId: "q6",
        answer: "-18",
        isCorrect: true,
      },

      // Q7: Multiple choice - all correct
      {
        questionId: "q7",
        answer: "B. Using a pretrained model as a feature extractor.",
        isCorrect: true,
      },

      // Q8: Multiple choice - all correct
      {
        questionId: "q8",
        answer:
          "C. A prediction is considered correct if the true label of the image is among the top 5 most likely labels predicted by the model.",
        isCorrect: true,
      },

      // Q9: Numerical - all correct
      {
        questionId: "q9",
        answer: "73728",
        isCorrect: true,
      },

      // Q10: Multiple choice - some students select only one correct option
      {
        questionId: "q10",
        answer: studentVariation === 2 ? "A. Multiple convolutional layers followed by a pooling layer." : "A, B",
        isCorrect: studentVariation !== 2,
      },

      // Q11: Multiple choice - some students get it wrong
      {
        questionId: "q11",
        answer: studentVariation === 1 ? "B. 2300" : "C. 1500",
        isCorrect: studentVariation !== 1,
      },

      // Q12: Multiple choice - all correct
      {
        questionId: "q12",
        answer: "E. 5",
        isCorrect: true,
      },

      // Q13: Multiple choice - all correct
      {
        questionId: "q13",
        answer: "A. a training example and label pair",
        isCorrect: true,
      },

      // Q14: Numerical - some students have minor calculation errors
      {
        questionId: "q14",
        answer: studentVariation === 0 ? "1.74" : "1.75",
        isCorrect: true,
      },

      // Q15: Multiple choice - all correct
      {
        questionId: "q15",
        answer:
          "B. Each neuron in the first hidden layer will perform the same computation. So even after multiple iterations of gradient descent each neuron in the layer will be computing the same thing as other neurons.",
        isCorrect: true,
      },
    ]
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Upload Submission Files</h3>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="rounded-full bg-muted p-3">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Drag and drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">Upload student submissions (PDF, DOCX, TXT)</p>
                </div>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Manual Entry</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Student Name</Label>
                <Input
                  id="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter student name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student ID"
                />
              </div>

              <Button onClick={addManualEntry} disabled={!studentName.trim() || !studentId.trim()} className="w-full">
                Add Student
              </Button>
            </div>

            {manualEntries.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Manual Entries ({manualEntries.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {manualEntries.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{entry.studentName}</span>
                          <span className="text-xs text-muted-foreground">{entry.studentId}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeManualEntry(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={isUploading || (files.length === 0 && manualEntries.length === 0)}
          className="min-w-[150px]"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Submissions"
          )}
        </Button>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading and processing submissions...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  )
}

