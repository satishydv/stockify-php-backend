"use client"

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SupplierTable } from '@/components/SupplierTable'
import AddSupplierDialog from '@/components/AddSupplierDialog'
import { useSupplierStore } from '@/stores/supplierStore'
import { Download } from "lucide-react"
import { useCSVExport } from "@/lib/useCSVExport"

const page = () => {
  const { suppliers, fetchSuppliers, isLoading } = useSupplierStore()
  const { exportToCSV, formatDate } = useCSVExport()

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const handleExportCSV = () => {
    const csvColumns = [
      { key: 'name', label: 'Supplier Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'gstin', label: 'GSTIN' },
      { key: 'website', label: 'Website' },
      { 
        key: 'companyLocation', 
        label: 'Location', 
        formatter: (location: any) => {
          if (!location) return ''
          return `${location.street}, ${location.city}, ${location.state} ${location.zip}, ${location.country}`
        }
      },
      { key: 'createdAt', label: 'Created Date', formatter: formatDate }
    ]

    exportToCSV(suppliers, 'suppliers.csv', csvColumns)
  }

  return (
    <Card className="mt-1 flex flex-col shadow-none poppins border-none">
      <CardHeader className="flex justify-between p-2">
        <div className="flex justify-between items-center w-full">
          <div className="">
            <CardTitle className="font-bold text-[23px]">Suppliers</CardTitle>
            <p className="text-sm text-slate-600">{suppliers.length} suppliers</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleExportCSV}
              className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
              disabled={suppliers.length === 0}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <AddSupplierDialog />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">Loading suppliers...</div>
          </div>
        ) : (
          <SupplierTable />
        )}
      </CardContent>
    </Card>
  )
}

export default page