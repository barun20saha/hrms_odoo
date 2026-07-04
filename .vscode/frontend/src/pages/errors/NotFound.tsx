import React from 'react'
import { Link } from 'react-router-dom'

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-9xl font-extrabold text-blue-600 tracking-widest">404</h1>
      <div className="bg-slate-900 text-white px-2 text-sm rounded-sm rotate-12 absolute">
        Page Not Found
      </div>
      <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-all"
      >
        Go Home
      </Link>
    </div>
  )
}
export default NotFound;
