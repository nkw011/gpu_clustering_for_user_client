'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Rack, GPUModel, ServerGPU } from '@/types/gpu'

export default function RequestPage() {
  const [selectedServer, setSelectedServer] = useState('')
  const [selectedGPUModel, setSelectedGPUModel] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState(false)
  const [servers, setServers] = useState<Rack[]>([])
  const [gpuModels, setGPUModels] = useState<GPUModel[]>([])
  const [serverGPUs, setServerGPUs] = useState<ServerGPU[]>([])
  const [agreed, setAgreed] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchServersAndGPUs()
    fetchUserData()
  }, [])

  const fetchServersAndGPUs = async () => {
    try {
      // Fetch servers
      const { data: serverData, error: serverError } = await supabase
        .from('racks')
        .select('*')
        .order('name')

      if (serverError) throw serverError
      setServers(serverData)

      // Fetch server GPUs
      const { data: serverGPUData, error: serverGPUError } = await supabase
        .from('server_gpus')
        .select(`
          *,
          gpu_model:gpu_models(*),
          server:racks(*)
        `)
        .order('server_id')

      if (serverGPUError) throw serverGPUError
      setServerGPUs(serverGPUData)

      // Fetch GPU models
      const { data: gpuData, error: gpuError } = await supabase
        .from('gpu_models')
        .select('*')
        .order('name')

      if (gpuError) throw gpuError
      setGPUModels(gpuData)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const fetchUserData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        throw new Error('Not authenticated')
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (userError) throw userError
      setUser(userData)
    } catch (error) {
      console.error('Error fetching user data:', error)
      // Redirect to login or show error
    }
  }

  const getAvailableGPUModels = () => {
    if (!selectedServer) return []
    return serverGPUs
      .filter(gpu => gpu.server_id.toString() === selectedServer && gpu.available_count > 0)
      .map(gpu => gpu.gpu_model)
  }

  const getMaxQuantity = () => {
    if (!selectedServer || !selectedGPUModel) return 0
    const serverGPU = serverGPUs.find(
      gpu => 
        gpu.server_id.toString() === selectedServer && 
        gpu.gpu_model_id.toString() === selectedGPUModel
    )
    return serverGPU ? Math.min(serverGPU.available_count, 4) : 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!duration || parseInt(duration) <= 0 || parseInt(duration) > 30) {
      alert('Please enter a valid duration between 1 and 30 days')
      setLoading(false)
      return
    }

    if (!user) {
      alert('Please login first')
      setLoading(false)
      return
    }

    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + parseInt(duration))

      // Start a Supabase transaction
      const { data, error: transactionError } = await supabase.rpc('create_resource_request', {
        p_user_id: user.id,
        p_server_id: selectedServer,
        p_gpu_model_id: selectedGPUModel,
        p_quantity: parseInt(quantity),
        p_project_name: projectName,
        p_project_description: projectDescription,
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_duration: parseInt(duration)
      })

      if (transactionError) throw transactionError

      // Reset form
      setSelectedServer('')
      setSelectedGPUModel('')
      setQuantity('1')
      setProjectName('')
      setProjectDescription('')
      setDuration('')
      setAgreed(false)

      alert('Request submitted successfully!')
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resource Request Form</h1>
        <p className="text-gray-500 mt-1">Request GPU resources for your project</p>
      </div>

      <Card className="max-w-2xl border rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Server Selection */}
          <div className="space-y-2">
            <Label htmlFor="server" className="text-sm font-medium text-gray-900">
              Server <span className="text-red-500">*</span>
            </Label>
            <Select value={selectedServer} onValueChange={(value) => {
              setSelectedServer(value)
              setSelectedGPUModel('')
              setQuantity('1')
            }}>
              <SelectTrigger className="w-full bg-white border border-gray-200">
                <SelectValue placeholder="Select Server" />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.id.toString()}>
                    {server.name} ({server.rack})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* GPU Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="gpu" className="text-sm font-medium text-gray-900">
              GPU Model <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={selectedGPUModel} 
              onValueChange={(value) => {
                setSelectedGPUModel(value)
                setQuantity('1')
              }}
              disabled={!selectedServer}
            >
              <SelectTrigger className="w-full bg-white border border-gray-200">
                <SelectValue placeholder="Select GPU Model" />
              </SelectTrigger>
              <SelectContent position="popper" className="w-[--radix-select-trigger-width]">
                {getAvailableGPUModels().map((model) => (
                  <SelectItem 
                    key={model.id} 
                    value={model.id.toString()}
                    className="py-2.5 text-base"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{model.name}</span>
                      <span className="text-sm text-gray-500">({model.memory_gb}GB)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium text-gray-900">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={quantity} 
              onValueChange={setQuantity}
              disabled={!selectedServer || !selectedGPUModel}
            >
              <SelectTrigger className="w-full bg-white border border-gray-200">
                <SelectValue placeholder="Select Quantity" />
              </SelectTrigger>
              <SelectContent position="popper">
                {Array.from({ length: getMaxQuantity() }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} GPU{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">Maximum 4 GPUs per request</p>
          </div>

          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-sm font-medium text-gray-900">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="projectName"
              placeholder="e.g., Deep Learning for Medical Imaging"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-white border border-gray-200"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="projectDescription" className="text-sm font-medium text-gray-900">
              Project Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="projectDescription"
              placeholder="Describe your project and why you need these GPU resources..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={4}
              className="w-full bg-white border border-gray-200"
            />
            <p className="text-sm text-gray-500">
              Provide details about your project goals, computational requirements, and expected outcomes
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-900">
              Duration (Days) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="30"
              value={duration}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 30)) {
                  setDuration(value)
                }
              }}
              placeholder="Enter number of days (1-30)"
              className="w-full bg-white border border-gray-200"
            />
            <p className="text-sm text-gray-500">Maximum 30 days per request</p>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked: boolean) => setAgreed(checked)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the terms and conditions <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500">
                By submitting this request, you agree to use the resources responsibly and comply with the usage policies.
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={!selectedServer || !selectedGPUModel || !quantity || !projectName || !projectDescription || !duration || !agreed || loading}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </Card>
    </div>
  )
} 