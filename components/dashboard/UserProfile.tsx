'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types/gpu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          return;
        }

        const userWithNotifications: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          department: userData.department,
          notifications: [], // TODO: 알림 데이터 연동
        };

        setUser(userWithNotifications);
        setEditedUser(userWithNotifications);
      }
    };

    fetchUser();
  }, [supabase]);

  const handleSave = async () => {
    if (!editedUser) return;

    const { error } = await supabase
      .from('users')
      .update({
        name: editedUser.name,
        department: editedUser.department,
      })
      .eq('id', editedUser.id);

    if (error) {
      console.error('Error updating user:', error);
      return;
    }

    setUser(editedUser);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Profile</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? 'Save' : 'Edit'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          {isEditing ? (
            <Input
              id="name"
              value={editedUser?.name}
              onChange={(e) => setEditedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
            />
          ) : (
            <p className="text-sm mt-1">{user.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <p className="text-sm mt-1">{user.email}</p>
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          {isEditing ? (
            <Input
              id="department"
              value={editedUser?.department}
              onChange={(e) => setEditedUser(prev => prev ? { ...prev, department: e.target.value } : null)}
            />
          ) : (
            <p className="text-sm mt-1">{user.department}</p>
          )}
        </div>

        {isEditing && (
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditedUser(user);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 