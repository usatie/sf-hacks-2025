"use client";

import { useState } from 'react';

export default function CreateRubric() {
  const [assignmentContent, setAssignmentContent] = useState('');
  const [rubric, setRubric] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call our internal API route
      const response = await fetch('/api/generate-rubric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: assignmentContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate rubric');
      }

      const data = await response.json();
      setRubric(data);
    } catch (err) {
      setError('Failed to generate rubric. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-rubric">
      <h2 className="text-2xl font-bold mb-6">Create Rubric</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="assignment-content" className="block font-medium mb-2">
            Assignment Content
          </label>
          <textarea
            id="assignment-content"
            value={assignmentContent}
            onChange={(e) => setAssignmentContent(e.target.value)}
            placeholder="Paste your assignment instructions here..."
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
          {isLoading ? 'Generating...' : 'Generate Rubric'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {rubric && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2">{rubric.title}</h3>
          <p className="mb-4">Total Points: {rubric.total_points}</p>
          
          <h4 className="text-lg font-medium mb-2">Criteria:</h4>
          <ul className="space-y-4">
            {rubric.criteria.map((criterion: any, index: number) => (
              <li key={index} className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{criterion.name}</span>
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                    {criterion.points} points
                  </span>
                </div>
                <p className="text-gray-700">{criterion.description}</p>
              </li>
            ))}
          </ul>
          
          <button className="mt-6 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            Save Rubric
          </button>
        </div>
      )}
    </div>
  );
}