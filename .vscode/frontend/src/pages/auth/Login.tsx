import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { toast } from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../services/api'

// Define Login Form Validation Schema
const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: zod.boolean(),
})

type LoginFormInputs = zod.infer<typeof loginSchema>

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const setLogin = useAuthStore((state) => state.setLogin)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true)
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      })

      if (response.data.success) {
        const { token, email, employeeId, role } = response.data.data
        setLogin(token, email, employeeId, role, data.rememberMe)
        
        toast.success('Signed in successfully!')
        
        // Redirect based on role
        if (role === 'ROLE_ADMIN') {
          navigate('/admin/dashboard')
        } else {
          navigate('/employee/dashboard')
        }
      } else {
        toast.error(response.data.message || 'Authentication failed')
      }
    } catch (error: any) {
      console.error(error)
      const errorMsg = error.response?.data?.message || 'Invalid email or password'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Please sign in to access your HR workspace</p>
      </div>

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
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-250 dark:border-slate-700 focus:ring-blue-500'
              } rounded-xl text-sm focus:outline-hidden focus:ring-2 dark:text-white transition-all`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder="••••••••"
              className={`w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-slate-800 border ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-250 dark:border-slate-700 focus:ring-blue-500'
              } rounded-xl text-sm focus:outline-hidden focus:ring-2 dark:text-white transition-all`}
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

        {/* Remember Me Checkbox */}
        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-700 rounded-sm focus:ring-blue-500 dark:bg-slate-800"
          />
          <label htmlFor="rememberMe" className="ml-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none">
            Remember my details on this device
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-800">
        New to HRMS?{' '}
        <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Create an Account
        </Link>
      </div>
    </div>
  )
}

export default Login
