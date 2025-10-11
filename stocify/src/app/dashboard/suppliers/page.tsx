"use client"

import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SupplierTable } from '@/components/SupplierTable'
import AddSupplierDialog from '@/components/AddSupplierDialog'
import { useSupplierStore } from '@/stores/supplierStore'
import { Download, ChevronDown, FileSpreadsheet, FileText, FileDown } from "lucide-react"
import { useCSVExport } from "@/lib/useCSVExport"
import { useExcelExport } from "@/lib/useExcelExport"
import { usePDFExport } from "@/lib/usePDFExport"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const page = () => {
  const { suppliers, fetchSuppliers, isLoading } = useSupplierStore()
  const { exportToCSV, formatDate } = useCSVExport()
  const { exportToExcel, formatDate: formatDateExcel } = useExcelExport()
  const { exportToPDF, formatDate: formatDatePDF } = usePDFExport()

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  // Define columns for all export formats
  const getExportColumns = () => [
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

  const getExcelColumns = () => [
    { key: 'name', label: 'Supplier Name', width: 25 },
    { key: 'email', label: 'Email', width: 30 },
    { key: 'phone', label: 'Phone', width: 15 },
    { key: 'category', label: 'Category', width: 20 },
    { key: 'status', label: 'Status', width: 15 },
    { key: 'gstin', label: 'GSTIN', width: 20 },
    { key: 'website', label: 'Website', width: 25 },
    { 
      key: 'companyLocation', 
      label: 'Location', 
      formatter: (location: any) => {
        if (!location) return ''
        return `${location.street}, ${location.city}, ${location.state} ${location.zip}, ${location.country}`
      },
      width: 40
    },
    { key: 'createdAt', label: 'Created Date', formatter: formatDateExcel, width: 15 }
  ]

  const getPDFColumns = () => [
    { key: 'name', label: 'Supplier Name', width: 30, align: 'left' as const },
    { key: 'email', label: 'Email', width: 35, align: 'left' as const },
    { key: 'phone', label: 'Phone', width: 20, align: 'center' as const },
    { key: 'category', label: 'Category', width: 25, align: 'left' as const },
    { key: 'status', label: 'Status', width: 20, align: 'center' as const },
    { key: 'gstin', label: 'GSTIN', width: 25, align: 'center' as const },
    { key: 'website', label: 'Website', width: 30, align: 'left' as const },
    { 
      key: 'companyLocation', 
      label: 'Location', 
      formatter: (location: any) => {
        if (!location) return ''
        return `${location.street}, ${location.city}, ${location.state} ${location.zip}, ${location.country}`
      },
      width: 50,
      align: 'left' as const
    },
    { key: 'createdAt', label: 'Created Date', formatter: formatDatePDF, width: 20, align: 'center' as const }
  ]

  const handleExportCSV = () => {
    exportToCSV(suppliers, 'suppliers.csv', getExportColumns())
  }

  const handleExportExcel = () => {
    exportToExcel(suppliers, 'suppliers.xlsx', getExcelColumns(), {
      sheetName: 'Suppliers',
      filename: 'suppliers.xlsx'
    })
  }

  const handleExportPDF = () => {
    exportToPDF(suppliers, 'suppliers.pdf', getPDFColumns(), {
      title: 'Suppliers Report',
      orientation: 'landscape',
      pageSize: 'A4',
      filename: 'suppliers.pdf'
    })
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                  disabled={suppliers.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-600 font-medium">Excel</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  <span className="text-red-600 font-medium">PDF</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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