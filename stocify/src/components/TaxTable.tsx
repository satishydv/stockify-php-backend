"use client"

import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { useTaxStore, Tax } from '@/stores/taxStore'
import { toast } from 'sonner'

interface TaxTableProps {
  onEdit: (tax: Tax) => void
}

export const TaxTable: React.FC<TaxTableProps> = ({ onEdit }) => {
  const { taxes, deleteTax, toggleTaxStatus } = useTaxStore()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tax?')) {
      setDeletingId(id)
      const success = await deleteTax(id)
      setDeletingId(null)
      
      if (success) {
        toast.success('Tax deleted successfully')
      } else {
        toast.error('Failed to delete tax')
      }
    }
  }

  const handleStatusToggle = async (id: number, currentStatus: 'enable' | 'disable') => {
    const newStatus = currentStatus === 'enable' ? 'disable' : 'enable'
    const success = await toggleTaxStatus(id, newStatus)
    
    if (success) {
      if (newStatus === 'enable') {
        toast.success('Tax enabled successfully. All other taxes have been disabled.')
      } else {
        toast.success('Tax disabled successfully')
      }
    } else {
      toast.error('Failed to update tax status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tax Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {taxes.length === 0 ? (
            <TableRow key="no-taxes">
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No taxes found. Add your first tax to get started.
              </TableCell>
            </TableRow>
          ) : (
            taxes.map((tax) => (
              <TableRow key={tax.id}>
                <TableCell className="font-medium">{tax.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{tax.code}</Badge>
                </TableCell>
                <TableCell className="font-mono">{tax.rate}%</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={tax.status === 'enable'}
                      onCheckedChange={() => handleStatusToggle(tax.id, tax.status)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {tax.status === 'enable' ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(tax.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(tax)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(tax.id)}
                        disabled={deletingId === tax.id}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === tax.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
