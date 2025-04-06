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
    // In a real app, this would be an API call
    const fetchAssignment = async () => {
      // Mock data - matching the create assignment form data
      const mockAssignment = {
        id: assignmentId,
        title: "CSC 671 - Deep Learning Midterm Exam",
        description: "Midterm exam covering neural networks, backpropagation, CNNs, and other deep learning concepts",
        questions: [
          {
            id: "q1",
            text: "Suppose you have the following loss function: $L(x,y,z)=2x^2+3y^2-3zy$. What is the partial derivative $\\frac{\\partial L}{\\partial y}$ when $x=1$, $y=3$, $z=4$?",
            answerType: "numerical",
            expectedAnswer: "6",
            points: 1,
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q2",
            text: "Suppose we implement a logistic regression model as a binary classifier for a dataset with 4 features using a linear layer `self.linear = torch.nn.Linear(a, b)`. What are the numeric values for `a` and `b` in this case?",
            answerType: "multiple-choice",
            expectedAnswer: "B",
            points: 1,
            options: [
              { id: 1, text: "A. a=1, b=2", isCorrect: false },
              { id: 2, text: "B. a=4, b=1", isCorrect: true },
              { id: 3, text: "C. a=1, b=4", isCorrect: false },
              { id: 4, text: "D. a=4, b=2", isCorrect: false },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q3",
            text: "When we use standardization (z-score normalization), each feature in the training and test sets will have a mean of 0 and a standard deviation of 1.",
            answerType: "multiple-choice",
            expectedAnswer: "B",
            points: 1,
            options: [
              { id: 1, text: "A. True", isCorrect: false },
              { id: 2, text: "B. False", isCorrect: true },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q4",
            text: "How many parameters does a 2×2 maxpooling layer have?",
            answerType: "multiple-choice",
            expectedAnswer: "A",
            points: 1,
            options: [
              { id: 1, text: "A. 0", isCorrect: true },
              { id: 2, text: "B. 5", isCorrect: false },
              { id: 3, text: "C. 4", isCorrect: false },
              { id: 4, text: "D. It depends on the stride.", isCorrect: false },
              { id: 5, text: "E. 2", isCorrect: false },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q5",
            text: "Neural style transfer is a supervised learning task in which the goal is to input two images (C and S), and train a network to output a new, synthesized image (G).",
            answerType: "multiple-choice",
            expectedAnswer: "B",
            points: 1,
            options: [
              { id: 1, text: "A. True", isCorrect: false },
              { id: 2, text: "B. False", isCorrect: true },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q6",
            text: "The figure shows part of a computation graph for backpropagation. Given the values shown in blue (x=2.00, y=-3.00, z=4.00), and the upstream gradient shown in red (1.5), and denoting the loss function by $L$, what is the value of $\\frac{\\partial L}{\\partial x}$?",
            answerType: "numerical",
            expectedAnswer: "-18",
            points: 1,
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q7",
            text: "Transfer learning primarily involves:",
            answerType: "multiple-choice",
            expectedAnswer: "B",
            points: 1,
            options: [
              { id: 1, text: "A. Removing layers from a pretrained model.", isCorrect: false },
              { id: 2, text: "B. Using a pretrained model as a feature extractor.", isCorrect: true },
              { id: 3, text: "C. Training a new model from scratch with additional layers.", isCorrect: false },
              { id: 4, text: "D. Creating an ensemble of multiple models.", isCorrect: false },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q8",
            text: '"Top-5 accuracy" on an image classification datasets means:',
            answerType: "multiple-choice",
            expectedAnswer: "C",
            points: 1,
            options: [
              { id: 1, text: "A. That a model predicts the 5 most important data points correctly.", isCorrect: false },
              { id: 2, text: "B. The model is among the top-5 best models for that dataset.", isCorrect: false },
              {
                id: 3,
                text: "C. A prediction is considered correct if the true label of the image is among the top 5 most likely labels predicted by the model.",
                isCorrect: true,
              },
              { id: 4, text: "D. The model predicts the digit 5 correctly for the MNIST dataset.", isCorrect: false },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q9",
            text: "You are designing a convolutional neural network that takes images of size 288x288 over 3 channels and classifies them into 10 classes. You decided on 3 convolutional layers and two fully connected layers, as described in the code below. What is the input size, `fc1_input`, of the first fully connected layer?\n\n```\n# Convolutional layers\nself.conv1 = nn.Conv2d(in_channels=3, out_channels=32, kernel_size=6, stride=2, padding=2)\nself.conv2 = nn.Conv2d(in_channels=32, out_channels=64, kernel_size=4, stride=2, padding=1)\nself.conv3 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, stride=3, padding=0)\n     \n# Fully connected layers\nself.fc1 = nn.Linear(fc1_input, 1000)  # First FC layer\nself.fc2 = nn.Linear(1000, 10)  # Second FC layer (final output)\n```",
            answerType: "numerical",
            expectedAnswer: "73728",
            points: 1,
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q10",
            text: "Which of the following do you typically see in a Convolutional Neural Network (check all that apply):",
            answerType: "multiple-choice",
            expectedAnswer: "A, B",
            points: 1,
            options: [
              { id: 1, text: "A. Multiple convolutional layers followed by a pooling layer.", isCorrect: true },
              { id: 2, text: "B. Fully connected layers in the last few layers.", isCorrect: true },
              {
                id: 3,
                text: "C. The first hidden layer's neurons will perform different computations from each other even in the first iteration; their parameters will thus keep evolving in their own way.",
                isCorrect: false,
              },
              { id: 4, text: "D. Multiple pooling layers followed by a convolutional layer.", isCorrect: false },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "All correct options selected", points: 1 }],
              deductionCriteria: [{ id: "d1", text: "Partially correct selection", points: 0.5 }],
            },
          },
          {
            id: "q11",
            text: "Suppose we implemented the following multilayer perceptron architecture for a 2-dimensional dataset with 3 classes:\n\n```\nclass MLP(torch.nn.Module):\n    def __init__(self, num_features, num_classes):\n        super().__init__()\n\n        self.all_layers = torch.nn.Sequential(\n            # 1st hidden layer\n            torch.nn.Linear(num_features, 50),\n            torch.nn.ReLU(),\n            # 2nd hidden layer\n            torch.nn.Linear(50, 25),\n            torch.nn.ReLU(),\n            # output layer\n            torch.nn.Linear(25, num_classes),\n        )\n\n    def forward(self, x):\n        x = torch.flatten(x, start_dim=1)\n        logits = self.all_layers(x)\n        return logits\n```\n\nHow many parameters does this neural network approximately have?",
            answerType: "multiple-choice",
            expectedAnswer: "C",
            points: 1,
            options: [
              { id: 1, text: "A. 150", isCorrect: false },
              { id: 2, text: "B. 2300", isCorrect: false },
              { id: 3, text: "C. 1500", isCorrect: true },
              { id: 4, text: "D. 1000", isCorrect: false },
              { id: 5, text: "E. 20", isCorrect: false },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q12",
            text: "How many bias units are in a convolutional layer with kernels of size 4x4, 3 input channels and 5 output channels?\n\nIn PyTorch, you might define such a layer by:\n```\ntorch.nn.Conv2d(in_channels=3, out_channels=5, kernel_size=4)\n```",
            answerType: "multiple-choice",
            expectedAnswer: "E",
            points: 1,
            options: [
              { id: 1, text: "A. 8", isCorrect: false },
              { id: 2, text: "B. 15", isCorrect: false },
              { id: 3, text: "C. 3", isCorrect: false },
              { id: 4, text: "D. None", isCorrect: false },
              { id: 5, text: "E. 5", isCorrect: true },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q13",
            text: "When we define a dataset in PyTorch using the `Dataset` class, we implement a `__getitem__` method, which returns",
            answerType: "multiple-choice",
            expectedAnswer: "A",
            points: 1,
            options: [
              { id: 1, text: "A. a training example and label pair", isCorrect: true },
              { id: 2, text: "B. the model prediction", isCorrect: false },
              { id: 3, text: "C. a loss value for the gradient update", isCorrect: false },
              { id: 4, text: "D. the weight update value", isCorrect: false },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
          {
            id: "q14",
            text: "The image shows a computation graph. The function shown is the sigmoid, $\\sigma(z)=\\frac{1}{1+e^{-z}}$. The values of $w_1$, $x_1$ and $b$ are shown in blue (2.00, 3.00 and -6.00, respectively). The loss function is $L$. The upstream gradient coming into the sigmoid is 7.00 (shown in red). What is the value of $\\frac{\\partial L}{\\partial b}$ (the gradient going into $b$)?",
            answerType: "numerical",
            expectedAnswer: "1.75",
            points: 1,
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer", points: 1 }],
              deductionCriteria: [{ id: "d1", text: "Minor calculation error", points: 0.5 }],
            },
          },
          {
            id: "q15",
            text: "Suppose you have built a multi-layer perceptron. You decide to initialize the weights and biases to be zero. Which of the following statements is true?",
            answerType: "multiple-choice",
            expectedAnswer: "B",
            points: 1,
            options: [
              {
                id: 1,
                text: "A. The first hidden layer's neurons will perform different computations from each other even in the first iteration; their parameters will thus keep evolving in their own way.",
                isCorrect: false,
              },
              {
                id: 2,
                text: "B. Each neuron in the first hidden layer will perform the same computation. So even after multiple iterations of gradient descent each neuron in the layer will be computing the same thing as other neurons.",
                isCorrect: true,
              },
              {
                id: 3,
                text: "C. Each neuron in the first hidden layer will compute the same thing, but neurons in different layers will compute different things.",
                isCorrect: false,
              },
              {
                id: 4,
                text: "D. Each neuron in the first hidden layer will perform the same computation in the first iteration. But after one iteration of gradient descent they will learn to compute different things.",
                isCorrect: false,
              },
            ],
            rubric: {
              additionCriteria: [{ id: "a1", text: "Correct answer selected", points: 1 }],
              deductionCriteria: [],
            },
          },
        ],
      }

      // Calculate total points as the sum of all rubric addition criteria
      mockAssignment.totalPoints = mockAssignment.questions.reduce((sum, question) => {
        const additionPoints = question.rubric.additionCriteria.reduce(
          (criteriaSum, criteria) => criteriaSum + criteria.points,
          0,
        )
        return sum + additionPoints
      }, 0)

      setAssignment(mockAssignment)
    }

    fetchAssignment()
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

