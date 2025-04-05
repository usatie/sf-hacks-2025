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

- **Frontend**: Next.js with TypeScript and Tailwind CSS
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
- Python 3.13+
- MongoDB

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd sf-hacks-2025

# Set up backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Set up frontend
cd ../frontend
npm install
```

### Running the Application

```bash
# Start the backend server (in the backend directory with venv activated)
cd backend
source .venv/bin/activate  # If not already activated, on Windows: .venv\Scripts\activate
python run.py
# The backend will be available at http://localhost:5000

# In another terminal, start the frontend development server
cd frontend
npm run dev
# The frontend will be available at http://localhost:3000
```

### Configuration

#### Backend API URL

By default, the frontend connects to the backend API at `http://localhost:5000/api`. If your backend is running on a different port or host, you can configure this by creating a `.env.local` file in the frontend directory:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

The application will automatically use this URL for all API requests.

## Contributing

This project is under active development. If you'd like to contribute, please contact the project maintainers.

## Directory Structure

```
gradeassist/
├── docs/                # Documentation
│   ├── features.md      # Feature specifications
│   └── overview.md      # Project overview
├── frontend/            # Next.js frontend
│   ├── public/          # Static files
│   ├── src/             # Frontend source
│   │   ├── app/         # Next.js App Router files
│   │   │   ├── components/  # App-specific components
│   │   │   ├── create-rubric/ # Create Rubric page
│   │   │   ├── grade-submission/ # Grade Submission page
│   │   │   ├── layout.tsx  # Root layout component
│   │   │   ├── page.tsx    # Home/Dashboard page
│   │   │   └── globals.css # Global styles
│   │   ├── lib/           # Shared libraries
│   │   │   └── api.ts     # API client
│   │   └── utils/         # Utility functions
│   ├── package.json       # Frontend dependencies
│   └── tsconfig.json      # TypeScript configuration
├── backend/              # Flask backend
│   ├── app/              # Application package
│   │   ├── api/          # API routes
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── utils/        # Backend utilities
│   ├── tests/            # Backend tests
│   └── requirements.txt  # Python dependencies
└── README.md             # Project documentation
```

## License

[License details TBD]
