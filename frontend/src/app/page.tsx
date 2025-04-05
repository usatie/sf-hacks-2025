import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      
      <div className="api-status mb-6 p-2 bg-gray-100 rounded inline-block">
        <span>API Status: </span>
        <span className="text-green-600 font-bold">
          Connected
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Create Rubric</h3>
          <p className="mb-4">Generate a standardized rubric from assignment content</p>
          <Link 
            href="/create-rubric" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Rubric
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-blue-600 mb-2">Grade Submissions</h3>
          <p className="mb-4">Grade student submissions using AI-assisted evaluation</p>
          <Link 
            href="/grade-submission" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Grade Submissions
          </Link>
        </div>
      </div>
    </div>
  );
}