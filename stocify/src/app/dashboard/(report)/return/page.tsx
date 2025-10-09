"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, DollarSign, Package, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ReturnItem {
  product_id: string
  product_name: string
  product_sku: string
  return_quantity: number
  unit_price: number
  subtotal: number
}

interface Return {
  id: number
  return_id: string
  original_order_id: string
  customer_name: string
  customer_phone: string
  return_date: string
  total_return_amount: number | string
  items: string // JSON string of ReturnItem[]
  status: 'pending' | 'return' | 'processed' | 'refunded' | 'cancelled'
  return_reason?: string
  created_at: string
  updated_at: string
}

interface ReturnReportData {
  totalReturns: number
  totalReturnAmount: number
  averageReturnAmount: number
}

const ReturnReportPage = () => {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<ReturnReportData>({
    totalReturns: 0,
    totalReturnAmount: 0,
    averageReturnAmount: 0
  })

  // Fetch returns from API
  useEffect(() => {
    fetchReturns()
  }, [])

  // Calculate report data when returns or filters change
  useEffect(() => {
    calculateReportData()
  }, [returns, fromDate, toDate])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/returns`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched returns data:', data.returns)
        setReturns(data.returns || [])
      } else {
        console.error('Failed to fetch returns')
      }
    } catch (error) {
      console.error('Error fetching returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateReportData = () => {
    if (!returns || returns.length === 0) return

    let filteredReturns = returns

    // Filter by date range if provided
    if (fromDate || toDate) {
      filteredReturns = returns.filter(returnItem => {
        const returnDate = new Date(returnItem.return_date)
        if (fromDate && returnDate < fromDate) return false
        if (toDate && returnDate > toDate) return false
        return true
      })
    }

    // Calculate totals
    const totalReturns = filteredReturns.length
    const totalReturnAmount = filteredReturns.reduce((sum, returnItem) => 
      sum + (parseFloat(String(returnItem.total_return_amount)) || 0), 0
    )

    // Calculate averages
    const averageReturnAmount = totalReturns > 0 ? totalReturnAmount / totalReturns : 0

    setReportData({
      totalReturns,
      totalReturnAmount,
      averageReturnAmount
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading return data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Return Report</h1>
        <p className="text-gray-600">View return data for selected date range</p>
      </div>

      {/* Filter Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date Range
          </CardTitle>
          <p className="text-sm text-gray-600">Choose the period for which you want to view return data</p>
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

            {/* Apply Filter Button */}
            <Button onClick={handleApplyFilter} className="bg-black hover:bg-gray-800">
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Return Amount */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Return Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalReturnAmount)}</p>
                <p className="text-xs text-gray-500">Period: {formatDateRange()}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Returns */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.totalReturns}</p>
                <p className="text-xs text-gray-500">Total returns in period</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Return Amount */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Return Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.averageReturnAmount)}</p>
                <p className="text-xs text-gray-500">Amount per return</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}

export default ReturnReportPage
