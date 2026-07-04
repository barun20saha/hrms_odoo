import React from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'There are no active records in this list at the moment.'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-center space-y-3">
      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">
        <Inbox size={24} />
      </div>
      <div className="space-y-1">
        <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h4>
        <p className="text-xs text-gray-500 max-w-xs leading-normal">{message}</p>
      </div>
    </div>
  )
}

export default EmptyState
