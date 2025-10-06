"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IoEyeOff, IoEye } from "react-icons/io5";

export default function ChangePasswordPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const validate = () => {
    if (!form.currentPassword) return "Current password is required";
    if (!form.newPassword) return "New password is required";
    if (form.newPassword.length < 6) return "New password must be at least 6 characters";
    if (form.newPassword !== form.confirmPassword) return "Passwords do not match";
    return "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!isAuthenticated || isLoading) return;
    setSubmitting(true);
    try {
      // IMPORTANT: Only send currentPassword and newPassword (NOT confirmPassword)
      await apiClient.changePassword(form.currentPassword, form.newPassword);
      setSuccess("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err?.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h1>
            <p className="text-gray-600 mb-6">Update your account password to keep your account secure</p>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 text-red-700 border border-red-200 px-4 py-2 text-sm">{error}</div>
            )}
            {success && (
              <div className="mb-4 rounded-md bg-green-50 text-green-700 border border-green-200 px-4 py-2 text-sm">{success}</div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
                <div className="relative">
                  <Input
                    type={show.current ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Enter your current password"
                    value={form.currentPassword}
                    onChange={onChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                    aria-label="Toggle password visibility"
                  >
                    {show.current ? <IoEyeOff /> : <IoEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
                <div className="relative">
                  <Input
                    type={show.next ? "text" : "password"}
                    name="newPassword"
                    placeholder="Enter your new password"
                    value={form.newPassword}
                    onChange={onChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                    aria-label="Toggle password visibility"
                  >
                    {show.next ? <IoEyeOff /> : <IoEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
                <div className="relative">
                  <Input
                    type={show.confirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    value={form.confirmPassword}
                    onChange={onChange}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                    aria-label="Toggle password visibility"
                  >
                    {show.confirm ? <IoEyeOff /> : <IoEye />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                {submitting ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


