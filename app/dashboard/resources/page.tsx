'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FiSearch, FiSliders } from 'react-icons/fi'
import type { ServerGPU } from '@/types/gpu'

export default function ResourcesPage() {
  const [serverGPUs, setServerGPUs] = useState<ServerGPU[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchGPUs()
  }, [])

  const fetchGPUs = async () => {
    try {
      const { data, error } = await supabase
        .from('server_gpus')
        .select(`
          *,
          gpu_model:gpu_models(*),
          server:racks(*)
        `)
        .order('server_id')

      if (error) throw error

      setServerGPUs(data.map(gpu => ({
        ...gpu,
        updated_at: new Date(gpu.updated_at),
        gpu_model: {
          ...gpu.gpu_model,
          created_at: new Date(gpu.gpu_model.created_at)
        },
        server: {
          ...gpu.server,
          created_at: new Date(gpu.server.created_at)
        }
      })))
    } catch (error) {
      console.error('Error fetching GPUs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGPUs = serverGPUs.filter(gpu => 
    gpu.gpu_model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gpu.server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gpu.server.rack.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GPU Resources</h1>
          <p className="text-gray-500 mt-1">View and request available GPU resources</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-2xl">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search GPU models, servers, or racks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-0 shadow-sm"
          />
        </div>
      </div>

      {/* GPU List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">SERVER</th>
                <th className="px-6 py-4">RACK</th>
                <th className="px-6 py-4">GPU MODEL</th>
                <th className="px-6 py-4">MEMORY</th>
                <th className="px-6 py-4">COMPUTE</th>
                <th className="px-6 py-4">AVAILABILITY</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredGPUs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No GPUs found
                  </td>
                </tr>
              ) : (
                filteredGPUs.map((serverGPU) => (
                  <tr key={`${serverGPU.server_id}-${serverGPU.gpu_model_id}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded bg-indigo-50 flex items-center justify-center">
                          <span className="text-xs font-medium text-indigo-600">SV</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{serverGPU.server.name}</div>
                          <div className="text-sm text-gray-500">{serverGPU.server.ip_address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{serverGPU.server.rack}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{serverGPU.gpu_model.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{serverGPU.gpu_model.memory_gb}GB</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{serverGPU.gpu_model.compute_capability || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ 
                              width: `${(serverGPU.available_count / serverGPU.total_count) * 100}%`
                            }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {serverGPU.available_count} / {serverGPU.total_count} available
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Request 버튼 제거 */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 