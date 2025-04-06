I'll convert the midterm exam into a clean Markdown format with KaTeX math formatting. Here's the converted exam:

# CSC 671 - Deep Learning Midterm Exam

## Question 1 (1 point)
Suppose you have the following loss function: $L(x,y,z)=2x^2+3y^2-3zy$. What is the partial derivative $\frac{\partial L}{\partial y}$ when $x=1$, $y=3$, $z=4$?

**Answer:** 6

## Question 2 (1 point)
Suppose we implement a logistic regression model as a binary classifier for a dataset with 4 features using a linear layer `self.linear = torch.nn.Linear(a, b)`. What are the numeric values for `a` and `b` in this case?

- [ ] a=1, b=2
- [x] a=4, b=1
- [ ] a=1, b=4
- [ ] a=4, b=2

## Question 3 (1 point)
When we use standardization (z-score normalization), each feature in the training and test sets will have a mean of 0 and a standard deviation of 1.

- [ ] True
- [x] False

## Question 4 (1 point)
How many parameters does a 2×2 maxpooling layer have?

- [x] 0
- [ ] 5
- [ ] 4
- [ ] It depends on the stride.
- [ ] 2

## Question 5 (1 point)
Neural style transfer is a supervised learning task in which the goal is to input two images (C and S), and train a network to output a new, synthesized image (G).

- [ ] True
- [x] False

## Question 6 (1 point)
The figure shows part of a computation graph for backpropagation. Given the values shown in blue (x=2.00, y=-3.00, z=4.00), and the upstream gradient shown in red (1.5), and denoting the loss function by $L$, what is the value of $\frac{\partial L}{\partial x}$?

![Computation graph](image-d3fa6049-3126-41f8-8560-e900795dadf4.png)

**Answer:** -18

## Question 7 (1 point)
Transfer learning primarily involves:

- [ ] Removing layers from a pretrained model.
- [x] Using a pretrained model as a feature extractor.
- [ ] Training a new model from scratch with additional layers.
- [ ] Creating an ensemble of multiple models.

## Question 8 (1 point)
"Top-5 accuracy" on an image classification datasets means:

- [ ] That a model predicts the 5 most important data points correctly.
- [ ] The model is among the top-5 best models for that dataset.
- [x] A prediction is considered correct if the true label of the image is among the top 5 most likely labels predicted by the model.
- [ ] The model predicts the digit 5 correctly for the MNIST dataset.

## Question 9 (1 point)
You are designing a convolutional neural network that takes images of size 288x288 over 3 channels and classifies them into 10 classes. You decided on 3 convolutional layers and two fully connected layers, as described in the code below. What is the input size, `fc1_input`, of the first fully connected layer?

```python
# Convolutional layers
self.conv1 = nn.Conv2d(in_channels=3, out_channels=32, kernel_size=6, stride=2, padding=2)
self.conv2 = nn.Conv2d(in_channels=32, out_channels=64, kernel_size=4, stride=2, padding=1)
self.conv3 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, stride=3, padding=0)
     
# Fully connected layers
self.fc1 = nn.Linear(fc1_input, 1000)  # First FC layer
self.fc2 = nn.Linear(1000, 10)  # Second FC layer (final output)
```

**Answer:** 73,728

## Question 10 (1 point)
Which of the following do you typically see in a Convolutional Neural Network (check all that apply):

- [x] Multiple convolutional layers followed by a pooling layer.
- [x] Fully connected layers in the last few layers.
- [ ] The first hidden layer's neurons will perform different computations from each other even in the first iteration; their parameters will thus keep evolving in their own way.
- [ ] Multiple pooling layers followed by a convolutional layer.

## Question 11 (1 point)
Suppose we implemented the following multilayer perceptron architecture for a 2-dimensional dataset with 3 classes:

```python
class MLP(torch.nn.Module):
    def __init__(self, num_features, num_classes):
        super().__init__()

        self.all_layers = torch.nn.Sequential(
            # 1st hidden layer
            torch.nn.Linear(num_features, 50),
            torch.nn.ReLU(),
            # 2nd hidden layer
            torch.nn.Linear(50, 25),
            torch.nn.ReLU(),
            # output layer
            torch.nn.Linear(25, num_classes),
        )

    def forward(self, x):
        x = torch.flatten(x, start_dim=1)
        logits = self.all_layers(x)
        return logits
```

How many parameters does this neural network approximately have?

- [ ] 150
- [ ] 2300
- [x] 1500
- [ ] 1000
- [ ] 20

## Question 12 (1 point)
How many bias units are in a convolutional layer with kernels of size 4x4, 3 input channels and 5 output channels?

In PyTorch, you might define such a layer by:
```python
torch.nn.Conv2d(in_channels=3, out_channels=5, kernel_size=4)
```

- [ ] 8
- [ ] 15
- [ ] 3
- [ ] None
- [x] 5

## Question 13 (1 point)
When we define a dataset in PyTorch using the `Dataset` class, we implement a `__getitem__` method, which returns

- [x] a training example and label pair
- [ ] the model prediction
- [ ] a loss value for the gradient update
- [ ] the weight update value

## Question 14 (1 point)
The image shows a computation graph. The function shown is the sigmoid, $\sigma(z)=\frac{1}{1+e^{-z}}$. The values of $w_1$, $x_1$ and $b$ are shown in blue (2.00, 3.00 and -6.00, respectively). The loss function is $L$. The upstream gradient coming into the sigmoid is 7.00 (shown in red). What is the value of $\frac{\partial L}{\partial b}$ (the gradient going into $b$)?

**Answer:** 1.75

## Question 15 (1 point)
Suppose you have built a multi-layer perceptron. You decide to initialize the weights and biases to be zero. Which of the following statements is true?

- [ ] The first hidden layer's neurons will perform different computations from each other even in the first iteration; their parameters will thus keep evolving in their own way.
- [x] Each neuron in the first hidden layer will perform the same computation. So even after multiple iterations of gradient descent each neuron in the layer will be computing the same thing as other neurons.
- [ ] Each neuron in the first hidden layer will compute the same thing, but neurons in different layers will compute different things.
- [ ] Each neuron in the first hidden layer will perform the same computation in the first iteration. But after one iteration of gradient descent they will learn to compute different things.

## Question 16 (1 point)
Consider a perceptron initialized with zeros, used on 3-dimensional data. The point with the largest L₂ norm is (5, 3, 7). After absorbing the bias, each data point gets an additional dimension, set to 1, for example (1, 5, 3, 7). Given that the data is linearly separable, and the margin of the perceptron in the extended space is 2, what is the tightest (smallest) upper bound on the number of mistakes the perceptron might make until convergence?

**Answer:** 21

## Question 17 (1 point)
Suppose you initialize a neural network layer using `torch.nn.Linear(in_features=5, out_features=3)`. How many trainable parameters does this layer have?

- [ ] 5
- [ ] 15
- [x] 18
- [ ] 20
- [ ] 8

## Question 18 (1 point)
Stochastic gradient descent is a flavor of gradient descent that introduces a certain level of randomness into the training process. In order to do so, stochastic gradient descent …

- [x] updates the weights more than once for each pass over the training set
- [ ] starts with an image that is made of random pixel values
- [ ] adds a small random number to each weight update
- [ ] selects a random subset of training examples

## Question 19 (1 point)
Why do we normalize the inputs X for a neural network?

- [x] It makes the cost function faster to optimize.
- [ ] It makes it easier to visualize the data.
- [ ] It makes the parameter initialization faster.
- [ ] It avoids vanishing gradients.

## Question 20 (1 point)
We talked about "sparsity of connections" as a benefit of using convolutional layers. What does this mean?

- [x] Each activation in the next layer depends on only a small number of activations from the previous layer.
- [ ] Each filter is connected to every channel in the previous layer.
- [ ] Each layer in a convolutional network is connected only to two other layers.
- [ ] Gradient descent will set many of the parameters to zero.

## Question 21 (1 point)
The term "inductive bias" means

- [ ] The model is underfitting.
- [ ] The model is unfair.
- [x] The model is influenced by its algorithmic design decisions.
- [ ] The model produces predictions that are biased towards a certain class.

## Question 22 (1 point)
Which of the following statements is true?

- [ ] The earlier layers of a neural network are typically computing more complex features of the input than the deeper layers.
- [x] The deeper layers of a neural network are typically computing more complex features of the input than the earlier layers.

## Question 23 (1 point)
Skip connections help to address which problem in deep neural networks?

- [ ] Low generalization
- [x] Vanishing gradient
- [ ] High computational cost
- [ ] Overfitting

## Question 24 (1 point)
We talked about "parameter sharing" as a benefit of using convolutional networks. Which of the following statements about parameter sharing in ConvNets are true? (Check all that apply.)

- [ ] It allows gradient descent to set many of the parameters to zero, thus making the connections sparse.
- [x] It reduces the total number of parameters, thus reducing overfitting.
- [x] It allows a feature detector to be used in multiple locations throughout the whole input image/input volume.
- [ ] It allows parameters learned for one task to be shared even for a different task (transfer learning).

## Question 25 (1 point)
Suppose we use a 3×3 kernel on an image with 224 pixel height, a padding of 2, and a stride of 2. What is the output height?

- [ ] 112
- [ ] 111
- [ ] Cannot be calculated since the width is unknown
- [x] 113
- [ ] 224
