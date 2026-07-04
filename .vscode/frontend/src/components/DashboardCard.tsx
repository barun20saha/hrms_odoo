import React from 'react'
import { LucideIcon } from 'lucide-react'

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  variant = 'blue'
}) => {
  const variantStyles = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    slate: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors duration-300">
          {value}
        </h3>
        {description && (
          <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 ${variantStyles[variant]}`}>
        <Icon size={24} />
      </div>
    </div>
  )
}

export default DashboardCard
