import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { toast } from 'react-hot-toast'
import { Phone, MapPin, Image, User, Briefcase, Calendar, Loader, Save, Sparkles, Mail } from 'lucide-react'
import { useEmployeeQueries } from '../../services/queries/useEmployeeQueries'

// Validation schema for profile update
const profileSchema = zod.object({
  phone: zod.string().min(10, 'Phone number must be at least 10 digits'),
  address: zod.string().min(5, 'Address must be at least 5 characters'),
  profilePictureUrl: zod.string().url('Must be a valid image link').or(zod.string().length(0)),
})

type ProfileFormInputs = zod.infer<typeof profileSchema>

export const Profile: React.FC = () => {
  const {
    useGetProfile,
    useUpdateProfilePhone,
    useUpdateProfileAddress,
    useUpdateProfilePicture
  } = useEmployeeQueries()

  const { data: profile, isLoading, error } = useGetProfile()
  const phoneMutation = useUpdateProfilePhone()
  const addressMutation = useUpdateProfileAddress()
  const picMutation = useUpdateProfilePicture()

  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
  })

  // Pre-populate fields once profile loads
  useEffect(() => {
    if (profile) {
      setValue('phone', profile.phone || '')
      setValue('address', profile.address || '')
      setValue('profilePictureUrl', profile.profilePictureUrl || '')
    }
  }, [profile, setValue])

  const onSubmit = async (data: ProfileFormInputs) => {
    setSaving(true)
    try {
      // Execute three mutations in parallel if fields have changed
      const promises = []
      if (data.phone !== profile?.phone) {
        promises.push(phoneMutation.mutateAsync(data.phone))
      }
      if (data.address !== profile?.address) {
        promises.push(addressMutation.mutateAsync(data.address))
      }
      if (data.profilePictureUrl !== profile?.profilePictureUrl) {
        promises.push(picMutation.mutateAsync(data.profilePictureUrl))
      }

      if (promises.length > 0) {
        await Promise.all(promises)
        toast.success('Profile details updated successfully!')
      } else {
        toast.error('No changes detected.')
      }
    } catch (err: any) {
      console.error(err)
      toast.error('Failed to save profile changes.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <Loader size={40} />
  if (error || !profile) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to fetch profile info. Ensure you are signed in.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile header card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none">
          <Sparkles size={120} className="text-blue-600" />
        </div>
        
        {/* Profile Avatar */}
        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/20 relative overflow-hidden shrink-0">
          {profile.profilePictureUrl ? (
            <img src={profile.profilePictureUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span>{profile.firstName.charAt(0)}{profile.lastName.charAt(0)}</span>
          )}
        </div>

        {/* Text descriptions */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mt-0.5">{profile.designation || 'Specialist'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-slate-800/80">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <User size={16} className="text-gray-400" />
              <span>ID: <strong className="text-gray-700 dark:text-gray-300">{profile.employeeId}</strong></span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Briefcase size={16} className="text-gray-400" />
              <span>Department: <strong className="text-gray-700 dark:text-gray-300">{profile.department || 'Operations'}</strong></span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Calendar size={16} className="text-gray-400" />
              <span>Joined: <strong className="text-gray-700 dark:text-gray-300">{profile.dateOfJoining ? new Date(profile.dateOfJoining).toLocaleDateString() : 'N/A'}</strong></span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Mail size={16} className="text-gray-400" />
              <span className="truncate">{profile.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile forms and details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left pane: Salary Structure visualizer */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-gray-800 dark:text-white uppercase tracking-wider">Salary Structure</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm py-1 border-b border-gray-50 dark:border-slate-800/40">
              <span className="text-gray-500">Basic Salary</span>
              <span className="font-semibold text-gray-800 dark:text-white">
                ${profile.salaryStructure?.basicSalary?.toLocaleString() || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b border-gray-50 dark:border-slate-800/40">
              <span className="text-gray-500">Allowances</span>
              <span className="font-semibold text-green-600">
                +${profile.salaryStructure?.allowances?.toLocaleString() || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm py-1 border-b border-gray-50 dark:border-slate-800/40">
              <span className="text-gray-500">Deductions</span>
              <span className="font-semibold text-red-500">
                -${profile.salaryStructure?.deductions?.toLocaleString() || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 font-bold text-gray-900 dark:text-white">
              <span>Net Monthly</span>
              <span>
                ${((profile.salaryStructure?.basicSalary || 0) + (profile.salaryStructure?.allowances || 0) - (profile.salaryStructure?.deductions || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right pane: Edit Profile Details */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Contact & Profile Settings</h3>
            <p className="text-xs text-gray-400">Update fields to modify your contact address information.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <Phone size={16} />
                </span>
                <input
                  type="text"
                  {...register('phone')}
                  placeholder="9876543210"
                  className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border ${
                    errors.phone ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'
                  } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Home Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 pt-2.5 flex items-start text-gray-400 pointer-events-none">
                  <MapPin size={16} />
                </span>
                <textarea
                  rows={3}
                  {...register('address')}
                  placeholder="123 Oak Ave, California"
                  className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border ${
                    errors.address ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'
                  } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white`}
                />
              </div>
              {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
            </div>

            {/* Profile Pic URL */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Avatar Image Link</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <Image size={16} />
                </span>
                <input
                  type="text"
                  {...register('profilePictureUrl')}
                  placeholder="https://example.com/avatar.jpg"
                  className={`w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border ${
                    errors.profilePictureUrl ? 'border-red-500' : 'border-gray-200 dark:border-slate-700'
                  } rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 dark:text-white`}
                />
              </div>
              {errors.profilePictureUrl && <p className="text-xs text-red-500">{errors.profilePictureUrl.message}</p>}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all disabled:opacity-50"
            >
              {saving ? <Loader size={16} /> : <Save size={16} />}
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
