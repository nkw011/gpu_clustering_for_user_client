import LoginForm from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPU Cluster Management System',
  description: 'Login to GPU Cluster Management System',
}

export default function LoginPage() {
  return <LoginForm />
} 