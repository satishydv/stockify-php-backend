"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Users, DollarSign, CreditCard, TrendingUp, UserCheck, Receipt } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useSupplierStore } from '@/stores/supplierStore'
import { useProductStore } from '@/stores/productStore'
import { Product } from '@/lib/product-data'
import { Supplier } from '@/lib/supplier-data'

interface VendorReportData {
  totalVendors: number
  totalAmount: number
  totalPaid: number
  totalDues: number
  averageAmountPerVendor: number
  averagePaidAmount: number
  averageCustomersPerVendor: number
}

const VendorReportPage = () => {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [selectedVendor, setSelectedVendor] = useState<string>("all")
  const [reportData, setReportData] = useState<VendorReportData>({
    totalVendors: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalDues: 0,
    averageAmountPerVendor: 0,
    averagePaidAmount: 0,
    averageCustomersPerVendor: 0
  })
  const [loading, setLoading] = useState(false)

  const { suppliers, fetchSuppliers } = useSupplierStore()
  const { products, fetchProducts } = useProductStore()

  // Fetch data on component mount
  useEffect(() => {
    fetchSuppliers()
    fetchProducts()
  }, [fetchSuppliers, fetchProducts])

  // Calculate report data when filters change
  useEffect(() => {
    calculateReportData()
  }, [fromDate, toDate, selectedVendor, products])

  const calculateReportData = () => {
    if (!products || products.length === 0) return

    let filteredProducts = products

    // Filter by date range if provided
    if (fromDate || toDate) {
      filteredProducts = products.filter(product => {
        const productDate = new Date(product.createdAt || '')
        if (fromDate && productDate < fromDate) return false
        if (toDate && productDate > toDate) return false
        return true
      })
    }

    // Filter by vendor if selected
    if (selectedVendor && selectedVendor !== "all") {
      filteredProducts = filteredProducts.filter(product => 
        product.supplier === selectedVendor
      )
    }

    // Get unique vendors from filtered products
    const uniqueVendors = new Set(filteredProducts.map(p => p.supplier).filter(Boolean))
    
    // Calculate totals
    const totalAmount = filteredProducts.reduce((sum, product) => 
      sum + (product.purchase_price * product.quantityInStock), 0
    )
    
    const paidProducts = filteredProducts.filter(p => p.status === 'paid')
    const dueProducts = filteredProducts.filter(p => p.status === 'due')
    
    const totalPaid = paidProducts.reduce((sum, product) => 
      sum + (product.purchase_price * product.quantityInStock), 0
    )
    
    const totalDues = dueProducts.reduce((sum, product) => 
      sum + (product.purchase_price * product.quantityInStock), 0
    )

    // Calculate averages
    const averageAmountPerVendor = uniqueVendors.size > 0 ? totalAmount / uniqueVendors.size : 0
    const averagePaidAmount = uniqueVendors.size > 0 ? totalPaid / uniqueVendors.size : 0
    const averageCustomersPerVendor = uniqueVendors.size > 0 ? filteredProducts.length / uniqueVendors.size : 0

    setReportData({
      totalVendors: uniqueVendors.size,
      totalAmount,
      totalPaid,
      totalDues,
      averageAmountPerVendor,
      averagePaidAmount,
      averageCustomersPerVendor
    })
  }

  const handleApplyFilter = () => {
    calculateReportData()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateRange = () => {
    if (fromDate && toDate) {
      return `${format(fromDate, 'dd/MM/yyyy')} - ${format(toDate, 'dd/MM/yyyy')}`
    } else if (fromDate) {
      return `From ${format(fromDate, 'dd/MM/yyyy')}`
    } else if (toDate) {
      return `Until ${format(toDate, 'dd/MM/yyyy')}`
    }
    return 'All time'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Vendor Report</h1>
        <p className="text-gray-600">View vendor transactions and financial summary for selected date range</p>
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Filters
          </CardTitle>
          <p className="text-sm text-gray-600">Choose the period and vendor for which you want to view transactions</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* From Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "dd/MM/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "dd/MM/yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Vendor Dropdown */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor</label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apply Filter Button */}
            <Button onClick={handleApplyFilter} className="bg-black hover:bg-gray-800">
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Vendors */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalVendors}</p>
                <p className="text-xs text-gray-500">Period: {formatDateRange()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Amount */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totalAmount)}</p>
                <p className="text-xs text-gray-500">Total transaction amount</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Paid */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(reportData.totalPaid)}</p>
                <p className="text-xs text-gray-500">Amount actually paid</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Dues */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dues</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(reportData.totalDues)}</p>
                <p className="text-xs text-gray-500">Outstanding amount</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Amount per Vendor */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Amount per Vendor</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.averageAmountPerVendor)}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Paid Amount */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Paid Amount</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.averagePaidAmount)}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Products per Vendor */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Products per Vendor</p>
                <p className="text-2xl font-bold text-pink-600">{reportData.averageCustomersPerVendor.toFixed(1)}</p>
              </div>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VendorReportPage