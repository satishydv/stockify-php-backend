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
import { useBranchStore } from "@/stores/branchStore"

interface BranchFormData {
  name: string
  address: string
  phone: string
  status: string
}

const initialFormData: BranchFormData = {
  name: "",
  address: "",
  phone: "",
  status: "active"
}

export default function BranchDialog() {
  const [formData, setFormData] = useState<BranchFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<BranchFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addBranch = useBranchStore((state) => state.addBranch)

  const handleInputChange = (field: keyof BranchFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<BranchFormData> = {}
    
    if (!formData.name.trim()) newErrors.name = "The branch name is required"
    if (!formData.address.trim()) newErrors.address = "The address is required"
    if (!formData.phone.trim()) newErrors.phone = "The phone number is required"
    
    // Basic phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (formData.phone.trim() && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        await addBranch({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          status: formData.status as 'active' | 'inactive'
        })
        
        // Reset form after successful submission
        setFormData(initialFormData)
        setErrors({})
        
        // Close dialog (you might want to add a callback prop for this)
        window.location.reload() // Temporary solution to refresh the page
      } catch (error) {
        console.error('Error creating branch:', error)
        setErrors({ submit: 'Failed to create branch. Please try again.' })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-10">Add Branch</Button>
      </DialogTrigger>
      <DialogContent className="p-7 px-8 poppins min-w-4xl min-h-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[22px]">Add Branch</DialogTitle>
          <DialogDescription>
            Fill in the form to add a new branch.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        
        <div className="flex flex-col gap-4 mt-1">
          {/* Branch Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="branch-name">Branch Name</Label>
            <div className="relative">
              <Input
                id="branch-name"
                placeholder="Main Branch, Downtown Branch..."
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-8 w-8 p-0"
              >
                🏢
              </Button>
            </div>
            {errors.name && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.name}
              </div>
            )}
          </div>

          {/* Address */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              placeholder="Enter complete address..."
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.address ? "border-red-500" : ""}`}
              rows={3}
            />
            {errors.address && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                {errors.address}
              </div>
            )}
          </div>

          {/* Phone and Status */}
          <div className="grid grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.phone}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-9 mb-4 flex items-center gap-4">
          <DialogClose asChild>
            <Button variant="secondary" className="h-11 px-11" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            className="h-11 px-11 bg-red-600 hover:bg-red-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Branch'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
