"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download } from "lucide-react"
import { useCSVExport } from "@/lib/useCSVExport"

interface ReturnItem {
  product_id: number
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
  status: string
  return_reason?: string
  created_at: string
  updated_at: string
}

const ReturnOrderPage = () => {
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const { exportToCSV, formatCurrency, formatDate } = useCSVExport()

  // Fetch returns from API
  useEffect(() => {
    fetchReturns()
  }, [])

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


  const formatCurrencyDisplay = (value: number | string) => `₹${(parseFloat(String(value)) || 0).toFixed(2)}`

  const handleExportCSV = () => {
    const csvColumns = [
      { key: 'return_id', label: 'Return ID' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'customer_phone', label: 'Phone No' },
      { key: 'return_date', label: 'Date', formatter: formatDate },
      { key: 'total_return_amount', label: 'Return Amount', formatter: formatCurrency },
      { key: 'original_order_id', label: 'Original Order ID' }
    ]

    exportToCSV(returns, 'returns.csv', csvColumns)
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading returns...</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="mt-1 flex flex-col shadow-none poppins border-none">
      <CardHeader className="flex justify-between p-2">
        <div className="flex justify-between items-center w-full">
          <div className="">
            <CardTitle className="font-bold text-[23px]">Returns</CardTitle>
            <p className="text-sm text-slate-600">{returns.length} total returns</p>
          </div>
          <Button 
            onClick={handleExportCSV}
            className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
            disabled={returns.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {returns.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">No returns found</div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Return Amount</TableHead>
                  <TableHead>Original Order ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((returnItem) => (
                  <TableRow key={returnItem.id}>
                    <TableCell className="font-medium">#{returnItem.return_id}</TableCell>
                    <TableCell>{returnItem.customer_name}</TableCell>
                    <TableCell>{returnItem.customer_phone}</TableCell>
                    <TableCell>
                      {new Date(returnItem.return_date).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrencyDisplay(returnItem.total_return_amount)}
                    </TableCell>
                    <TableCell className="font-medium">
                      #{returnItem.original_order_id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

    </Card>
  )
}


export default ReturnOrderPage
