'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import GithubAdditionalInfoForm from '@/components/auth/GithubAdditionalInfoForm'

export default function GithubCompletePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const email = searchParams.get('email') || ''
  const id = searchParams.get('id') || ''

  const handleComplete = () => {
    router.push('/?message=' + encodeURIComponent('Successfully registered with GitHub!'))
  }

  return (
    <GithubAdditionalInfoForm
      email={email}
      userId={id}
      onComplete={handleComplete}
    />
  )
} 