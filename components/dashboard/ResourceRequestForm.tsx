'use client';

import { useState } from 'react';
import { Server, ResourceRequest } from '@/types/gpu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export function ResourceRequestForm() {
  const [formData, setFormData] = useState({
    serverId: '',
    gpuIds: [] as string[],
    purpose: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 연동
    console.log('Form submitted:', formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request GPU Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Server</label>
            <Select
              value={formData.serverId}
              onValueChange={(value) => setFormData({ ...formData, serverId: value })}
            >
              <option value="">Select a server</option>
              {/* TODO: 서버 목록 동적 로딩 */}
              <option value="server1">Server A</option>
              <option value="server2">Server B</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Number of GPUs</label>
            <Select
              value={formData.gpuIds.length.toString()}
              onValueChange={(value) => 
                setFormData({ 
                  ...formData, 
                  gpuIds: Array(parseInt(value)).fill('') 
                })
              }
            >
              <option value="1">1 GPU</option>
              <option value="2">2 GPUs</option>
              <option value="4">4 GPUs</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Purpose</label>
            <Textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Describe your research purpose and requirements..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Submit Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 