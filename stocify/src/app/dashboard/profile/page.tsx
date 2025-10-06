"use client";

import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [extendedUser, setExtendedUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

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
                  
                  {/* Edit Profile Button - Inactive as requested */}
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                    disabled
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
    </div>
  );
}
