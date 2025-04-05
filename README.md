# GradeAssist

An AI-powered assignment grading platform that creates standardized rubrics and provides consistent grading.

## Overview

GradeAssist helps standardize the grading process by automatically generating rubrics from assignments and applying consistent evaluation criteria. The system parses assignments into discrete questions, creates custom rubrics, and provides detailed feedback for submissions.

## Features

- Automatic rubric generation from assignment content
- Support for multiple question types (multiple choice, essay, code, etc.)
- Criteria-based scoring with specific point values
- Detailed feedback for each question
- Assignment-wide evaluation criteria
- AI-powered grading assistance

## Tech Stack

- **Frontend**: React
- **Backend**: Flask
- **Database**: MongoDB
- **AI Integration**: Claude/ChatGPT API (TBD)

## Project Status

This is an early-stage prototype focused on core functionality:
- Assignment parsing and rubric generation
- Basic grading workflow
- Simple web interface

Advanced teacher/student management features will be implemented in future phases.

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.7+
- MongoDB

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd gradeassist

# Set up backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up frontend
cd ../frontend
npm install

# Start the development servers
cd ../backend
flask run
# In another terminal
cd frontend
npm start
```

## Contributing

This project is under active development. If you'd like to contribute, please contact the project maintainers.

## License

[License details TBD]