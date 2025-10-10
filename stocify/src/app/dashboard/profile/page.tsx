"use client";

import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api";
import { 
  IoPerson, 
  IoMail, 
  IoCalendar, 
  IoTime, 
  IoPencil,
  IoCheckmarkCircle,
  IoCloseCircle
} from "react-icons/io5";
import { useEffect, useState } from "react";

interface ExtendedUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  address: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; address?: string }>({});

  useEffect(() => {
    if (user && isAuthenticated) {
      // The user data now comes from the updated API with extended information
      const extendedUserData: ExtendedUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: (user as any).name || `${user.firstName} ${user.lastName}`,
        address: (user as any).address || 'Not provided',
        role: (user as any).role || 'user',
        status: (user as any).status || 'active',
        createdAt: (user as any).createdAt || new Date().toISOString(),
        updatedAt: (user as any).updatedAt || new Date().toISOString()
      };
      setExtendedUser(extendedUserData);
      setForm({
        name: extendedUserData.name || "",
        email: extendedUserData.email || "",
        address: extendedUserData.address || ""
      });
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !extendedUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next: { name?: string; email?: string; address?: string } = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    // address optional, but keep field present
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!extendedUser) return;
    if (!validate()) return;
    setSaving(true);
    try {
      await apiClient.updateUser(String(extendedUser.id), {
        name: form.name,
        email: form.email,
        address: form.address
      });

      const updated: ExtendedUser = {
        ...extendedUser,
        name: form.name,
        email: form.email,
        address: form.address,
        updatedAt: new Date().toISOString()
      };
      setExtendedUser(updated);
      setIsEditOpen(false);
      // refresh auth user data
      checkAuth();
    } catch (e) {
      // naive inline error; keep UX simple
      setErrors(prev => ({ ...prev, email: "Failed to update. Please try again." }));
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'user':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardContent className="p-6 text-center">
                {/* Avatar */}
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                  <IoPerson className="w-12 h-12 text-white" />
                </div>
                
                {/* User Name */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {extendedUser.name}
                </h1>
                
                {/* Role Badge */}
                <Badge className={`mb-4 ${getRoleBadgeColor(extendedUser.role || 'user')}`}>
                  <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                  {extendedUser.role || 'user'}
                </Badge>
                
                {/* Contact & Login Details */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center text-gray-600">
                    <IoMail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">{extendedUser.email}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <IoCalendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">
                      Joined {formatDate(extendedUser.createdAt || new Date().toISOString()).split(' at ')[0]}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <IoTime className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-sm">
                      Last login {formatDate(extendedUser.updatedAt || new Date().toISOString()).split(' at ')[0]}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Profile Information Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Profile Information</h2>
                    <p className="text-gray-600">View your account details and information</p>
                  </div>
                  
                  {/* Edit Profile Button */}
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700"
                    onClick={() => setIsEditOpen(true)}
                  >
                    <IoPencil className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                {/* Information Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Row 1 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">User ID</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
                      #{extendedUser.id}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Status</label>
                    <div className="flex">
                      <Badge className={`${getStatusBadgeColor(extendedUser.status || 'active')}`}>
                        {extendedUser.status === 'active' ? (
                          <IoCheckmarkCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <IoCloseCircle className="w-3 h-3 mr-1" />
                        )}
                        {extendedUser.status || 'active'}
                      </Badge>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
                      {extendedUser.name}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
                      {extendedUser.email}
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
                      {extendedUser.address}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Role</label>
                    <div className="flex">
                      <Badge className={`${getRoleBadgeColor(extendedUser.role || 'user')}`}>
                        <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                        {extendedUser.role || 'user'}
                      </Badge>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Created</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900">
                      {formatDate(extendedUser.createdAt || new Date().toISOString())}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="p-7 px-8 poppins min-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[22px]">Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information.</DialogDescription>
          </DialogHeader>
          <Separator />

          <div className="flex flex-col gap-3 mt-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-name">Name</Label>
                <Input id="profile-name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className={errors.name ? "border-red-500" : ""} />
                {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-email">Email Address</Label>
                <Input id="profile-email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className={errors.email ? "border-red-500" : ""} />
                {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-address">Address</Label>
              <Input id="profile-address" value={form.address} onChange={(e) => handleChange("address", e.target.value)} className={errors.address ? "border-red-500" : ""} />
              {errors.address && <div className="text-red-500 text-sm">{errors.address}</div>}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="secondary" onClick={() => setIsEditOpen(false)} className="h-11 px-9">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="h-11 px-9 bg-orange-600 hover:bg-orange-700 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
