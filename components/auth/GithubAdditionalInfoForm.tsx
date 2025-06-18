'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase'

type GithubAdditionalInfoFormProps = {
  email: string
  userId: string
  onComplete: () => void
}

export default function GithubAdditionalInfoForm({ email, userId, onComplete }: GithubAdditionalInfoFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    student_id: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: email,
            name: formData.name,
            department: formData.department,
            student_id: formData.student_id,
          },
        ])

      if (profileError) throw profileError

      onComplete()
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Additional Information Required</h2>
        <p className="mb-4 text-center text-gray-600">Please provide the following information to complete your registration.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              id="department"
              name="department"
              type="text"
              value={formData.department}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
              Student ID
            </label>
            <input
              id="student_id"
              name="student_id"
              type="text"
              value={formData.student_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Complete Registration'}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-red-600">{message}</p>
        )}
      </div>
    </div>
  )
} 