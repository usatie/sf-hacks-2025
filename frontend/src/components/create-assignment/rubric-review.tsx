"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2 } from "lucide-react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface RubricReviewProps {
  questions: any[]
  onBack: () => void
  onFinish: () => void
  onEdit: () => void // Add this line
}

export default function RubricReview({ questions, onBack, onFinish, onEdit }: RubricReviewProps) {
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)
  const [renderedQuestions, setRenderedQuestions] = useState<string[]>([])

  useEffect(() => {
    // Process questions to render LaTeX
    const processedQuestions = questions.map((question) => {
      let processedText = question.text

      // Replace inline math: $...$ with KaTeX rendered HTML
      processedText = processedText.replace(/\$([^$]+)\$/g, (match, p1) => {
        try {
          return katex.renderToString(p1, { throwOnError: false })
        } catch (e) {
          console.error("KaTeX error:", e)
          return match
        }
      })

      // Replace display math: $$...$$ with KaTeX rendered HTML
      processedText = processedText.replace(/\$\$([^$]+)\$\$/g, (match, p1) => {
        try {
          return katex.renderToString(p1, { throwOnError: false, displayMode: true })
        } catch (e) {
          console.error("KaTeX error:", e)
          return match
        }
      })

      return processedText
    })

    setRenderedQuestions(processedQuestions)
  }, [questions])

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Rubric Generated Successfully</h3>
              <p className="text-sm text-muted-foreground">
                Your assignment has been processed and rubrics have been generated for each question.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Assignment Summary</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-lg font-medium">{questions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-lg font-medium">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Rubric Overview</h2>

        {questions.map((question, index) => (
          <Card key={question.id} className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Question {index + 1} ({question.points} pt)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Question Text</h4>
                  <div className="text-sm border rounded-md p-3 bg-muted/30">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          renderedQuestions[index] ||
                          question.text
                            .replace(/\n/g, "<br/>")
                            .replace(
                              /```([\s\S]*?)```/g,
                              (match, code) =>
                                `<pre class="bg-muted p-2 rounded-md overflow-x-auto"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`,
                            ),
                      }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Expected Answer</h4>
                  <div className="text-sm border rounded-md p-3 bg-muted/30">{question.expectedAnswer}</div>
                </div>

                {question.options &&
                  question.options.map((option: any, optionIndex: number) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full ${option.isCorrect ? "bg-primary text-primary-foreground" : "bg-muted"} text-sm font-medium`}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </div>
                      <span>{option.text}</span>
                    </div>
                  ))}

                <div>
                  <h4 className="text-sm font-medium mb-2">Grading Rubric</h4>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Criteria</TableHead>
                        <TableHead className="w-20 text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {question.rubric?.additionCriteria?.map((criteria: any) => (
                        <TableRow key={criteria.id}>
                          <TableCell>{criteria.text}</TableCell>
                          <TableCell className="text-right">+{criteria.points}</TableCell>
                        </TableRow>
                      ))}
                      {question.rubric?.deductionCriteria?.map((criteria: any) => (
                        <TableRow key={criteria.id}>
                          <TableCell>{criteria.text}</TableCell>
                          <TableCell className="text-right text-destructive">{criteria.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={onEdit}>
            Edit Questions
          </Button>
          <Button onClick={onFinish}>Finish</Button>
        </div>
      </div>
    </div>
  )
}

