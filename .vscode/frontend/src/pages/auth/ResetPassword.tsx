import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { toast } from 'react-hot-toast'
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, KeyRound } from 'lucide-react'
import { api } from '../../services/api'

// Define Schema: Ensure passwords match
const resetSchema = zod.object({
  token: zod.string().min(1, 'Reset token is required'),
  newPassword: zod.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: zod.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type ResetFormInputs = zod.infer<typeof resetSchema>

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormInputs>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetFormInputs) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
      })

      if (response.data.success) {
        toast.success('Password updated successfully! Please login.')
        navigate('/login')
      } else {
        toast.error(response.data.message || 'Reset failed')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Invalid or expired reset token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Submit your reset token and enter your new password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Token Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Recovery Token</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <KeyRound size={18} />
            </span>
            <input
              type="text"
              {...register('token')}
              placeholder="Enter recovery token"
              className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
                errors.token ? 'border-red-500' : 'border-gray-250 dark:border-slate-700'
              } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
            />
          </div>
          {errors.token && <p className="text-xs text-red-500">{errors.token.message}</p>}
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">New Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('newPassword')}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
                errors.newPassword ? 'border-red-500' : 'border-gray-250 dark:border-slate-700'
              } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Confirm Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-250 dark:border-slate-700'
              } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Reset Password'}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-gray-100 dark:border-slate-800">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}

export default ResetPassword
