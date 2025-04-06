"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Info, AlignLeft, FileText, Code, Upload, CheckSquare, Calculator } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import MathRenderer from "@/components/math-renderer"
import katex from "katex"
import "katex/dist/katex.min.css"

interface QuestionEditorProps {
  questions: any[]
  onQuestionsUpdate: (questions: any[]) => void
  onGenerateRubric: () => void
  onBack: () => void
}

export default function QuestionEditor({
  questions,
  onQuestionsUpdate,
  onGenerateRubric,
  onBack,
}: QuestionEditorProps) {
  const [showMathExamples, setShowMathExamples] = useState(false)
  const [renderedQuestions, setRenderedQuestions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<Record<string, string>>({})

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
  }

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    onQuestionsUpdate(updatedQuestions)
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

  // Math examples that are properly escaped for JSX
  const inlineMathExample = "$E = mc^2$"
  const blockMathExample = "$$\\sum_{i=1}^{n} i^2$$"
  const fractionExample = "$\\frac{a}{b}$"
  const matrixExample = "$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$"

  return (
    <div className="space-y-6">
      <div className="bg-primary-foreground border rounded-md p-4 text-sm">
        <p>
          You can now specify the expected answer type for each question (numerical value, short text, long text, etc.)
          and provide model answers for grading reference. Each question can also have its own specific rubric criteria
          in addition to the general rubric.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowMathExamples(!showMathExamples)}>
          {showMathExamples ? "Hide Math Examples" : "Show Math Examples"}
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Learn how to format mathematical expressions using LaTeX syntax</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {showMathExamples && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Math Formatting Examples</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Inline Math:</p>
                <code className="block p-2 bg-muted rounded text-xs">{inlineMathExample}</code>
                <p className="mt-1 text-xs text-muted-foreground">Pythagorean theorem</p>
              </div>
              <div>
                <p className="font-medium mb-1">Rendered:</p>
                <div className="p-2 bg-muted/50 rounded">
                  <MathRenderer math="E = mc^2" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Fractions:</p>
                <code className="block p-2 bg-muted rounded text-xs">{fractionExample}</code>
                <p className="mt-1 text-xs text-muted-foreground">Simple fraction</p>
              </div>
              <div>
                <p className="font-medium mb-1">Rendered:</p>
                <div className="p-2 bg-muted/50 rounded">
                  <MathRenderer math="\frac{a}{b}" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Block Math:</p>
                <code className="block p-2 bg-muted rounded text-xs">{blockMathExample}</code>
                <p className="mt-1 text-xs text-muted-foreground">Sum of squares</p>
              </div>
              <div>
                <p className="font-medium mb-1">Rendered:</p>
                <div className="p-2 bg-muted/50 rounded">
                  <MathRenderer math="\sum_{i=1}^n i^2" display={true} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Matrices:</p>
                <code className="block p-2 bg-muted rounded text-xs">{matrixExample}</code>
                <p className="mt-1 text-xs text-muted-foreground">2x2 matrix</p>
              </div>
              <div>
                <p className="font-medium mb-1">Rendered:</p>
                <div className="p-2 bg-muted/50 rounded">
                  <MathRenderer math="\begin{pmatrix} a & b \\ c & d \end{pmatrix}" display={true} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {questions.map((question, index) => (
        <Card key={question.id} className="relative">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2">
                {getAnswerTypeIcon(question.answerType)}
                <span>Question {index + 1}</span>
                {question.points && <span className="text-sm text-muted-foreground">({question.points} pt)</span>}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeQuestion(index)}
                className="h-8 w-8 absolute top-2 right-2"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete question</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
                          .replace(
                            /```([\s\S]*?)```/g,
                            (match, code) =>
                              `<pre class="bg-muted p-2 rounded-md overflow-x-auto"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`,
                          ),
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
                    {(question.options || []).map((option: any, optionIndex: number) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm font-medium">
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <div className="flex-1">
                          <Input
                            placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            value={option.text}
                            onChange={(e) => updateOption(index, option.id, "text", e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!option.isCorrect}
                              onChange={(e) => updateOption(index, option.id, "isCorrect", e.target.checked)}
                              className="rounded text-primary"
                            />
                            Correct
                          </Label>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(index, option.id)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                  File upload questions don't require an expected answer. Students will submit files that you'll review
                  manually.
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
                            handleRubricCriteriaChange(index, "additionCriteria", criteriaIndex, "text", e.target.value)
                          }
                          className="h-10"
                          placeholder="Describe criteria for awarding points"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs font-medium" htmlFor={`criteria-points-${index}-${criteria.id}`}>
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
                  No point addition criteria added yet. Click "Add Criteria" to create criteria for awarding points.
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
                        <Label className="text-xs font-medium" htmlFor={`criteria-name-deduct-${index}-${criteria.id}`}>
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
                  No point deduction criteria added yet. Click "Add Criteria" to create criteria for deducting points.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button variant="outline" className="w-full py-6" onClick={addQuestion}>
        <Plus className="h-4 w-4 mr-2" />
        Add Question
      </Button>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onGenerateRubric}>Generate Rubric</Button>
      </div>
    </div>
  )
}

