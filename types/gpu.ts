export interface GPU {
  id: string;
  model: string;
  memory: number; // GB
  cores: number;
  clock_speed: number;
  power: number;
  rack_id: string | null;
  status: 'available' | 'in-use' | 'maintenance';
  created_at: Date;
  updated_at: Date;
  available: number | null;
  serverId: string;
}

export interface Server {
  id: string;
  name: string;
  gpus: GPU[];
  location: string;
  status: 'online' | 'offline' | 'maintenance';
}

export interface ResourceRequest {
  id: string;
  server_id: number;
  gpu_model_id: number;
  quantity: number;
  project_name: string;
  project_description: string;
  start_date: Date;
  end_date: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  department: string;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  status?: 'expire_soon' | 'approved' | 'denied' | 'expired';
}

export interface Rack {
  id: number;
  name: string;
  ip_address: string | null;
  rack: string;
  created_at: Date;
}

export interface GPUModel {
  id: number;
  name: string;
  vendor: string;
  memory_gb: number;
  compute_capability: string | null;
  created_at: Date;
}

export interface ServerGPU {
  server_id: number;
  gpu_model_id: number;
  total_count: number;
  available_count: number;
  updated_at: Date;
  gpu_model: GPUModel;
  server: Rack;
}

export interface GPUWithRackInfo extends GPU {
  rack: Rack | null;
  availability: {
    available: number;
    total: number;
  };
} 