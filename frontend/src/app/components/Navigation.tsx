"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <div className="flex items-center py-5 px-2 text-xl font-bold">
              GradeAssist
            </div>
            <div className="flex items-center space-x-1">
              <Link href="/" className={`px-3 py-2 rounded-md ${isActive('/')}`}>
                Dashboard
              </Link>
              <Link href="/create-rubric" className={`px-3 py-2 rounded-md ${isActive('/create-rubric')}`}>
                Create Rubric
              </Link>
              <Link href="/grade-submission" className={`px-3 py-2 rounded-md ${isActive('/grade-submission')}`}>
                Grade Submissions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}