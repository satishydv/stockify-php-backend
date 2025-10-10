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
import { Download, Printer } from "lucide-react"
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

  const handlePrintReturn = (ret: Return) => {
    const items: ReturnItem[] = (() => {
      try { return JSON.parse(ret.items || '[]') as ReturnItem[] } catch { return [] }
    })()

    const formatINR = (v: number | string) => `₹${(parseFloat(String(v)) || 0).toFixed(2)}`
    const dateStr = new Date(ret.return_date).toISOString()
    const dateDisplay = new Date(ret.return_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const rowsHtml = items.map(it => `
      <tr>
        <td>${it.product_name} <span style="color:#6B7280">(${it.product_sku})</span></td>
        <td class="right">${it.return_quantity}</td>
        <td class="right">${formatINR(it.unit_price)}</td>
        <td class="right">${formatINR(it.subtotal)}</td>
      </tr>
    `).join('')

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Return Bill - ${ret.return_id}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, Helvetica, sans-serif; margin: 20px; color: #333; }
      .header { display:flex; align-items:center; justify-content:space-between; margin-bottom: 20px; border-bottom:2px solid #333; padding-bottom:10px; }
      .title { font-size: 24px; font-weight: 700; }
      .meta { color:#666; font-size: 14px; }
      .grid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
      .card { border:1px solid #ddd; border-radius:8px; padding:16px; }
      table { width:100%; border-collapse:collapse; margin-top: 12px; }
      th, td { padding: 10px; border-bottom:1px solid #e5e7eb; font-size: 14px; }
      th { background:#f5f5f5; text-align:left; }
      .right { text-align:right; }
      .totals { display:flex; justify-content:flex-end; margin-top: 12px; }
      .totals .box { min-width: 300px; }
      .total-row { font-weight: bold; }
      @media print { .no-print { display:none; } body { margin:0; } }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="title">RETURN BILL</div>
      <div class="meta">Generated: ${new Date(dateStr).toLocaleDateString('en-GB')}</div>
    </div>
    <div class="card">
      <div class="grid">
        <div>
          <div><strong>Return ID:</strong> #${ret.return_id}</div>
          <div class="meta">Date: ${dateDisplay}</div>
        </div>
        <div>
          <div><strong>Customer:</strong> ${ret.customer_name || '-'}</div>
          <div class="meta">Phone: ${ret.customer_phone || '-'}</div>
        </div>
        <div>
          <div><strong>Original Order:</strong> #${ret.original_order_id || '-'}</div>
          <div class="meta">Status: ${ret.status || '-'}</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="right">Qty</th>
            <th class="right">Unit Price</th>
            <th class="right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      <div class="totals">
        <div class="box">
          <table>
            <tbody>
              <tr>
                <td><strong>Total Return Amount</strong></td>
                <td class="right total-row">${formatINR(ret.total_return_amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="no-print" style="text-align:right; margin-top:12px;">
        <button onclick="window.print()" style="padding:8px 12px; background:#111827; color:#fff; border:none; border-radius:6px;">Print</button>
      </div>
    </div>
  </body>
</html>`

    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.left = '-9999px'
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) { document.body.removeChild(iframe); return }
    doc.open(); doc.write(html); doc.close()
    iframe.onload = () => {
      setTimeout(() => {
        try { iframe.contentWindow?.print() } finally { setTimeout(() => document.body.removeChild(iframe), 500) }
      }, 300)
    }
  }

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
                  <TableHead>Print</TableHead>
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
                    <TableCell>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePrintReturn(returnItem)}
                        className="h-8 text-xs"
                      >
                        <Printer className="w-4 h-4 mr-1" /> Print
                      </Button>
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
