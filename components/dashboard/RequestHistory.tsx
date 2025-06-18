'use client';

import { useState } from 'react';
import { ResourceRequest } from '@/types/gpu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

// 임시 데이터
const mockRequests: ResourceRequest[] = [
  {
    id: '1',
    userId: 'user1',
    serverId: 'server1',
    gpuIds: ['gpu1', 'gpu2'],
    purpose: '딥러닝 모델 학습',
    startDate: new Date('2024-03-20'),
    endDate: new Date('2024-03-25'),
    status: 'pending',
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-19'),
  },
  // 추가 요청 데이터...
];

export function RequestHistory() {
  const [requests, setRequests] = useState<ResourceRequest[]>(mockRequests);

  const handleCancel = async (requestId: string) => {
    // TODO: API 연동
    setRequests(requests.map(req =>
      req.id === requestId ? { ...req, status: 'cancelled' as const } : req
    ));
  };

  const getStatusColor = (status: ResourceRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Purpose</TableHead>
              <TableHead>Server</TableHead>
              <TableHead>GPUs</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.purpose}</TableCell>
                <TableCell>{request.serverId}</TableCell>
                <TableCell>{request.gpuIds.length} GPUs</TableCell>
                <TableCell>
                  {new Date(request.startDate).toLocaleDateString()} - 
                  {new Date(request.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </TableCell>
                <TableCell>
                  {request.status === 'pending' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(request.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 