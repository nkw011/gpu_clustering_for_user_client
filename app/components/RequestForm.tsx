'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GPUModel {
  id: number;
  name: string;
  memory_gb: number;
}

export default function RequestForm() {
  const [gpuModels, setGpuModels] = useState<GPUModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [durationDays, setDurationDays] = useState<number>(1);
  const [projectDetails, setProjectDetails] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchGPUModels();
  }, []);

  const fetchGPUModels = async () => {
    try {
      const { data, error } = await supabase
        .from('gpu_models')
        .select('*')
        .order('name');

      if (error) throw error;
      setGpuModels(data);
    } catch (error) {
      console.error('Error fetching GPU models:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (durationDays <= 0 || durationDays > 30) {
      alert('Duration must be between 1 and 30 days');
      setLoading(false);
      return;
    }

    try {
      // Handle form submission
      console.log({
        gpuModel: selectedModel,
        quantity,
        durationDays,
        projectDetails,
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-2xl mx-auto p-6">
      <div className="space-y-2">
        <Label htmlFor="gpu-model">GPU Model *</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel} required>
          <SelectTrigger id="gpu-model">
            <SelectValue placeholder="Select a GPU model" />
          </SelectTrigger>
          <SelectContent>
            {gpuModels.map((model) => (
              <SelectItem key={model.id} value={model.id.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-sm text-gray-500">{model.memory_gb}GB Memory</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity *</Label>
        <Select value={quantity} onValueChange={setQuantity} required>
          <SelectTrigger id="quantity">
            <SelectValue placeholder="Select quantity" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="durationDays">Duration (days) *</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">
            <CalendarIcon className="w-4 h-4" />
          </span>
          <Input
            id="durationDays"
            type="number"
            min={1}
            max={30}
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="pl-9 bg-white"
            placeholder="1–30"
            required
          />
        </div>
        <p className="text-sm text-gray-500">Maximum 30 days per request</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-details">Project Details *</Label>
        <Textarea
          id="project-details"
          value={projectDetails}
          onChange={(e) => setProjectDetails(e.target.value)}
          placeholder="Provide details about your project goals, computational requirements, and expected outcomes"
          className="min-h-[120px]"
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={!selectedModel || !quantity || durationDays <= 0 || !projectDetails || loading}
      >
        {loading ? 'Submitting...' : 'Submit Request'}
      </Button>
    </form>
  );
} 