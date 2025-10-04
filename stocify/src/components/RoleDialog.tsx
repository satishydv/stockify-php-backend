"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useRoleStore } from "@/stores/roleStore"
import { moduleNames } from "@/lib/role-data"
import { apiClient } from "@/lib/api"

interface RoleFormData {
  name: string
  permissions: {
    dashboard: { create: boolean; read: boolean; update: boolean; delete: boolean }
    products: { create: boolean; read: boolean; update: boolean; delete: boolean }
    users: { create: boolean; read: boolean; update: boolean; delete: boolean }
    orders: { create: boolean; read: boolean; update: boolean; delete: boolean }
    stocks: { create: boolean; read: boolean; update: boolean; delete: boolean }
    sales: { create: boolean; read: boolean; update: boolean; delete: boolean }
    reports: { create: boolean; read: boolean; update: boolean; delete: boolean }
    suppliers: { create: boolean; read: boolean; update: boolean; delete: boolean }
    categories: { create: boolean; read: boolean; update: boolean; delete: boolean }
  }
}

const initialFormData: RoleFormData = {
  name: "",
  permissions: {
    dashboard: { create: false, read: true, update: false, delete: false },
    products: { create: false, read: true, update: false, delete: false },
    users: { create: false, read: true, update: false, delete: false },
    orders: { create: false, read: true, update: false, delete: false },
    stocks: { create: false, read: true, update: false, delete: false },
    sales: { create: false, read: true, update: false, delete: false },
    reports: { create: false, read: true, update: false, delete: false },
    suppliers: { create: false, read: true, update: false, delete: false },
    categories: { create: false, read: true, update: false, delete: false },
  }
}


export default function RoleDialog() {
  const [formData, setFormData] = useState<RoleFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<RoleFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { addRole, fetchRoles } = useRoleStore()

  const handleInputChange = (field: keyof RoleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePermissionChange = (module: string, permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module as keyof typeof prev.permissions],
          [permission]: checked
        }
      }
    }))
  }

  const areAllPermissionsSelected = () => {
    return moduleNames.every(module => {
      const modulePermissions = formData.permissions[module]
      return modulePermissions.create && modulePermissions.read && 
             modulePermissions.update && modulePermissions.delete
    })
  }

  const handleSelectAllPermissions = (checked: boolean) => {
    const newPermissions = { ...formData.permissions }
    
    moduleNames.forEach(module => {
      newPermissions[module] = {
        create: checked,
        read: checked,
        update: checked,
        delete: checked
      }
    })

    setFormData(prev => ({
      ...prev,
      permissions: newPermissions
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<RoleFormData> = {}
    
    if (!formData.name.trim()) newErrors.name = "The role name is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const result = await apiClient.createRole({
        name: formData.name,
        permissions: formData.permissions
      })

      // Refresh roles list from server
      await fetchRoles()
      
      // Reset form and close dialog
      setFormData(initialFormData)
      setErrors({})
      setIsOpen(false)
    } catch (error) {
      console.error('Error creating role:', error)
      setErrors({ name: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-10">Add Role</Button>
      </DialogTrigger>
      <DialogContent className="p-7 px-8 poppins min-w-6xl min-h-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[22px]">Permissions</DialogTitle>
          <DialogDescription>
            Configure role permissions for different modules.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        
        <div className="flex flex-col gap-4 mt-1">
          {/* Role Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              placeholder="Manager, Viewer, Admin, Super Admin, etc..."
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.name}
              </div>
            )}
          </div>

          {/* Permissions Section */}
          <div className="mt-4">
            <div className="flex items-center gap-3 mb-4">
              <Label className="text-lg font-medium">Permissions</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-permissions"
                  checked={areAllPermissionsSelected()}
                  onCheckedChange={handleSelectAllPermissions}
                />
                <Label htmlFor="select-all-permissions" className="text-sm font-medium">
                  Select All
                </Label>
              </div>
            </div>
            
            {/* Permissions Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Permission</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Create</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Read</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Update</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleNames.map((module, index) => (
                      <tr key={module} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="py-3 px-4 font-medium text-gray-900 capitalize">
                          {module}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            id={`${module}-create`}
                            checked={formData.permissions[module].create}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module, 'create', checked as boolean)
                            }
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            id={`${module}-read`}
                            checked={formData.permissions[module].read}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module, 'read', checked as boolean)
                            }
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            id={`${module}-update`}
                            checked={formData.permissions[module].update}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module, 'update', checked as boolean)
                            }
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            id={`${module}-delete`}
                            checked={formData.permissions[module].delete}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(module, 'delete', checked as boolean)
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-9 mb-4 flex items-center gap-4">
          <DialogClose asChild>
            <Button variant="secondary" className="h-11 px-11">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="h-11 px-11 bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
