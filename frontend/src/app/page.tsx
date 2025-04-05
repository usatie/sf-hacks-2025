"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONFIG, API_URL } from "@/config";

export default function Dashboard() {
  const [apiStatus, setApiStatus] = useState<"Checking" | "Connected" | "Disconnected">("Checking");
  const [statusDetails, setStatusDetails] = useState<string | null>(null);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Use our internal Next.js API route as a proxy
        const response = await fetch("/api/health");
        
        if (response.ok) {
          const data = await response.json();
          setApiStatus("Connected");
          setStatusDetails(null);
        } else {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { message: "Could not parse error response" };
          }
          
          setApiStatus("Disconnected");
          setStatusDetails(errorData.message || `Error: ${response.status}`);
          console.error("API health check failed:", errorData);
        }
      } catch (error) {
        console.error("API health check failed:", error);
        setApiStatus("Disconnected");
        setStatusDetails(error instanceof Error ? error.message : "Unknown error");
      }
    };

    checkApiStatus();
    
    // Set up polling to check API status based on configured interval
    const intervalId = setInterval(checkApiStatus, CONFIG.apiHealthPollInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="dashboard">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      
      <div className="api-status mb-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center">
          <span className="text-black text-lg font-bold mr-2">API Status:</span>
          <span className={`text-lg px-3 py-1 rounded-full ${
            apiStatus === "Connected" 
              ? "bg-green-100 text-green-800 font-bold" 
              : apiStatus === "Disconnected" 
                ? "bg-red-100 text-red-800 font-bold"
                : "bg-yellow-100 text-yellow-800 font-bold"
          }`}>
            {apiStatus}
          </span>
        </div>
        {statusDetails && (
          <div className="mt-2 text-red-600 font-medium">
            {statusDetails}
          </div>
        )}
        <div className="mt-2 text-gray-600">
          Backend URL: <span className="font-mono">{API_URL}</span>
        </div>
        
        {apiStatus === "Disconnected" && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="font-bold text-yellow-800">Backend server appears to be offline</p>
            <p className="mt-2 text-yellow-700">Start the backend server with:</p>
            <pre className="mt-2 bg-gray-800 text-gray-200 p-3 rounded-md text-sm overflow-x-auto">
              cd backend<br/>
              source .venv/bin/activate<br/>
              python run.py
            </pre>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-100 hover:border-blue-300 transition-colors">
          <h3 className="text-2xl font-bold text-blue-700 mb-3">Create Rubric</h3>
          <p className="mb-4 text-lg text-gray-700">
            <strong>Generate a standardized rubric</strong> from assignment content
          </p>
          <Link 
            href="/create-rubric" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-bold text-lg shadow-sm"
          >
            Create New Rubric
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-100 hover:border-green-300 transition-colors">
          <h3 className="text-2xl font-bold text-green-700 mb-3">Grade Submissions</h3>
          <p className="mb-4 text-lg text-gray-700">
            <strong>Grade student submissions</strong> using AI-assisted evaluation
          </p>
          <Link 
            href="/grade-submission" 
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-bold text-lg shadow-sm"
          >
            Grade Submissions
          </Link>
        </div>
      </div>
    </div>
  );
}
