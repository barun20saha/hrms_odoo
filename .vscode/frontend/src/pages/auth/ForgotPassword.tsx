import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { toast } from 'react-hot-toast'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import { api } from '../../services/api'

const forgotSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
})

type ForgotFormInputs = zod.infer<typeof forgotSchema>

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormInputs>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotFormInputs) => {
    setLoading(true)
    try {
      const response = await api.post(`/auth/forgot-password?email=${data.email}`)
      if (response.data.success) {
        toast.success('Password reset token generated!')
        if (response.data.data) {
          setResetToken(response.data.data)
        }
      } else {
        toast.error(response.data.message || 'Request failed')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Email address not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recover Password</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter your registered email to receive a recovery token</p>
      </div>

      {resetToken ? (
        <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-slate-700 text-center space-y-4">
          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
            Reset token generated successfully! Copy this token to reset your password.
          </p>
          <div className="text-xs bg-white dark:bg-slate-900 p-3 rounded-lg font-mono border text-gray-700 dark:text-gray-300 select-all">
            {resetToken}
          </div>
          <Link
            to="/reset-password"
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all"
          >
            Proceed to Reset Password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Mail size={18} />
              </span>
              <input
                type="email"
                {...register('email')}
                placeholder="name@company.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
                  errors.email ? 'border-red-500' : 'border-gray-250 dark:border-slate-700'
                } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      )}

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

export default ForgotPassword
