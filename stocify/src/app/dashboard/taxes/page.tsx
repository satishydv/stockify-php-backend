"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TaxTable } from '@/components/TaxTable'
import TaxDialog from '@/components/TaxDialog'
import { useTaxStore, Tax } from '@/stores/taxStore'
import { toast } from 'sonner'

const page = () => {
  const { taxes, fetchTaxes, loading, bulkUpdateStatus } = useTaxStore()
  const [editTax, setEditTax] = useState<Tax | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [allTaxesEnabled, setAllTaxesEnabled] = useState(true)

  useEffect(() => {
    fetchTaxes()
  }, [fetchTaxes])

  // Update global toggle state when taxes change
  useEffect(() => {
    if (taxes.length > 0) {
      const allEnabled = taxes.every(tax => tax.status === 'enable')
      setAllTaxesEnabled(allEnabled)
    }
  }, [taxes])

  const handleEdit = (tax: Tax) => {
    setEditTax(tax)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setEditTax(null)
    setDialogOpen(false)
  }

  const handleGlobalToggle = async (checked: boolean) => {
    const newStatus = checked ? 'enable' : 'disable'
    const success = await bulkUpdateStatus(newStatus)
    
    if (success) {
      setAllTaxesEnabled(checked)
      toast.success(`All taxes ${checked ? 'enabled' : 'disabled'} successfully`)
    } else {
      toast.error('Failed to update tax statuses')
    }
  }

  return (
    <Card className="mt-1 flex flex-col shadow-none poppins border-none">
      <CardHeader className="flex justify-between p-2">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center space-x-6">
            <div className="">
              <CardTitle className="font-bold text-[23px]">Tax Management</CardTitle>
              <p className="text-sm text-slate-600">{taxes.length} taxes configured</p>
            </div>
            <div className="flex items-center space-x-3">
              <Label htmlFor="global-toggle" className="text-sm font-medium">
                Enable All Taxes
              </Label>
              <Switch
                id="global-toggle"
                checked={allTaxesEnabled}
                onCheckedChange={handleGlobalToggle}
                disabled={loading || taxes.length === 0}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Default Tax Mode: <span className="font-medium">Individual</span>
            </div>
            <TaxDialog />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TaxTable onEdit={handleEdit} />
      </CardContent>
      
      {/* Edit Dialog */}
      {editTax && (
        <TaxDialog 
          editTax={editTax} 
          onClose={handleDialogClose}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </Card>
  )
}

export default page
