"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  CheckCircle2,
  Pencil,
  Save,
  Plus,
  Trash2,
  AlignLeft,
  FileText,
  Code,
  Upload,
  CheckSquare,
  Calculator,
} from "lucide-react"
import MathRenderer from "@/components/math-renderer"
import katex from "katex"
import "katex/dist/katex.min.css"

interface QuestionReviewEditorProps {
  questions: any[]
  onQuestionsUpdate: (questions: any[]) => void
  onBack: () => void
  onFinish: () => void
}

export default function QuestionReviewEditor({
  questions,
  onQuestionsUpdate,
  onBack,
  onFinish,
}: QuestionReviewEditorProps) {
  const [editModeQuestions, setEditModeQuestions] = useState<Record<string, boolean>>({})
  const [renderedQuestions, setRenderedQuestions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<Record<string, string>>({})
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)

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

  const toggleEditMode = (questionId: string) => {
    setEditModeQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }))
  }

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions]
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    }
    onQuestionsUpdate(updatedQuestions)
  }

  const handleRubricCriteriaChange = (
    questionIndex: number,
    criteriaType: "additionCriteria" | "deductionCriteria",
    criteriaIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].rubric[criteriaType][criteriaIndex] = {
      ...updatedQuestions[questionIndex].rubric[criteriaType][criteriaIndex],
      [field]: value,
    }
    onQuestionsUpdate(updatedQuestions)
  }

  const addCriteria = (questionIndex: number, criteriaType: "additionCriteria" | "deductionCriteria") => {
    const updatedQuestions = [...questions]
    if (!updatedQuestions[questionIndex].rubric) {
      updatedQuestions[questionIndex].rubric = {
        additionCriteria: [],
        deductionCriteria: [],
      }
    }

    updatedQuestions[questionIndex].rubric[criteriaType].push({
      id: `${criteriaType}-${Date.now()}`,
      text: "",
      points: criteriaType === "additionCriteria" ? 1 : -1,
    })

    onQuestionsUpdate(updatedQuestions)
  }

  const removeCriteria = (
    questionIndex: number,
    criteriaType: "additionCriteria" | "deductionCriteria",
    criteriaIndex: number,
  ) => {
    const updatedQuestions = [...questions]
    updatedQuestions[questionIndex].rubric[criteriaType].splice(criteriaIndex, 1)
    onQuestionsUpdate(updatedQuestions)
  }

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]

    if (!question.options) {
      question.options = []
    }

    const newOptionId = question.options.length > 0 ? Math.max(...question.options.map((o: any) => o.id)) + 1 : 1

    question.options.push({
      id: newOptionId,
      text: "",
      isCorrect: false,
    })

    onQuestionsUpdate(updatedQuestions)
  }

  const removeOption = (questionIndex: number, optionId: number) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]

    if (question.options) {
      question.options = question.options.filter((o: any) => o.id !== optionId)
      onQuestionsUpdate(updatedQuestions)
    }
  }

  const updateOption = (questionIndex: number, optionId: number, field: string, value: any) => {
    const updatedQuestions = [...questions]
    const question = updatedQuestions[questionIndex]

    if (question.options) {
      const optionIndex = question.options.findIndex((o: any) => o.id === optionId)
      if (optionIndex !== -1) {
        question.options[optionIndex] = {
          ...question.options[optionIndex],
          [field]: value,
        }
        onQuestionsUpdate(updatedQuestions)
      }
    }
  }

  const addQuestion = () => {
    const newQuestion = {
      id: `q${questions.length + 1}`,
      text: "",
      answerType: "long-text",
      expectedAnswer: "",
      points: 1,
      rubric: {
        additionCriteria: [
          {
            id: `add-${Date.now()}`,
            text: "Complete and accurate response",
            points: 1,
          },
        ],
        deductionCriteria: [],
      },
    }

    onQuestionsUpdate([...questions, newQuestion])
    // Set the new question to edit mode
    setEditModeQuestions((prev) => ({
      ...prev,
      [newQuestion.id]: true,
    }))
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions]
    const questionId = updatedQuestions[index].id
    updatedQuestions.splice(index, 1)
    onQuestionsUpdate(updatedQuestions)

    // Remove from edit mode tracking
    setEditModeQuestions((prev) => {
      const updated = { ...prev }
      delete updated[questionId]
      return updated
    })
  }

  const getAnswerTypeIcon = (type: string) => {
    switch (type) {
      case "long-text":
        return <AlignLeft className="h-4 w-4" />
      case "short-text":
        return <FileText className="h-4 w-4" />
      case "numerical":
        return <Calculator className="h-4 w-4" />
      case "multiple-choice":
        return <CheckSquare className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      case "file-upload":
        return <Upload className="h-4 w-4" />
      case "mathematical":
        return <span className="text-sm font-mono">f(x)</span>
      default:
        return <FileText className="h-4 w-4" />
    }
  }

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
                Your assignment has been processed and rubrics have been generated for each question. Click the pencil
                icon on any question to edit it.
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Questions and Rubrics</h2>
          <Button variant="outline" onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.map((question, index) => (
          <Card key={question.id} className="mb-4 relative">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  {getAnswerTypeIcon(question.answerType)}
                  <span>Question {index + 1}</span>
                  {question.points && <span className="text-sm text-muted-foreground">({question.points} pt)</span>}
                </CardTitle>
                <div className="flex gap-1">
                  {editModeQuestions[question.id] ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleEditMode(question.id)}
                        className="h-8 w-8"
                      >
                        <Save className="h-4 w-4" />
                        <span className="sr-only">Save</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => toggleEditMode(question.id)} className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editModeQuestions[question.id] ? (
                // Edit Mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-text-${index}`}>Question Text</Label>
                    <Tabs
                      defaultValue="edit"
                      value={activeTab[question.id] || "edit"}
                      onValueChange={(value) => setActiveTab({ ...activeTab, [question.id]: value })}
                    >
                      <TabsList className="grid w-32 grid-cols-2">
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="edit" className="pt-2">
                        <Textarea
                          id={`question-text-${index}`}
                          value={question.text}
                          onChange={(e) => handleQuestionChange(index, "text", e.target.value)}
                          rows={6}
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports Markdown and LaTeX math expressions (e.g., {"$E = mc^2$"} for inline math or{" "}
                          {"$$\\sum_{i=1}^{n} i^2$$"} for block math)
                        </p>
                      </TabsContent>
                      <TabsContent value="preview" className="pt-2 border p-3 rounded-md min-h-[150px]">
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              renderedQuestions[index] ||
                              question.text
                                .replace(/\n/g, "<br/>")
                                .replace(/```([a-z]*)\n?([\s\S]*?)```/g, (match, language, code) => {
                                  const escapedCode = code
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")
                                    .replace(/\n/g, "<br/>")
                                  const langClass = language ? ` language-${language}` : ""
                                  return `<pre class="bg-muted p-3 rounded-md overflow-x-auto"><code class="text-sm font-mono${langClass}">${escapedCode}</code></pre>`
                                }),
                          }}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`answer-type-${index}`}>Answer Type</Label>
                    <Select
                      value={question.answerType}
                      onValueChange={(value) => handleQuestionChange(index, "answerType", value)}
                    >
                      <SelectTrigger id={`answer-type-${index}`}>
                        <SelectValue placeholder="Select answer type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="long-text">Long Text (Essay)</SelectItem>
                        <SelectItem value="short-text">Short Text</SelectItem>
                        <SelectItem value="numerical">Numerical Value</SelectItem>
                        <SelectItem value="mathematical">Mathematical Expression</SelectItem>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="code">Code Snippet</SelectItem>
                        <SelectItem value="file-upload">File Upload</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`expected-answer-${index}`}>Expected Answer</Label>

                    {question.answerType === "long-text" ? (
                      <Textarea
                        id={`expected-answer-${index}`}
                        rows={3}
                        value={question.expectedAnswer || ""}
                        onChange={(e) => handleQuestionChange(index, "expectedAnswer", e.target.value)}
                        placeholder="Enter the expected answer or key points that should be included"
                      />
                    ) : question.answerType === "mathematical" ? (
                      <div className="space-y-2">
                        <div className="border rounded-md">
                          <Tabs defaultValue="edit">
                            <TabsList className="w-full justify-start border-b rounded-none bg-transparent">
                              <TabsTrigger value="edit" className="data-[state=active]:bg-background">
                                Edit
                              </TabsTrigger>
                              <TabsTrigger value="preview" className="data-[state=active]:bg-background">
                                Preview
                              </TabsTrigger>
                            </TabsList>
                            <TabsContent value="edit" className="p-0 m-0">
                              <Textarea
                                id={`expected-answer-${index}`}
                                rows={2}
                                value={question.expectedAnswer || ""}
                                onChange={(e) => handleQuestionChange(index, "expectedAnswer", e.target.value)}
                                placeholder="Enter the expected mathematical expression (e.g., \frac{x^2 + y^2}{2})"
                                className="border-0 focus-visible:ring-0 rounded-t-none"
                              />
                            </TabsContent>
                            <TabsContent value="preview" className="p-4 m-0 min-h-[80px]">
                              {question.expectedAnswer ? (
                                <MathRenderer math={question.expectedAnswer} display={true} />
                              ) : (
                                <p className="text-muted-foreground text-sm">No expression provided yet</p>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use LaTeX syntax for mathematical expressions (e.g., {"\\"} frac{"{a}"}
                          {"{b}"} for fractions)
                        </p>
                      </div>
                    ) : question.answerType === "multiple-choice" ? (
                      <div className="space-y-2">
                        <div className="space-y-2">
                          {(question.options || []).map((option: any) => (
                            <div key={option.id} className="flex items-start gap-2">
                              <div
                                className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${
                                  option.isCorrect ? "bg-primary" : "border border-muted-foreground"
                                }`}
                              ></div>
                              <span className="flex-1">{option.text}</span>
                            </div>
                          ))}
                          <Button variant="outline" size="sm" onClick={() => addOption(index)} className="mt-2">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                          </Button>
                        </div>
                      </div>
                    ) : question.answerType === "code" ? (
                      <div className="space-y-2">
                        <Textarea
                          id={`expected-answer-${index}`}
                          rows={4}
                          value={question.expectedAnswer || ""}
                          onChange={(e) => handleQuestionChange(index, "expectedAnswer", e.target.value)}
                          placeholder="Enter the expected code solution or key elements that should be included"
                          className="font-mono text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`code-language-${index}`}>Language:</Label>
                          <Select defaultValue="python">
                            <SelectTrigger id={`code-language-${index}`} className="w-40">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="python">Python</SelectItem>
                              <SelectItem value="javascript">JavaScript</SelectItem>
                              <SelectItem value="java">Java</SelectItem>
                              <SelectItem value="cpp">C++</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ) : question.answerType === "file-upload" ? (
                      <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-md">
                        File upload questions don't require an expected answer. Students will submit files that you'll
                        review manually.
                      </div>
                    ) : (
                      <Input
                        id={`expected-answer-${index}`}
                        value={question.expectedAnswer || ""}
                        onChange={(e) => handleQuestionChange(index, "expectedAnswer", e.target.value)}
                        placeholder={
                          question.answerType === "numerical"
                            ? "Enter the expected numerical value"
                            : "Enter the expected short answer"
                        }
                      />
                    )}
                  </div>

                  {/* Point Addition Rubric */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Point Addition Rubric</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCriteria(index, "additionCriteria")}
                        className="h-7 px-2"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Criteria
                      </Button>
                    </div>

                    {question.rubric?.additionCriteria?.length > 0 ? (
                      <div className="space-y-3 mt-2">
                        {question.rubric.additionCriteria.map((criteria: any, criteriaIndex: number) => (
                          <div
                            key={criteria.id}
                            className="relative grid grid-cols-12 gap-2 items-center border p-3 rounded-md"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCriteria(index, "additionCriteria", criteriaIndex)}
                              className="absolute right-1 top-1 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="col-span-9 space-y-1">
                              <Label className="text-xs font-medium" htmlFor={`criteria-name-${index}-${criteria.id}`}>
                                Criteria
                              </Label>
                              <Input
                                id={`criteria-name-${index}-${criteria.id}`}
                                value={criteria.text}
                                onChange={(e) =>
                                  handleRubricCriteriaChange(
                                    index,
                                    "additionCriteria",
                                    criteriaIndex,
                                    "text",
                                    e.target.value,
                                  )
                                }
                                className="h-10"
                                placeholder="Describe criteria for awarding points"
                              />
                            </div>
                            <div className="col-span-3 space-y-1">
                              <Label
                                className="text-xs font-medium"
                                htmlFor={`criteria-points-${index}-${criteria.id}`}
                              >
                                Points
                              </Label>
                              <Input
                                id={`criteria-points-${index}-${criteria.id}`}
                                type="number"
                                value={criteria.points}
                                onChange={(e) =>
                                  handleRubricCriteriaChange(
                                    index,
                                    "additionCriteria",
                                    criteriaIndex,
                                    "points",
                                    Number.parseInt(e.target.value),
                                  )
                                }
                                className="h-10"
                                min={0}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-md text-center">
                        No point addition criteria added yet. Click "Add Criteria" to create criteria for awarding
                        points.
                      </div>
                    )}
                  </div>

                  {/* Point Deduction Rubric */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-base">Point Deduction Rubric</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addCriteria(index, "deductionCriteria")}
                        className="h-7 px-2"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Criteria
                      </Button>
                    </div>

                    {question.rubric?.deductionCriteria?.length > 0 ? (
                      <div className="space-y-3 mt-2">
                        {question.rubric.deductionCriteria.map((criteria: any, criteriaIndex: number) => (
                          <div
                            key={criteria.id}
                            className="relative grid grid-cols-12 gap-2 items-center border p-3 rounded-md"
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCriteria(index, "deductionCriteria", criteriaIndex)}
                              className="absolute right-1 top-1 h-6 w-6 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="col-span-9 space-y-1">
                              <Label
                                className="text-xs font-medium"
                                htmlFor={`criteria-name-deduct-${index}-${criteria.id}`}
                              >
                                Criteria
                              </Label>
                              <Input
                                id={`criteria-name-deduct-${index}-${criteria.id}`}
                                value={criteria.text}
                                onChange={(e) =>
                                  handleRubricCriteriaChange(
                                    index,
                                    "deductionCriteria",
                                    criteriaIndex,
                                    "text",
                                    e.target.value,
                                  )
                                }
                                className="h-10"
                                placeholder="Describe criteria for deducting points"
                              />
                            </div>
                            <div className="col-span-3 space-y-1">
                              <Label
                                className="text-xs font-medium"
                                htmlFor={`criteria-points-deduct-${index}-${criteria.id}`}
                              >
                                Points
                              </Label>
                              <Input
                                id={`criteria-points-deduct-${index}-${criteria.id}`}
                                type="number"
                                value={Math.abs(criteria.points)}
                                onChange={(e) =>
                                  handleRubricCriteriaChange(
                                    index,
                                    "deductionCriteria",
                                    criteriaIndex,
                                    "points",
                                    -Math.abs(Number.parseInt(e.target.value)),
                                  )
                                }
                                className="h-10"
                                min={0}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 border border-dashed rounded-md text-center">
                        No point deduction criteria added yet. Click "Add Criteria" to create criteria for deducting
                        points.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Review Mode
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
                              .replace(/```([a-z]*)\n?([\s\S]*?)```/g, (match, language, code) => {
                                const escapedCode = code
                                  .replace(/</g, "&lt;")
                                  .replace(/>/g, "&gt;")
                                  .replace(/\n/g, "<br/>")
                                const langClass = language ? ` language-${language}` : ""
                                return `<pre class="bg-muted p-3 rounded-md overflow-x-auto"><code class="text-sm font-mono${langClass}">${escapedCode}</code></pre>`
                              }),
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Expected Answer</h4>
                    <div className="text-sm border rounded-md p-3 bg-muted/30">
                      {question.answerType === "multiple-choice" && question.options ? (
                        <div className="space-y-1">
                          {question.options.map((option: any) => (
                            <div key={option.id} className="flex items-start gap-2">
                              <div
                                className={`w-4 h-4 rounded-full flex-shrink-0 mt-1 ${option.isCorrect ? "bg-primary" : "border border-muted-foreground"}`}
                              ></div>
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
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onFinish}>Finish</Button>
      </div>
    </div>
  )
}

