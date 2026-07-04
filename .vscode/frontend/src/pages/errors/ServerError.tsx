import React from 'react'
import { Link } from 'react-router-dom'

export const ServerError: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-9xl font-extrabold text-amber-500 tracking-widest">500</h1>
      <div className="bg-slate-900 text-white px-2 text-sm rounded-sm rotate-12 absolute">
        Server Error
      </div>
      <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">
        Oops, something went wrong on our end. Please try again later.
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
export default ServerError;
