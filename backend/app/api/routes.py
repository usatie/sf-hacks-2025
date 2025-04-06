from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
import os
import uuid

bp = Blueprint('api', __name__, url_prefix='/api')

# Mock data for assignments
assignments = [
    {
        "id": "123",
        "title": "CSC 671 - Deep Learning Midterm Exam",
        "description": "Midterm exam covering neural networks, backpropagation, CNNs, and other deep learning concepts",
        "questions": 15,
        "totalPoints": 25,
        "createdAt": "2023-10-15"
    },
    {
        "id": "456",
        "title": "MATH 301 - Calculus Quiz",
        "description": "Quiz on derivatives and integrals",
        "questions": 8,
        "totalPoints": 16,
        "createdAt": "2023-10-10"
    },
]

# Detailed assignment data
assignment_details = {
    "123": {
        "id": "123",
        "title": "CSC 671 - Deep Learning Midterm Exam",
        "description": "Midterm exam covering neural networks, backpropagation, CNNs, and other deep learning concepts",
        "totalPoints": 15,
        "questions": [
            {
                "id": "q1",
                "text": "Suppose you have the following loss function: $L(x,y,z)=2x^2+3y^2-3zy$. What is the partial derivative $\\frac{\\partial L}{\\partial y}$ when $x=1$, $y=3$, $z=4$?",
                "answerType": "numerical",
                "expectedAnswer": "6",
                "points": 1,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q2",
                "text": "Suppose we implement a logistic regression model as a binary classifier for a dataset with 4 features using a linear layer `self.linear = torch.nn.Linear(a, b)`. What are the numeric values for `a` and `b` in this case?",
                "answerType": "multiple-choice",
                "expectedAnswer": "B",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. a=1, b=2", "isCorrect": False},
                    {"id": 2, "text": "B. a=4, b=1", "isCorrect": True},
                    {"id": 3, "text": "C. a=1, b=4", "isCorrect": False},
                    {"id": 4, "text": "D. a=4, b=2", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q3",
                "text": "When we use standardization (z-score normalization), each feature in the training and test sets will have a mean of 0 and a standard deviation of 1.",
                "answerType": "multiple-choice",
                "expectedAnswer": "B",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. True", "isCorrect": False},
                    {"id": 2, "text": "B. False", "isCorrect": True},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q4",
                "text": "How many parameters does a 2×2 maxpooling layer have?",
                "answerType": "multiple-choice",
                "expectedAnswer": "A",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. 0", "isCorrect": True},
                    {"id": 2, "text": "B. 5", "isCorrect": False},
                    {"id": 3, "text": "C. 4", "isCorrect": False},
                    {"id": 4, "text": "D. It depends on the stride.", "isCorrect": False},
                    {"id": 5, "text": "E. 2", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q5",
                "text": "Neural style transfer is a supervised learning task in which the goal is to input two images (C and S), and train a network to output a new, synthesized image (G).",
                "answerType": "multiple-choice",
                "expectedAnswer": "B",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. True", "isCorrect": False},
                    {"id": 2, "text": "B. False", "isCorrect": True},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q6",
                "text": "The figure shows part of a computation graph for backpropagation. Given the values shown in blue (x=2.00, y=-3.00, z=4.00), and the upstream gradient shown in red (1.5), and denoting the loss function by $L$, what is the value of $\\frac{\\partial L}{\\partial x}$?",
                "answerType": "numerical",
                "expectedAnswer": "-18",
                "points": 1,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q7",
                "text": "Transfer learning primarily involves:",
                "answerType": "multiple-choice",
                "expectedAnswer": "B",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. Removing layers from a pretrained model.", "isCorrect": False},
                    {"id": 2, "text": "B. Using a pretrained model as a feature extractor.", "isCorrect": True},
                    {"id": 3, "text": "C. Training a new model from scratch with additional layers.", "isCorrect": False},
                    {"id": 4, "text": "D. Creating an ensemble of multiple models.", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q8",
                "text": '"Top-5 accuracy" on an image classification datasets means:',
                "answerType": "multiple-choice",
                "expectedAnswer": "C",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. That a model predicts the 5 most important data points correctly.", "isCorrect": False},
                    {"id": 2, "text": "B. The model is among the top-5 best models for that dataset.", "isCorrect": False},
                    {"id": 3, "text": "C. A prediction is considered correct if the true label of the image is among the top 5 most likely labels predicted by the model.", "isCorrect": True},
                    {"id": 4, "text": "D. The model predicts the digit 5 correctly for the MNIST dataset.", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q9",
                "text": "You are designing a convolutional neural network that takes images of size 288x288 over 3 channels and classifies them into 10 classes. You decided on 3 convolutional layers and two fully connected layers, as described in the code below. What is the input size, `fc1_input`, of the first fully connected layer?\n\n```\n# Convolutional layers\nself.conv1 = nn.Conv2d(in_channels=3, out_channels=32, kernel_size=6, stride=2, padding=2)\nself.conv2 = nn.Conv2d(in_channels=32, out_channels=64, kernel_size=4, stride=2, padding=1)\nself.conv3 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, stride=3, padding=0)\n     \n# Fully connected layers\nself.fc1 = nn.Linear(fc1_input, 1000)  # First FC layer\nself.fc2 = nn.Linear(1000, 10)  # Second FC layer (final output)\n```",
                "answerType": "numerical",
                "expectedAnswer": "73728",
                "points": 1,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q10",
                "text": "Which of the following do you typically see in a Convolutional Neural Network (check all that apply):",
                "answerType": "multiple-choice",
                "expectedAnswer": "A, B",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. Multiple convolutional layers followed by a pooling layer.", "isCorrect": True},
                    {"id": 2, "text": "B. Fully connected layers in the last few layers.", "isCorrect": True},
                    {"id": 3, "text": "C. The first hidden layer's neurons will perform different computations from each other even in the first iteration; their parameters will thus keep evolving in their own way.", "isCorrect": False},
                    {"id": 4, "text": "D. Multiple pooling layers followed by a convolutional layer.", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "All correct options selected", "points": 1}],
                    "deductionCriteria": [{"id": "d1", "text": "Partially correct selection", "points": 0.5}],
                },
            },
            {
                "id": "q11",
                "text": "Suppose we implemented the following multilayer perceptron architecture for a 2-dimensional dataset with 3 classes:\n\n```\nclass MLP(torch.nn.Module):\n    def __init__(self, num_features, num_classes):\n        super().__init__()\n\n        self.all_layers = torch.nn.Sequential(\n            # 1st hidden layer\n            torch.nn.Linear(num_features, 50),\n            torch.nn.ReLU(),\n            # 2nd hidden layer\n            torch.nn.Linear(50, 25),\n            torch.nn.ReLU(),\n            # output layer\n            torch.nn.Linear(25, num_classes),\n        )\n\n    def forward(self, x):\n        x = torch.flatten(x, start_dim=1)\n        logits = self.all_layers(x)\n        return logits\n```\n\nHow many parameters does this neural network approximately have?",
                "answerType": "multiple-choice",
                "expectedAnswer": "C",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. 150", "isCorrect": False},
                    {"id": 2, "text": "B. 2300", "isCorrect": False},
                    {"id": 3, "text": "C. 1500", "isCorrect": True},
                    {"id": 4, "text": "D. 1000", "isCorrect": False},
                    {"id": 5, "text": "E. 20", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q12",
                "text": "How many bias units are in a convolutional layer with kernels of size 4x4, 3 input channels and 5 output channels?\n\nIn PyTorch, you might define such a layer by:\n```\ntorch.nn.Conv2d(in_channels=3, out_channels=5, kernel_size=4)\n```",
                "answerType": "multiple-choice",
                "expectedAnswer": "E",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. 8", "isCorrect": False},
                    {"id": 2, "text": "B. 15", "isCorrect": False},
                    {"id": 3, "text": "C. 3", "isCorrect": False},
                    {"id": 4, "text": "D. None", "isCorrect": False},
                    {"id": 5, "text": "E. 5", "isCorrect": True},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q13",
                "text": "When we define a dataset in PyTorch using the `Dataset` class, we implement a `__getitem__` method, which returns",
                "answerType": "multiple-choice",
                "expectedAnswer": "A",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. a training example and label pair", "isCorrect": True},
                    {"id": 2, "text": "B. the model prediction", "isCorrect": False},
                    {"id": 3, "text": "C. a loss value for the gradient update", "isCorrect": False},
                    {"id": 4, "text": "D. the weight update value", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q14",
                "text": "The image shows a computation graph. The function shown is the sigmoid, $\\sigma(z)=\\frac{1}{1+e^{-z}}$. The values of $w_1$, $x_1$ and $b$ are shown in blue (2.00, 3.00 and -6.00, respectively). The loss function is $L$. The upstream gradient coming into the sigmoid is 7.00 (shown in red). What is the value of $\\frac{\\partial L}{\\partial b}$ (the gradient going into $b$)?",
                "answerType": "numerical",
                "expectedAnswer": "1.75",
                "points": 1,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 1}],
                    "deductionCriteria": [{"id": "d1", "text": "Minor calculation error", "points": 0.5}],
                },
            },
            {
                "id": "q15",
                "text": "Suppose you have built a multi-layer perceptron. You decide to initialize the weights and biases to be zero. Which of the following statements is true?",
                "answerType": "multiple-choice",
                "expectedAnswer": "B",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. The first hidden layer's neurons will perform different computations from each other even in the first iteration; their parameters will thus keep evolving in their own way.", "isCorrect": False},
                    {"id": 2, "text": "B. Each neuron in the first hidden layer will perform the same computation. So even after multiple iterations of gradient descent each neuron in the layer will be computing the same thing as other neurons.", "isCorrect": True},
                    {"id": 3, "text": "C. Each neuron in the first hidden layer will compute the same thing, but neurons in different layers will compute different things.", "isCorrect": False},
                    {"id": 4, "text": "D. Each neuron in the first hidden layer will perform the same computation in the first iteration. But after one iteration of gradient descent they will learn to compute different things.", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
        ],
    },
    "456": {
        "id": "456",
        "title": "MATH 301 - Calculus Quiz",
        "description": "Quiz on derivatives and integrals",
        "totalPoints": 16,
        "questions": [
            {
                "id": "q1",
                "text": "Find the derivative of f(x) = 3x² + 2x - 1",
                "answerType": "short-text",
                "expectedAnswer": "6x + 2",
                "points": 2,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 2}],
                    "deductionCriteria": [{"id": "d1", "text": "Minor calculation error", "points": -0.5}],
                },
            },
            {
                "id": "q2",
                "text": "Evaluate the indefinite integral ∫(4x³ + 2x) dx",
                "answerType": "short-text",
                "expectedAnswer": "x⁴ + x² + C",
                "points": 2,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 2}],
                    "deductionCriteria": [
                        {"id": "d1", "text": "Missing constant of integration", "points": -0.5},
                        {"id": "d2", "text": "Calculation error", "points": -0.5}
                    ],
                },
            },
            {
                "id": "q3",
                "text": "Find the derivative of f(x) = sin(x) * cos(x)",
                "answerType": "short-text",
                "expectedAnswer": "cos²(x) - sin²(x)",
                "points": 2,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 2}],
                    "deductionCriteria": [{"id": "d1", "text": "Incorrect application of product rule", "points": -1}],
                },
            },
            {
                "id": "q4",
                "text": "Evaluate the definite integral ∫₀²(x² + 1) dx",
                "answerType": "numerical",
                "expectedAnswer": "4.67",
                "points": 2,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 2}],
                    "deductionCriteria": [{"id": "d1", "text": "Calculation error", "points": -0.5}],
                },
            },
            {
                "id": "q5",
                "text": "Find the critical points of f(x) = x³ - 3x² + 2",
                "answerType": "short-text",
                "expectedAnswer": "x = 0, x = 2",
                "points": 2,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 2}],
                    "deductionCriteria": [{"id": "d1", "text": "Missing critical point", "points": -1}],
                },
            },
            {
                "id": "q6",
                "text": "The second derivative of f(x) = ln(x) is:",
                "answerType": "multiple-choice",
                "expectedAnswer": "C",
                "points": 2,
                "options": [
                    {"id": 1, "text": "A. 1/x", "isCorrect": False},
                    {"id": 2, "text": "B. -1/x", "isCorrect": False},
                    {"id": 3, "text": "C. -1/x²", "isCorrect": True},
                    {"id": 4, "text": "D. 1/x²", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 2}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q7",
                "text": "Apply the chain rule to find the derivative of f(x) = sin(x²)",
                "answerType": "short-text",
                "expectedAnswer": "2x * cos(x²)",
                "points": 2,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct application of chain rule", "points": 2}],
                    "deductionCriteria": [{"id": "d1", "text": "Incorrect application of chain rule", "points": -1}],
                },
            },
            {
                "id": "q8",
                "text": "Find the limit as x approaches 0 of (sin(x)/x)",
                "answerType": "multiple-choice",
                "expectedAnswer": "A",
                "points": 2,
                "options": [
                    {"id": 1, "text": "A. 1", "isCorrect": True},
                    {"id": 2, "text": "B. 0", "isCorrect": False},
                    {"id": 3, "text": "C. infinity", "isCorrect": False},
                    {"id": 4, "text": "D. -1", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 2}],
                    "deductionCriteria": [],
                },
            },
        ],
    },
}

@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@bp.route('/assignments', methods=['GET'])
def get_assignments():
    """Return a list of all assignments"""
    return jsonify({'assignments': assignments})

@bp.route('/assignments/<string:assignment_id>', methods=['GET'])
def get_assignment(assignment_id):
    """Return a specific assignment with all its questions and rubrics"""
    if assignment_id not in assignment_details:
        return jsonify({'error': 'Assignment not found'}), 404
    
    return jsonify(assignment_details[assignment_id])

@bp.route('/assignments/process-document', methods=['POST'])
def process_document():
    """Process an uploaded document to extract questions and generate rubrics"""
    # Check if a file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Check if the filename is empty
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Secure the filename to prevent directory traversal attacks
    filename = secure_filename(file.filename)
    
    # In a real implementation, we would:
    # 1. Save the file temporarily
    # 2. Process it with OCR if it's an image/PDF
    # 3. Use an AI service to extract questions and generate rubrics
    
    # For now, we'll return mock data that matches the frontend's expectations
    mock_processed_data = {
        "title": "CSC 671 - Deep Learning Midterm Exam",
        "description": "Midterm exam covering neural networks, backpropagation, CNNs, and other deep learning concepts",
        "totalPoints": 15,
        "questions": [
            {
                "id": "q1",
                "text": "Suppose you have the following loss function: $L(x,y,z)=2x^2+3y^2-3zy$. What is the partial derivative $\\frac{\\partial L}{\\partial y}$ when $x=1$, $y=3$, $z=4$?",
                "answerType": "numerical",
                "expectedAnswer": "6",
                "points": 1,
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q2",
                "text": "Suppose we implement a logistic regression model as a binary classifier for a dataset with 4 features using a linear layer `self.linear = torch.nn.Linear(a, b)`. What are the numeric values for `a` and `b` in this case?",
                "answerType": "multiple-choice",
                "expectedAnswer": "B",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. a=1, b=2", "isCorrect": False},
                    {"id": 2, "text": "B. a=4, b=1", "isCorrect": True},
                    {"id": 3, "text": "C. a=1, b=4", "isCorrect": False},
                    {"id": 4, "text": "D. a=4, b=2", "isCorrect": False},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            {
                "id": "q3",
                "text": "When we use standardization (z-score normalization), each feature in the training and test sets will have a mean of 0 and a standard deviation of 1.",
                "answerType": "multiple-choice",
                "expectedAnswer": "B",
                "points": 1,
                "options": [
                    {"id": 1, "text": "A. True", "isCorrect": False},
                    {"id": 2, "text": "B. False", "isCorrect": True},
                ],
                "rubric": {
                    "additionCriteria": [{"id": "a1", "text": "Correct answer selected", "points": 1}],
                    "deductionCriteria": [],
                },
            },
            # Including just the first few questions for brevity
        ]
    }
    
    return jsonify(mock_processed_data)

@bp.route('/submissions/<string:submission_id>/auto-grade', methods=['POST'])
def auto_grade_submission(submission_id):
    """Automatically grades a submission based on the assignment rubric"""
    # Get request data
    data = request.json
    if not data or 'assignmentId' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    assignment_id = data['assignmentId']
    
    # In a real implementation, we would:
    # 1. Retrieve the assignment details from the database
    # 2. Retrieve the submission answers from the database
    # 3. Compare the answers with the expected answers using AI/ML
    # 4. Apply the rubric criteria automatically
    
    # For demo, we'll use a fixed student variation (0, 1, or 2)
    student_variation = int(submission_id[-1]) % 3
    
    # Mock graded answers
    mock_grades = {
        "grades": [
            # Q1: Numerical answer - correct but with slight format difference for some students
            {
                "questionId": "q1",
                "score": 1,
                "maxScore": 1,
                "studentAnswer": "6.0" if student_variation == 1 else "6",
                "isCorrect": True,
                "appliedCriteria": [
                    {"id": "a1", "text": "Correct answer", "points": 1, "applied": True}
                ],
                "deductionCriteria": [],
                "feedback": "Correct answer!",
                "isAutoGraded": True,
            },
            
            # Q2: Multiple choice - all correct
            {
                "questionId": "q2",
                "score": 1,
                "maxScore": 1,
                "studentAnswer": "B. a=4, b=1",
                "isCorrect": True,
                "appliedCriteria": [
                    {"id": "a1", "text": "Correct answer selected", "points": 1, "applied": True}
                ],
                "deductionCriteria": [],
                "feedback": "Correct selection!",
                "isAutoGraded": True,
            },
            
            # Q3: Multiple choice - some students get it wrong
            {
                "questionId": "q3",
                "score": 0 if student_variation == 0 else 1,
                "maxScore": 1,
                "studentAnswer": "A. True" if student_variation == 0 else "B. False",
                "isCorrect": student_variation != 0,
                "appliedCriteria": [
                    {"id": "a1", "text": "Correct answer selected", "points": 1, "applied": student_variation != 0}
                ],
                "deductionCriteria": [],
                "feedback": "Incorrect. Remember that only the training set will have mean=0 and std=1 after standardization. The test set will have different statistics." if student_variation == 0 else "Correct! Standardization ensures the training set has mean=0 and std=1, but the test set will have different statistics.",
                "isAutoGraded": True,
            },
            
            # Only showing 3 questions for brevity
        ],
        "totalScore": 2 if student_variation == 0 else 3,
        "maxScore": 3  # Only counting first 3 questions for brevity
    }
    
    return jsonify(mock_grades)
