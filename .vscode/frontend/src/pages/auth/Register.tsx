import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { toast } from 'react-hot-toast'
import { Mail, Lock, User, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react'
import { api } from '../../services/api'

// Define Register Form Schema
const registerSchema = zod.object({
  employeeId: zod.string().min(3, 'Employee ID is required (e.g. EMP1001)'),
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
  role: zod.enum(['EMPLOYEE', 'ADMIN']),
})

type RegisterFormInputs = zod.infer<typeof registerSchema>

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'EMPLOYEE',
    },
  })

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/register', data)

      if (response.data.success) {
        toast.success('Registration request submitted!')
        // If local profile token is returned, capture it for simple verification box
        if (response.data.data) {
          setVerificationToken(response.data.data)
        }
      } else {
        toast.error(response.data.message || 'Registration failed')
      }
    } catch (error: any) {
      console.error('Registration error details:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed. Check network or console.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!verificationToken) return
    setVerifying(true)
    try {
      const response = await api.get(`/auth/verify-email?token=${verificationToken}`)
      if (response.data.success) {
        toast.success('Email verified successfully! You can now log in.')
        navigate('/login')
      } else {
        toast.error(response.data.message || 'Verification failed')
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Invalid or expired verification token')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Register for an HRMS employee portal account</p>
      </div>

      {verificationToken ? (
        <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-slate-700 text-center space-y-4">
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
            Account created! Please verify your email to activate it.
          </p>
          <div className="text-xs bg-white dark:bg-slate-900 p-3 rounded-lg font-mono border text-gray-700 dark:text-gray-300 select-all">
            {verificationToken}
          </div>
          <button
            onClick={handleVerifyEmail}
            disabled={verifying}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-all"
          >
            {verifying ? <Loader2 size={16} className="animate-spin" /> : 'Activate & Verify Email'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Employee ID */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Employee ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <User size={18} />
              </span>
              <input
                type="text"
                {...register('employeeId')}
                placeholder="EMP1001"
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
                  errors.employeeId ? 'border-red-500' : 'border-gray-250 dark:border-slate-700'
                } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all`}
              />
            </div>
            {errors.employeeId && <p className="text-xs text-red-500">{errors.employeeId.message}</p>}
          </div>

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

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
                  errors.password ? 'border-red-500' : 'border-gray-250 dark:border-slate-700'
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
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* Role Select Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Registration Role</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <KeyRound size={18} />
              </span>
              <select
                {...register('role')}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white transition-all appearance-none"
              >
                <option value="EMPLOYEE">Employee Portal</option>
                <option value="ADMIN">System Admin</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Register Account'}
          </button>
        </form>
      )}

      <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-800">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Sign In
        </Link>
      </div>
    </div>
  )
}

export default Register
