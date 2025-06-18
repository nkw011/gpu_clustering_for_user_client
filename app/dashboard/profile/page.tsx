"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { User } from "@/types/supabase";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", department: "", student_id: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileHover, setProfileHover] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(userData);
        setForm({
          name: userData.name,
          department: userData.department,
          student_id: userData.student_id,
        });
      }
    };
    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleEdit = () => setEditMode(true);

  const handleSave = async () => {
    if (!user) return;
    await supabase.from("users").update(form).eq("id", user.id);
    setUser({ ...user, ...form });
    setEditMode(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage("");
    if (password !== confirmPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPasswordMessage(error.message);
    } else {
      setPasswordMessage("Password has been successfully changed.");
      setTimeout(() => setShowPasswordModal(false), 1500);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile Settings</h2>
        <div>
          {editMode ? (
            <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded mr-2 transition">Save</button>
          ) : (
            <button onClick={handleEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded mr-2 transition">Edit Profile</button>
          )}
          <button onClick={handleLogout} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded transition">Logout</button>
        </div>
      </div>
      <div className="flex items-center mb-6">
        <div
          className={`w-20 h-20 rounded-full bg-teal-600 flex items-center justify-center text-3xl text-white mr-6 transition-transform transition-shadow duration-200 ${profileHover ? 'scale-105 shadow-lg cursor-pointer' : ''}`}
          onMouseEnter={() => setProfileHover(true)}
          onMouseLeave={() => setProfileHover(false)}
        >
          {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
        </div>
        <div>
          <div className="font-semibold text-lg">{user.name}</div>
          <div className="text-gray-500">{user.email}</div>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Full Name</label>
        <input
          className="w-full border rounded px-3 py-2 mb-2"
          value={editMode ? form.name : user.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          disabled={!editMode}
        />
        <label className="block text-gray-600 mb-1">Email Address</label>
        <input className="w-full border rounded px-3 py-2 mb-2" value={user.email} disabled />
        <label className="block text-gray-600 mb-1">Department</label>
        <input
          className="w-full border rounded px-3 py-2 mb-2"
          value={editMode ? form.department : user.department}
          onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
          disabled={!editMode}
        />
        <label className="block text-gray-600 mb-1">Student ID</label>
        <input
          className="w-full border rounded px-3 py-2 mb-2"
          value={editMode ? form.student_id : user.student_id}
          onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
          disabled={!editMode}
        />
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
        <button
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded transition"
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>
      </div>
      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h4 className="text-lg font-bold mb-4">Change Password</h4>
            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              {passwordMessage && <div className="text-sm text-red-500 mb-2">{passwordMessage}</div>}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                    setConfirmPassword("");
                    setPasswordMessage("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 