'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get('message')

  useEffect(() => {
    if (message) {
      // Show success message (you might want to use a toast notification here)
      alert(message)
    }
    // Redirect to login page after showing the message
    router.push('/auth/login')
  }, [message, router])

  return null
}
