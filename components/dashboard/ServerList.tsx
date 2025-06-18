'use client';

import { useState } from 'react';
import { Server, GPU } from '@/types/gpu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FiSearch } from 'react-icons/fi';

// 임시 데이터
const mockServers: Server[] = [
  {
    id: '1',
    name: 'Server-A',
    location: 'Room 101',
    status: 'online',
    gpus: [
      { id: '1', model: 'NVIDIA A100', memory: 80, status: 'available', serverId: '1' },
      { id: '2', model: 'NVIDIA A100', memory: 80, status: 'in-use', serverId: '1' },
    ],
  },
  // 추가 서버 데이터...
];

export function ServerList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [memoryFilter, setMemoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredServers = mockServers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      server.gpus.some(gpu => gpu.model.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search servers or GPU models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={memoryFilter} onValueChange={setMemoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Memory Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Memory</SelectItem>
            <SelectItem value="80">80GB</SelectItem>
            <SelectItem value="40">40GB</SelectItem>
            <SelectItem value="24">24GB</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Server Name</TableHead>
              <TableHead className="w-[200px]">Location</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead>GPUs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServers.map((server) => (
              <TableRow key={server.id}>
                <TableCell className="font-medium">{server.name}</TableCell>
                <TableCell>{server.location}</TableCell>
                <TableCell>
                  <Badge variant={
                    server.status === 'online' ? 'success' :
                    server.status === 'offline' ? 'destructive' : 'warning'
                  }>
                    {server.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {server.gpus.map((gpu) => (
                      <Badge
                        key={gpu.id}
                        variant={
                          gpu.status === 'available' ? 'outline' :
                          gpu.status === 'in-use' ? 'secondary' : 'default'
                        }
                        className="flex items-center gap-2"
                      >
                        <span className={`w-2 h-2 rounded-full ${
                          gpu.status === 'available' ? 'bg-green-500' :
                          gpu.status === 'in-use' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        {gpu.model} ({gpu.memory}GB)
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 