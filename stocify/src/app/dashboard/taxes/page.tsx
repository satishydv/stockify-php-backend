"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaxTable } from '@/components/TaxTable'
import TaxDialog from '@/components/TaxDialog'
import { useTaxStore, Tax } from '@/stores/taxStore'

const page = () => {
  const { taxes, fetchTaxes, loading } = useTaxStore()
  const [editTax, setEditTax] = useState<Tax | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchTaxes()
  }, [fetchTaxes])

  const handleEdit = (tax: Tax) => {
    setEditTax(tax)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setEditTax(null)
    setDialogOpen(false)
  }

  return (
    <Card className="mt-1 flex flex-col shadow-none poppins border-none">
      <CardHeader className="flex justify-between p-2">
        <div className="flex justify-between items-center">
          <div className="">
            <CardTitle className="font-bold text-[23px]">Tax Management</CardTitle>
            <p className="text-sm text-slate-600">{taxes.length} taxes configured</p>
          </div>
        </div>
        <TaxDialog />
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
