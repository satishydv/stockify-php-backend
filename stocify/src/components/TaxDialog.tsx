"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useTaxStore, Tax } from '@/stores/taxStore'
import { toast } from 'sonner'

interface TaxDialogProps {
  editTax?: Tax | null
  onClose?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const TaxDialog: React.FC<TaxDialogProps> = ({ editTax, onClose, open: externalOpen, onOpenChange }) => {
  const { createTax, updateTax } = useTaxStore()
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Use external open state if provided, otherwise use internal state
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    rate: '',
    status: 'disable' as 'enable' | 'disable'
  })

  useEffect(() => {
    if (editTax) {
      setFormData({
        name: editTax.name,
        code: editTax.code,
        rate: editTax.rate.toString(),
        status: editTax.status
      })
    } else {
      setFormData({
        name: '',
        code: '',
        rate: '',
        status: 'disable'
      })
    }
  }, [editTax])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.code.trim() || !formData.rate.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const rate = parseFloat(formData.rate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error('Please enter a valid rate between 0 and 100')
      return
    }

    setLoading(true)

    try {
      const taxData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        rate: rate,
        status: formData.status
      }

      let success = false
      if (editTax) {
        success = await updateTax(editTax.id, taxData)
        if (success) {
          toast.success('Tax updated successfully')
        }
      } else {
        success = await createTax(taxData)
        if (success) {
          toast.success('Tax created successfully')
        }
      }

      if (success) {
        setOpen(false)
        setFormData({
          name: '',
          code: '',
          rate: '',
          status: 'disable'
        })
        onClose?.()
      }
    } catch (error) {
      toast.error('An error occurred while saving the tax')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      onClose?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add New Tax
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editTax ? 'Edit Tax' : 'Add New Tax'}
          </DialogTitle>
          <DialogDescription>
            {editTax ? 'Update the tax information below.' : 'Fill in the details to create a new tax.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tax Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., GST, VAT, Sales Tax"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Tax Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., GST, VAT, ST"
              required
              maxLength={10}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rate">Tax Rate (%) *</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
              placeholder="e.g., 18.00"
              required
            />
          </div>
          
          {/* Status dropdown commented out - default status is now 'disable' */}
          {/* <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'enable' | 'disable') => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enable">Enable</SelectItem>
                <SelectItem value="disable">Disable</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editTax ? 'Update Tax' : 'Create Tax')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TaxDialog
