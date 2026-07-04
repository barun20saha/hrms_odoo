import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoaderProps {
  fullPage?: boolean;
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({ fullPage = false, size = 32 }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <Loader2 size={size} className="animate-spin text-blue-600" />
      <span className="text-xs text-gray-500 font-medium">Loading details...</span>
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-xs flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return <div className="py-12 flex items-center justify-center">{content}</div>
}

export default Loader
