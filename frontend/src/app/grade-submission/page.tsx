"use client";

import { useState } from 'react';

export default function GradeSubmission() {
  const [submission, setSubmission] = useState('');
  const [rubricId, setRubricId] = useState('');
  const [grading, setGrading] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock rubrics for the demo
  const mockRubrics = [
    { id: '1', title: 'Assignment 1 - Introduction to Programming' },
    { id: '2', title: 'Assignment 2 - Data Structures' },
    { id: '3', title: 'Assignment 3 - Algorithms' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      const mockGrading = {
        total_score: 85,
        criteria_scores: [
          {
            name: "Question 1",
            score: 20,
            feedback: "Good explanation but missing some details."
          },
          {
            name: "Question 2",
            score: 25,
            feedback: "Excellent problem-solving approach."
          },
          {
            name: "Question 3",
            score: 20,
            feedback: "Solution works but could be more efficient."
          },
          {
            name: "Overall",
            score: 20,
            feedback: "Well-organized submission with clear explanations."
          }
        ],
        general_feedback: "Good work overall. Your explanations are clear and your solutions work correctly. Consider focusing on efficiency and implementation details in future assignments."
      };

      setGrading(mockGrading);
    } catch (err) {
      setError('Failed to grade submission. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grade-submission">
      <h2 className="text-2xl font-bold mb-6">Grade Submission</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="rubric-select" className="block font-medium mb-2">
            Select Rubric
          </label>
          <select
            id="rubric-select"
            value={rubricId}
            onChange={(e) => setRubricId(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">-- Select a rubric --</option>
            {mockRubrics.map((rubric) => (
              <option key={rubric.id} value={rubric.id}>
                {rubric.title}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="submission-content" className="block font-medium mb-2">
            Student Submission
          </label>
          <textarea
            id="submission-content"
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder="Paste the student's submission here..."
            rows={10}
            required
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Grading...' : 'Grade Submission'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {grading && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">Grading Results</h3>
          <div className="text-lg mb-4">
            Total Score: <span className="font-bold text-blue-600">{grading.total_score}/100</span>
          </div>
          
          <h4 className="text-lg font-medium mb-2">Criteria Scores:</h4>
          <ul className="space-y-4 mb-6">
            {grading.criteria_scores.map((criterion: any, index: number) => (
              <li key={index} className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{criterion.name}</span>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                    {criterion.score}/25
                  </span>
                </div>
                <p className="text-gray-700">{criterion.feedback}</p>
              </li>
            ))}
          </ul>
          
          <div className="border-t pt-4">
            <h4 className="text-lg font-medium mb-2">General Feedback:</h4>
            <p className="text-gray-700">{grading.general_feedback}</p>
          </div>
          
          <button className="mt-6 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Save Grading
          </button>
        </div>
      )}
    </div>
  );
}