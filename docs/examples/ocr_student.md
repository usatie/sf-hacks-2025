Certainly, here is the combined document containing all the OCR results from your Deep Learning Midterm Exam screenshots:

---

**CSC 671 - Deep Learning Midterm Exam**

---

**Question 1 (1 point)**
Suppose you have the following loss function:
\( L(x, y, z) = 2x^2 + 3y^2 - 3zy \).
What is the partial derivative \( \frac{\partial L}{\partial y} \) when \( x = 1, y = 3, z = 4 \)?
**Your Answer: 6**

---

**Question 2 (1 point)**
Suppose we implement a logistic regression model as a binary classifier for a dataset with 4 features using a linear layer
`self.linear = torch.nn.Linear(a, b)`.
What are the numeric values for a and b in this case?
- A. a=1, b=2
- B. a=4, b=1
- C. a=1, b=4
- D. a=4, b=2
**Your Answer: B**

---

**Question 3 (1 point)**
When we use standardization (z-score normalization), each feature in the training and test sets will have a mean of 0 and a standard deviation of 1.
- A. True
- B. False
**Your Answer: B**

---

**Question 4 (1 point)**
How many parameters does a 2×2 maxpooling layer have?
- A. 0
- B. 5
- C. 4
- D. It depends on the stride.
- E. 2
**Your Answer: A**

---

**Question 5 (1 point)**
Neural style transfer is a supervised learning task in which the goal is to input two images (C and S), and train a network to output a new, synthesized image (G).

- A. True
- B. False
**Your Answer: B**

---

**Question 6 (1 point)**
The figure shows part of a computation graph for backpropagation. Given the values shown in blue (x=-2.00, y=-3.00, z=4.00), and the upstream gradient shown in red (1.5), and denoting the loss function by \( L \), what is the value of \( \frac{\partial L}{\partial x} \)?
**Your Answer: -18**

---

**Question 7 (1 point)**
Transfer learning primarily involves:
- A. Removing layers from a pretrained model.
- B. Using a pretrained model as a feature extractor.
- C. Training a new model from scratch with additional layers.
- D. Creating an ensemble of multiple models.
**Your Answer: B**

---

**Question 8 (1 point)**
“Top-5 accuracy” on an image classification dataset means:
- A. That a model predicts the 5 most important data points correctly.
- B. The model is among the top-5 best models for that dataset.
- C. A prediction is considered correct if the true label of the image is among the top 5 most likely labels predicted by the model.
- D. The model predicts the digit 5 correctly for the MNIST dataset.
**Your Answer: C**

---

**Question 9 (1 point)**
You are designing a convolutional neural network that takes images of size 288×288 over 3 channels and classifies them into 10 classes. You decided on 3 convolutional layers and two fully connected layers, as described in the code below. What is the input size, fc1_input, of the first fully connected layer?

```python
# Convolutional layers
self.conv1 = nn.Conv2d(in_channels=3, out_channels=32, kernel_size=6, stride=2, padding=2)
self.conv2 = nn.Conv2d(in_channels=32, out_channels=64, kernel_size=4, stride=2, padding=1)
self.conv3 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, stride=3, padding=0)

# Fully connected layers
self.fc1 = nn.Linear(fc1_input, 1000)  # First FC layer
self.fc2 = nn.Linear(1000, 10)         # Second FC layer (final output)
```

**Your Answer: 73724**

---

**Question 10 (1 point)**
Which of the following do you typically see in a Convolutional Neural Network (check all that apply):
- A. [x] Multiple convolutional layers followed by a pooling layer.
- B. [x] Fully connected layers in the last few layers.
- C. [ ] The first hidden layer’s neurons will perform different computations from each other even in the first iteration.
- D. [ ] Multiple pooling layers followed by a convolutional layer.
**Your Answer: A, B**

---

**Question 11 (1 point)**
Suppose we implemented the following multilayer perceptron architecture for a 2-dimensional dataset with 3 classes:

```python
class MLP(torch.nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()
        self.all_layers = torch.nn.Sequential(
            torch.nn.Linear(num_features, 50),
            torch.nn.ReLU(),
            torch.nn.Linear(50, 25),
            torch.nn.ReLU(),
            torch.nn.Linear(25, num_classes),
        )

    def forward(self, x):
        x = torch.flatten(x, start_dim=1)
        logits = self.all_layers(x)
        return logits
```

How many parameters does this neural network approximately have?
- A. 150
- B. 2300
**Your Answer: C**

---

**Question 12 (1 point)**
How many bias units are in a convolutional layer with kernels of size 4x4, 3 input channels and 5 output channels?
`torch.nn.Conv2d(in_channels=3, out_channels=5, kernel_size=4)`
- A. 8
- B. 15
- C. 3
- D. None
- E. 5
**Your Answer: E**

---

**Question 13 (1 point)**
When we define a dataset in PyTorch using the `Dataset` class, we implement a `__getitem__` method, which returns
- A. a training example and label pair
- B. the model prediction
- C. a loss value for the gradient update
- D. the weight update value
**Your Answer: A**

---

**Question 14 (1 point)**
The image shows a computation graph. The function shown is the sigmoid,
\(\sigma(z) = \frac{1}{1 + e^{-z}}\).
The values of \( w_1, x_1 \), and \( b \) are shown in blue (2.00, 3.00 and -6.00, respectively).
The loss function is \( L \).
The upstream gradient coming into the sigmoid is 7.00 (shown in red).
What is the value of \( \frac{\partial L}{\partial b} \)?
**Your Answer: 15**

---

**Question 15 (1 point)**
Suppose you have built a multi-layer perceptron. You decide to initialize the weights and biases to be zero. Which of the following statements is true?
**Your Answer: B**

---

**Question 16 (1 point)**
Given a perceptron initialized with zeros, operating in extended space with margin 2 and largest L-norm of (5, 3, 7),
**Your Answer: 22**

---

**Question 17 (1 point)**
`torch.nn.Linear(in_features=5, out_features=3)`
How many trainable parameters?
- A. 5
- B. 15
- C. 18
- D. 20
- E. 8
**Your Answer: C**

---

**Question 18 (1 point)**
Stochastic gradient descent is a flavor of gradient descent that introduces randomness.
- A. updates the weights more than once for each pass over the training set
- B. starts with an image that is made of random pixel values
- C. adds a small random number to each weight update
- D. selects a random subset of training examples
**Your Answer: A**

---

**Question 19 (1 point)**
Why do we normalize the inputs X for a neural network?
- A. It makes the cost function faster to optimize.
- B. It makes it easier to visualize the data.
- C. It makes the parameter initialization faster.
- D. It avoids vanishing gradients.
**Your Answer: A**

---

**Question 20 (1 point)**
“Sparsity of connections” in ConvNets means:
- A. Each activation in the next layer depends on only a small number of activations from the previous layer.
**Your Answer: A**

---

**Question 21 (1 point)**
The term “inductive bias” means:
- C. The model is influenced by its algorithmic design decisions.
**Your Answer: A**

---

**Question 22 (1 point)**
Which of the following is true?
- B. The deeper layers of a neural network compute more complex features.
**Your Answer: B**

---

**Question 23 (1 point)**
Skip connections help to address which problem in deep neural networks?
- B. Vanishing gradient
**Your Answer: B**

---

**Question 24 (1 point)**
Which of the following about parameter sharing in ConvNets are true? (Check all that apply)
- B. It reduces the total number of parameters, thus reducing overfitting.
- C. It allows a feature detector to be used in multiple locations.
**Your Answer: B, C**

---

**Question 25 (1 point)**
Kernel: 3×3, Input Height: 224, Padding: 2, Stride: 2 → What is the output height?
- D. 113
**Your Answer: D**

---

Let me know if you'd like this formatted as a PDF or LaTeX document.
