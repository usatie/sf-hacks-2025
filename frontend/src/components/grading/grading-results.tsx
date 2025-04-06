"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Check, X, User, FileText } from "lucide-react"
import MathRenderer from "@/components/math-renderer"

interface GradingResultsProps {
  submission: any
  assignment: any
  onGradeSubmission: (submissionId: string, grades: any) => void
  currentIndex: number
  totalSubmissions: number
}

export default function GradingResults({
  submission,
  assignment,
  onGradeSubmission,
  currentIndex,
  totalSubmissions,
}: GradingResultsProps) {
  const [grades, setGrades] = useState<any[]>([])
  const [feedback, setFeedback] = useState("")
  const [totalScore, setTotalScore] = useState(0)

  // Helper function to calculate score based on applied criteria
  const calculateScoreFromCriteria = (additionCriteria: any[], deductionCriteria: any[]) => {
    // Calculate addition points
    const appliedAdditionScore = additionCriteria
      .filter((c: any) => c.applied)
      .reduce((sum: number, c: any) => sum + c.points, 0)

    // Calculate deduction points
    const appliedDeductionScore = deductionCriteria
      ? deductionCriteria.filter((c: any) => c.applied).reduce((sum: number, c: any) => sum + c.points, 0)
      : 0

    // Apply addition and subtract deduction, ensuring score doesn't go below 0
    return Math.max(appliedAdditionScore - appliedDeductionScore, 0)
  }

  // Initialize grades based on automatic grading
  useEffect(() => {
    const autoGradeSubmission = async () => {
      if (submission && assignment) {
        try {
          // Check if we should use the API or local grading
          const { API_URL } = await import('@/config');
          // Start with loading state
          const loadingGrades = assignment.questions.map((question: any) => {
            // Ensure rubric and its properties exist
            const rubric = question.rubric || { additionCriteria: [], deductionCriteria: [] };
            const additionCriteria = rubric.additionCriteria || [];
            
            return {
              questionId: question.id,
              score: 0,
              maxScore: additionCriteria.reduce((sum: number, c: any) => sum + (c.points || 0), 0),
              studentAnswer: "Grading in progress...",
              appliedCriteria: [],
              deductionCriteria: [],
              feedback: "Auto-grading in progress...",
              isAutoGraded: false,
            };
          });
          
		  console.log("Loading grades:", loadingGrades);
          setGrades(loadingGrades);
          
          // Call the auto-grading API
          const response = await fetch(`${API_URL}/submissions/${submission.id}/auto-grade`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              assignmentId: assignment.id,
              answers: submission.answers
            })
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const gradeData = await response.json();
          
          // Update grades with API response
          setGrades(gradeData.grades);
          setTotalScore(gradeData.totalScore);
        } catch (error) {
          console.error("Error during auto-grading:", error);
          
          // Fallback to local grading if API fails
          const fallbackGrades = assignment.questions.map((question: any) => {
            const studentAnswer = submission.answers.find((a: any) => a.questionId === question.id)
            const isCorrect = studentAnswer?.isCorrect || false
            
            // Ensure rubric and its properties exist
            const rubric = question.rubric || { additionCriteria: [], deductionCriteria: [] };
            const additionCriteria = rubric.additionCriteria || [];
            const deductionCriteriaBase = rubric.deductionCriteria || [];
            
            const appliedCriteria = isCorrect
              ? additionCriteria.map((c: any) => ({ ...c, applied: true }))
              : additionCriteria.map((c: any) => ({ ...c, applied: false }))
            
            const deductionCriteria = deductionCriteriaBase.map((c: any) => ({ ...c, applied: false }))
            
            const initialScore = calculateScoreFromCriteria(appliedCriteria, deductionCriteria)
            const maxPossibleScore = additionCriteria.reduce((sum: number, c: any) => sum + (c.points || 0), 0)

            return {
              questionId: question.id,
              score: initialScore,
              maxScore: maxPossibleScore,
              studentAnswer: studentAnswer?.answer || "No answer provided",
              appliedCriteria,
              deductionCriteria,
              feedback: isCorrect ? "Correct answer" : "Incorrect answer (API error, using local grading)",
              isAutoGraded: true,
            }
          });

          setGrades(fallbackGrades);
          const total = fallbackGrades.reduce((sum, grade) => sum + grade.score, 0);
          setTotalScore(total);
        }
      }
    };

    autoGradeSubmission();
  }, [submission, assignment, calculateScoreFromCriteria])

  const calculateQuestionScore = (questionIndex: number, grades: any[]) => {
    // Safety check for score calculation
    
    // Safety check
    if (!grades[questionIndex]) {
      console.error(`No grade data found for question index ${questionIndex}`);
      return 0;
    }
    
    const grade = grades[questionIndex];
    const appliedCriteria = grade.appliedCriteria || [];
    const deductionCriteria = grade.deductionCriteria || [];
    
    return calculateScoreFromCriteria(appliedCriteria, deductionCriteria);
  }

  const handleCriteriaToggle = (
    questionIndex: number,
    criteriaIndex: number,
    criteriaType: "addition" | "deduction" = "addition",
  ) => {
    setGrades((prev) => {
      const newGrades = [...prev]
      
      // Safety checks for toggle operation
      
      // Add safety checks
      if (!newGrades[questionIndex]) {
        console.error(`No grade data found for question index ${questionIndex}`);
        return prev;
      }
      
      // Get the appropriate criteria array based on type
      const criteriaArray = criteriaType === "addition"
        ? newGrades[questionIndex].appliedCriteria
        : newGrades[questionIndex].deductionCriteria
        
      // More safety checks
      if (!criteriaArray) {
        console.error(`No criteria array found for ${criteriaType} criteria`);
        return prev;
      }
      
      if (!criteriaArray[criteriaIndex]) {
        console.error(`No criteria found at index ${criteriaIndex}`);
        return prev;
      }

      const criteria = criteriaArray[criteriaIndex]

      // Toggle the criteria
      criteria.applied = !criteria.applied

      // Recalculate the score for this question using the helper function
      newGrades[questionIndex].score = calculateQuestionScore(questionIndex, newGrades)

      // Recalculate total score
      const newTotal = newGrades.reduce((sum, grade) => sum + grade.score, 0)
      setTotalScore(newTotal)

      return newGrades
    })
  }

  const handleScoreChange = (questionIndex: number, newScore: number) => {
    setGrades((prev) => {
      const newGrades = [...prev]
      
      // Safety check for missing data

      // Get max possible score from addition criteria
      // Add a safety check
      if (!newGrades[questionIndex] || !newGrades[questionIndex].appliedCriteria) {
        console.error(`No grade data or criteria found for index ${questionIndex}`);
        return prev; // Return unchanged state
      }
      
      const maxPossibleScore = newGrades[questionIndex].appliedCriteria.reduce(
        (sum: number, c: any) => sum + (c?.points || 0),
        0,
      )

      // Ensure score is within valid range
      newGrades[questionIndex].score = Math.min(Math.max(newScore, 0), maxPossibleScore)

      // Recalculate total score
      const newTotal = newGrades.reduce((sum, grade) => sum + grade.score, 0)
      setTotalScore(newTotal)

      return newGrades
    })
  }

  const handleFeedbackChange = (questionIndex: number, newFeedback: string) => {
    setGrades((prev) => {
      const newGrades = [...prev]
      newGrades[questionIndex].feedback = newFeedback
      return newGrades
    })
  }

  const handleSubmit = () => {
    onGradeSubmission(submission.id, {
      grades,
      totalScore,
      feedback,
      gradedAt: new Date().toISOString(),
    })
  }

  if (!submission || !assignment || grades.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {submission.type === "file" ? (
                <FileText className="h-5 w-5 text-muted-foreground" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <CardTitle>{submission.studentName}</CardTitle>
                <p className="text-sm text-muted-foreground">ID: {submission.studentId}</p>
              </div>
            </div>
            <Badge variant="outline">
              Submission {currentIndex + 1} of {totalSubmissions}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Submission Date</p>
              <p className="text-sm text-muted-foreground">{new Date(submission.submissionDate).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Current Score</p>
              <p className="text-xl font-bold">
                {grades.reduce((sum, grade) => sum + grade.score, 0)} / {assignment.totalPoints}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({Math.round((grades.reduce((sum, grade) => sum + grade.score, 0) / assignment.totalPoints) * 100)}%)
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {assignment.questions.map((question: any, questionIndex: number) => {
          const grade = grades[questionIndex];
          const studentAnswer = submission.answers.find((a: any) => a.questionId === question.id)

          const isCorrect = studentAnswer?.isCorrect || false

          // Calculate max possible score from addition criteria for this question
          const maxPossibleScore = grade.appliedCriteria.reduce((sum: number, c: any) => sum + c.points, 0)

          return (
            <Card key={question.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Question {questionIndex + 1}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {question.points} point{question.points !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge variant={isCorrect ? "default" : "destructive"}>
                    {isCorrect ? (
                      <>
                        <Check className="h-3 w-3 mr-1" /> Correct
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" /> Incorrect
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Question</h4>
                    <div className="text-sm border rounded-md p-3 bg-muted/20">{question.text}</div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Expected Answer</h4>
                      <div className="text-sm border rounded-md p-3 bg-muted/20">
                        {question.answerType === "multiple-choice" && question.options ? (
                          <div className="space-y-1">
                            {question.options.map((option: any, optionIndex: number) => (
                              <div key={option.id} className="flex items-start gap-2">
                                <div
                                  className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-1 ${option.isCorrect ? "bg-primary text-primary-foreground" : "bg-muted"} text-sm font-medium`}
                                >
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <span className="flex-1">{option.text}</span>
                              </div>
                            ))}
                          </div>
                        ) : question.answerType === "mathematical" && question.expectedAnswer ? (
                          <MathRenderer math={question.expectedAnswer} display={true} />
                        ) : (
                          question.expectedAnswer
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Student Answer</h4>
                      <div className="text-sm border rounded-md p-3 bg-muted/20">
                        {studentAnswer?.answer || "No answer provided"}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-3">Grading</h4>

                    <div className="space-y-6">
                      {/* Addition Criteria */}
                      {grade.appliedCriteria.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-green-600">Addition Criteria</h5>
                          {grade.appliedCriteria.map((criteria: any, criteriaIndex: number) => (
                            <div key={criteriaIndex} className="flex items-start gap-2">
                              <Checkbox
                                id={`criteria-add-${questionIndex}-${criteriaIndex}`}
                                checked={criteria.applied}
                                onCheckedChange={() => handleCriteriaToggle(questionIndex, criteriaIndex, "addition")}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label
                                  htmlFor={`criteria-add-${questionIndex}-${criteriaIndex}`}
                                  className="text-sm font-medium"
                                >
                                  {criteria.text} (+{criteria.points} point{criteria.points !== 1 ? "s" : ""})
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Deduction Criteria */}
                      {grade.deductionCriteria && grade.deductionCriteria.length > 0 && (
                        <div className="space-y-3">
                          <h5 className="text-sm font-medium text-red-600">Deduction Criteria</h5>
                          {grade.deductionCriteria.map((criteria: any, criteriaIndex: number) => (
                            <div key={criteriaIndex} className="flex items-start gap-2">
                              <Checkbox
                                id={`criteria-deduct-${questionIndex}-${criteriaIndex}`}
                                checked={criteria.applied}
                                onCheckedChange={() => handleCriteriaToggle(questionIndex, criteriaIndex, "deduction")}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label
                                  htmlFor={`criteria-deduct-${questionIndex}-${criteriaIndex}`}
                                  className="text-sm font-medium"
                                >
                                  {criteria.text} (-{criteria.points} point{criteria.points !== 1 ? "s" : ""})
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-4">
                        <Label htmlFor={`score-${questionIndex}`} className="text-sm font-medium">
                          Final Score:
                        </Label>
                        <Input
                          id={`score-${questionIndex}`}
                          type="number"
                          value={grade.score}
                          onChange={(e) => handleScoreChange(questionIndex, Number(e.target.value))}
                          min={0}
                          max={maxPossibleScore}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          out of {maxPossibleScore} point{maxPossibleScore !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label htmlFor={`feedback-${questionIndex}`} className="text-sm font-medium">
                          Feedback:
                        </Label>
                        <Textarea
                          id={`feedback-${questionIndex}`}
                          value={grade.feedback}
                          onChange={(e) => handleFeedbackChange(questionIndex, e.target.value)}
                          placeholder="Provide feedback for this question"
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4 pb-24">
        <div className="space-y-2">
          <Label htmlFor="overall-feedback" className="text-base font-medium">
            Overall Feedback
          </Label>
          <Textarea
            id="overall-feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide overall feedback for this submission"
            className="min-h-[120px]"
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center p-4 bg-background border-t z-10 shadow-sm">
          <div className="text-xl font-bold">
            Total Score: {grades.reduce((sum, grade) => sum + grade.score, 0)} / {assignment.totalPoints}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({Math.round((grades.reduce((sum, grade) => sum + grade.score, 0) / assignment.totalPoints) * 100)}%)
            </span>
          </div>

          <Button onClick={handleSubmit} size="lg">
            Save and Continue
          </Button>
        </div>
      </div>

      <div className="h-36" aria-hidden="true"></div>
    </div>
  )
}

