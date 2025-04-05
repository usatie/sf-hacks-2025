"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path 
      ? 'bg-blue-700 text-white font-bold' 
      : 'text-blue-100 hover:bg-blue-700/50 hover:text-white';
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center py-4 px-2">
            <span className="text-2xl font-extrabold tracking-tight">
              Grade<span className="text-yellow-300">Assist</span>
            </span>
          </Link>
          
          <div className="hidden md:flex space-x-3">
            <Link 
              href="/" 
              className={`px-4 py-3 rounded-md text-lg transition-colors ${isActive('/')}`}
            >
              Dashboard
            </Link>
            <Link 
              href="/create-rubric" 
              className={`px-4 py-3 rounded-md text-lg transition-colors ${isActive('/create-rubric')}`}
            >
              Create Rubric
            </Link>
            <Link 
              href="/grade-submission" 
              className={`px-4 py-3 rounded-md text-lg transition-colors ${isActive('/grade-submission')}`}
            >
              Grade Submissions
            </Link>
          </div>
          
          {/* Mobile menu button - would typically toggle a mobile menu */}
          <div className="md:hidden flex items-center">
            <button className="mobile-menu-button p-2 rounded-md hover:bg-blue-700 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu - would typically be shown/hidden with JavaScript */}
        <div className="mobile-menu hidden md:hidden">
          <Link href="/" className={`block px-4 py-3 rounded-md ${isActive('/')}`}>
            Dashboard
          </Link>
          <Link href="/create-rubric" className={`block px-4 py-3 rounded-md ${isActive('/create-rubric')}`}>
            Create Rubric
          </Link>
          <Link href="/grade-submission" className={`block px-4 py-3 rounded-md ${isActive('/grade-submission')}`}>
            Grade Submissions
          </Link>
        </div>
      </div>
    </nav>
  );
}