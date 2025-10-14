"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Printer, 
  FileText,
  ChevronDown,
  Calendar,
  User,
  CreditCard,
  Package,
  Edit,
  Plus,
  Minus,
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProductStore } from "@/stores/productStore"
import { Product } from "@/lib/product-data"
import { useCSVExport } from "@/lib/useCSVExport"
import { useExcelExport } from "@/lib/useExcelExport"
import { usePDFExport } from "@/lib/usePDFExport"

interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: number | string
  subtotal: number | string
}

interface Order {
  id: string
  order_number: number
  customer_name: string
  mobile_no: string
  order_date: string
  subtotal: number | string
  tax_rate: number | string
  tax_amount: number | string
  total_amount: number | string
  status: string
  payment_method: string
  transaction_id?: string
  payment_attachment?: string
  payment_date?: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

const page = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("new")
  const { exportToCSV, formatCurrency, formatDate, formatStatus } = useCSVExport()
  const { exportToExcel, formatCurrency: formatCurrencyExcel, formatDate: formatDateExcel, formatStatus: formatStatusExcel } = useExcelExport()
  const { exportToPDF, formatCurrency: formatCurrencyPDF, formatDate: formatDatePDF, formatStatus: formatStatusPDF } = usePDFExport()
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [returningOrder, setReturningOrder] = useState<Order | null>(null)
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [returnItems, setReturnItems] = useState<OrderItem[]>([])
  const [returnCustomerData, setReturnCustomerData] = useState<{
    customer_name: string
    customer_phone: string
    return_date: string
    payment_method: string
  }>({
    customer_name: '',
    customer_phone: '',
    return_date: new Date().toISOString().split('T')[0],
    payment_method: ''
  })

  // Fetch orders from API
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/orders`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched orders data:', data.orders)
        // Debug: Check if order items have product_id
        if (data.orders && data.orders.length > 0) {
          console.log('First order items:', data.orders[0].items)
        }
        setOrders(data.orders || [])
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/orders/delete/${orderId}`, { method: 'POST' })
        
        if (response.ok) {
          setOrders(orders.filter(order => order.id !== orderId))
          alert('Order deleted successfully!')
        } else {
          const errText = await response.text()
          alert('Failed to delete order: ' + errText)
        }
      } catch (error) {
        console.error('Error deleting order:', error)
        alert('Error deleting order')
      }
    }
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setIsEditDialogOpen(true)
  }

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/index.php/api/orders/update/${updatedOrder.id}`
      console.groupCollapsed('[Orders] Update order')
      console.log('URL:', url)
      console.log('Payload:', updatedOrder)
      console.log('Order items:', updatedOrder.items)
      console.log('First item details:', updatedOrder.items?.[0])

      // Ensure every item has a valid product_id before sending
      const normalizedItems = (updatedOrder.items as any[]).map((it) => ({
        ...it,
        product_id: it?.product_id ? parseInt(String(it.product_id), 10) : 0,
      }))
      const missing = normalizedItems.find((it) => !it.product_id || Number(it.product_id) <= 0)
      if (missing) {
        alert('Each order item must have a valid product_id. Please fix the items and try again.')
        console.warn('Invalid item without product_id:', missing)
        console.groupEnd()
        return
      }

      const payload = { ...updatedOrder, items: normalizedItems }
      console.log('Final payload to send:', payload)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      console.log('Status:', response.status)
      console.log('OK:', response.ok)

      if (response.ok) {
        // Update the order in the local state
        setOrders(orders.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        ))
        setIsEditDialogOpen(false)
        setEditingOrder(null)
        alert('Order updated successfully!')
      } else {
        let errorMessage = 'Failed to update order'
        try {
          const cloned = response.clone()
          const errorData = await cloned.json()
          console.warn('Error JSON:', errorData)
          errorMessage = errorData.message || errorMessage
          if (errorData.debug) {
            console.error('Debug info:', errorData.debug)
          }
        } catch (jsonError) {
          try {
            const textResponse = await response.text()
            console.warn('Error Text:', textResponse)
            errorMessage = textResponse || errorMessage
          } catch (e) {
            console.error('Failed to read error response body', e)
          }
        }
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order')
    } finally {
      console.groupEnd()
    }
  }

  const formatCurrencyDisplay = (value: number | string) => `₹${(parseFloat(String(value)) || 0).toFixed(2)}`

  // Define columns for all export formats
  const getExportColumns = () => [
    { key: 'order_number', label: 'Order #' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'mobile_no', label: 'Mobile Number' },
    { key: 'order_date', label: 'Order Date', formatter: formatDate },
    { key: 'status', label: 'Status', formatter: formatStatus },
    { key: 'payment_method', label: 'Payment Method' },
    { key: 'subtotal', label: 'Subtotal', formatter: formatCurrency },
    { key: 'tax_amount', label: 'Tax Amount', formatter: formatCurrency },
    { key: 'total_amount', label: 'Total Amount', formatter: formatCurrency },
    { key: 'transaction_id', label: 'Transaction ID' },
    { key: 'created_at', label: 'Created Date', formatter: formatDate }
  ]

  const getExcelColumns = () => [
    { key: 'order_number', label: 'Order #', width: 15 },
    { key: 'customer_name', label: 'Customer Name', width: 25 },
    { key: 'mobile_no', label: 'Mobile Number', width: 15 },
    { key: 'order_date', label: 'Order Date', formatter: formatDateExcel, width: 15 },
    { key: 'status', label: 'Status', formatter: formatStatusExcel, width: 15 },
    { key: 'payment_method', label: 'Payment Method', width: 20 },
    { key: 'subtotal', label: 'Subtotal', formatter: formatCurrencyExcel, width: 15 },
    { key: 'tax_amount', label: 'Tax Amount', formatter: formatCurrencyExcel, width: 15 },
    { key: 'total_amount', label: 'Total Amount', formatter: formatCurrencyExcel, width: 15 },
    { key: 'transaction_id', label: 'Transaction ID', width: 20 },
    { key: 'created_at', label: 'Created Date', formatter: formatDateExcel, width: 15 }
  ]

  const getPDFColumns = () => [
    { key: 'order_number', label: 'Order #', width: 20, align: 'center' as const },
    { key: 'customer_name', label: 'Customer Name', width: 30, align: 'left' as const },
    { key: 'mobile_no', label: 'Mobile Number', width: 20, align: 'center' as const },
    { key: 'order_date', label: 'Order Date', formatter: formatDatePDF, width: 20, align: 'center' as const },
    { key: 'status', label: 'Status', formatter: formatStatusPDF, width: 20, align: 'center' as const },
    { key: 'payment_method', label: 'Payment Method', width: 25, align: 'center' as const },
    { key: 'subtotal', label: 'Subtotal', formatter: formatCurrencyPDF, width: 20, align: 'right' as const },
    { key: 'tax_amount', label: 'Tax Amount', formatter: formatCurrencyPDF, width: 20, align: 'right' as const },
    { key: 'total_amount', label: 'Total Amount', formatter: formatCurrencyPDF, width: 20, align: 'right' as const },
    { key: 'transaction_id', label: 'Transaction ID', width: 25, align: 'center' as const },
    { key: 'created_at', label: 'Created Date', formatter: formatDatePDF, width: 20, align: 'center' as const }
  ]

  const handleExportCSV = () => {
    exportToCSV(sortedOrders, 'orders.csv', getExportColumns())
  }

  const handleExportExcel = () => {
    exportToExcel(sortedOrders, 'orders.xlsx', getExcelColumns(), {
      sheetName: 'Orders',
      filename: 'orders.xlsx'
    })
  }

  const handleExportPDF = () => {
    exportToPDF(sortedOrders, 'orders.pdf', getPDFColumns(), {
      title: 'Orders Report',
      orientation: 'landscape',
      pageSize: 'A4',
      filename: 'orders.pdf'
    })
  }

  const handlePrint = async (order: Order) => {
    const orderDate = new Date(order.order_date).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    })

    // Fetch company settings (name, phone, email, address, logo)
    let company: { company_name?: string; phone?: string; email?: string; address?: string; logo_path?: string } = {}
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/settings`)
      if (res.ok) {
        const data = await res.json()
        company = data?.settings || {}
      }
    } catch (_) {}

    const companyName = company.company_name || 'Company'
    const companyPhone = company.phone || ''
    const companyEmail = company.email || ''
    const companyAddress = company.address || ''
    const logoUrl = company.logo_path ? `${process.env.NEXT_PUBLIC_API_URL}/public/${company.logo_path}` : ''
    const headerUrl = company.header_image_path ? `${process.env.NEXT_PUBLIC_API_URL}/public/${company.header_image_path}` : ''
    const footerUrl = company.footer_image_path ? `${process.env.NEXT_PUBLIC_API_URL}/public/${company.footer_image_path}` : ''

    const itemsRows = order.items.map((it, idx) => `
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${idx + 1}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;">${it.product_name}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${it.product_sku}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${it.quantity}</td>
                        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrencyDisplay(it.unit_price)}</td>
                        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatCurrencyDisplay(it.subtotal)}</td>
      </tr>
    `).join('')

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Order ${order.id} - Print</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; margin: 24px; color: #111827; }
          .header-img, .footer-img { width: 100%; max-height: 160px; object-fit: contain; }
          .footer { margin-top: 16px; }
          .header { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items:flex-start; margin-bottom:16px; }
          .header-without-company { display:flex; justify-content:flex-end; margin-bottom:16px; }
          .title { font-size:22px; font-weight:700; color:#111827; }
          .muted { color:#6b7280; font-size:12px; }
          .stack-y > * { margin: 10px 0; }
          .section { border:1px solid #e5e7eb; border-radius:8px; padding:12px; margin-bottom:12px; }
          .grid { display:grid; grid-template-columns: 1fr 1fr; gap:8px 16px; }
          table { width:100%; border-collapse: collapse; margin-top:8px; }
          th { text-align:left; background:#f9fafb; }
          th, td { font-size:12px; }
          .totals { margin-top:12px; width:280px; margin-left:auto; }
          .totals-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; }
          .bold { font-weight:700; }
          @media print { .no-print { display:none; } }
        </style>
      </head>
      <body>
        ${headerUrl ? `<img class="header-img" src="${headerUrl}" alt="Header" />` : ''}
        <div class="${headerUrl ? 'header-without-company' : 'header'}">
          ${headerUrl ? '' : `
          <div>
            ${logoUrl ? `<img src="${logoUrl}" alt="logo" style="height:56px; object-fit:contain;" />` : ''}
            <div class="title" style="margin-top:6px;">${companyName}</div>
            <div class="muted" style="margin-top:4px;">${companyEmail || ''}</div>
            <div class="muted">${companyPhone || ''}</div>
            <div class="muted">${companyAddress || ''}</div>
          </div>
          `}
          <div style="text-align:right" class="stack-y">
            <div class="title">Invoice</div>
            <div class="muted">Invoice no.: <span style="color:#111827; font-weight:600;">${order.order_number}</span></div>
            <div class="muted">Invoice date: <span style="color:#111827; font-weight:600;">${orderDate}</span></div>
            <div class="muted">Payment method: <span style="text-transform:capitalize; color:#111827; font-weight:600;">${order.payment_method}</span></div>
            <div class="muted">Customer: <span style="color:#111827; font-weight:600;">${order.customer_name}</span></div>
            <div class="muted">Mobile: <span style="color:#111827; font-weight:600;">${order.mobile_no || '-'}</span></div>
          </div>
        </div>

        

        <div class="section">
          <div style="font-weight:600; margin-bottom:8px;">Order Items</div>
          <table>
            <thead>
              <tr>
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:center;">#</th>
                <th style="padding:8px;border:1px solid #e5e7eb;">Product</th>
                <th style="padding:8px;border:1px solid #e5e7eb;">SKU</th>
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Qty</th>
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Price</th>
                <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row"><span>Subtotal</span><span>${formatCurrencyDisplay(order.subtotal)}</span></div>
            <div class="totals-row"><span>Tax (${parseFloat(String(order.tax_rate)) || 0}% )</span><span>${formatCurrencyDisplay(order.tax_amount)}</span></div>
            <div class="totals-row bold"><span>Grand Total</span><span>${formatCurrencyDisplay(order.total_amount)}</span></div>
          </div>
        </div>

        ${footerUrl ? `<div class="footer"><img class="footer-img" src="${footerUrl}" alt="Footer" /></div>` : ''}
        <div class="no-print" style="margin-top:16px; text-align:right;">
          <button onclick="window.print()" style="padding:8px 12px; background:#2563eb; color:white; border:none; border-radius:6px;">Print</button>
        </div>
      </body>
    </html>`

    const w = window.open('', '_blank', 'width=900,height=1000')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
    w.focus()
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingOrder(null)
  }

  const handleReturnOrder = (order: Order) => {
    setReturningOrder(order)
    setReturnItems([...order.items])
    setReturnCustomerData({
      customer_name: order.customer_name,
      customer_phone: order.mobile_no,
      return_date: new Date().toISOString().split('T')[0],
      payment_method: order.payment_method
    })
    setIsReturnDialogOpen(true)
  }

  const handleCloseReturnDialog = () => {
    setIsReturnDialogOpen(false)
    setReturningOrder(null)
    setReturnItems([])
    setReturnCustomerData({
      customer_name: '',
      customer_phone: '',
      return_date: new Date().toISOString().split('T')[0],
      payment_method: ''
    })
  }

  const handleReturnItemChange = (itemId: number, field: keyof OrderItem, value: any) => {
    setReturnItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    )
  }

  const handleRemoveReturnItem = (itemId: number) => {
    setReturnItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  const handleReturnCustomerDataChange = (field: string, value: string) => {
    setReturnCustomerData(prev => ({ ...prev, [field]: value }))
  }

  const handleProcessReturn = async () => {
    if (!returningOrder) return

    try {
      // Filter items that have return quantity > 0
      const itemsToReturn = returnItems.filter(item => item.quantity > 0)
      
      if (itemsToReturn.length === 0) {
        alert('Please select items to return')
        return
      }

      // Calculate return amounts
      const returnSubtotal = itemsToReturn.reduce((sum, item) => {
        return sum + (parseFloat(String(item.unit_price)) * item.quantity)
      }, 0)
      
      // Calculate tax for return (using original order's tax rate)
      const originalTaxRate = parseFloat(String(returningOrder.tax_rate)) || 0
      const returnTaxAmount = (returnSubtotal * originalTaxRate) / 100
      const totalReturnAmount = returnSubtotal + returnTaxAmount

      // Prepare return data
      const returnData = {
        original_order_id: returningOrder.id,
        customer_name: returnCustomerData.customer_name,
        customer_phone: returnCustomerData.customer_phone,
        return_date: returnCustomerData.return_date,
        payment_method: returnCustomerData.payment_method,
        total_return_amount: totalReturnAmount.toFixed(2),
        items: itemsToReturn.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          return_quantity: item.quantity,
          unit_price: parseFloat(String(item.unit_price)),
          subtotal: parseFloat(String(item.unit_price)) * item.quantity
        })),
        return_reason: 'Customer return request'
      }

      console.log('Sending return data:', returnData)
      console.log('Payment method being sent:', returnData.payment_method)

      // Prepare form data
      const formData = new URLSearchParams({
        ...returnData,
        items: JSON.stringify(returnData.items)
      })
      
      console.log('Form data being sent:', formData.toString())

      // Call API to create return
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/returns/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      })

      const result = await response.json()
      console.log('Return API response:', result)

      if (result.success) {
        alert(`Return processed successfully! Return ID: ${result.return_id}`)
        handleCloseReturnDialog()
        // Optionally refresh the orders list
        fetchOrders()
      } else {
        alert(`Error: ${result.message}`)
      }
      
    } catch (error) {
      console.error('Error processing return:', error)
      alert('Error processing return')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'partial_paid': { label: 'Partial Paid', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'paid': { label: 'Paid', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      'due': { label: 'Due', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['partial_paid']
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'upi':
        return <CreditCard className="h-4 w-4" />
      case 'card':
        return <CreditCard className="h-4 w-4" />
      case 'cash':
        return <CreditCard className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number.toString().includes(searchTerm.toLowerCase()) ||
                         order.status.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'new':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'old':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'amount_high':
        return (parseFloat(String(b.total_amount)) || 0) - (parseFloat(String(a.total_amount)) || 0)
      case 'amount_low':
        return (parseFloat(String(a.total_amount)) || 0) - (parseFloat(String(b.total_amount)) || 0)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-orange-500">Orders</h1>
        <p className="text-gray-600 mt-2">{orders.length} total orders</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by order #, name, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('partial_paid')}>Partial Paid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('paid')}>Paid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('due')}>Due</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Sort By: {sortBy === 'new' ? 'New Order' : sortBy === 'old' ? 'Old Order' : sortBy === 'amount_high' ? 'Amount High' : 'Amount Low'}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('new')}>New Order</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('old')}>Old Order</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('amount_high')}>Amount High</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('amount_low')}>Amount Low</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2"
                disabled={sortedOrders.length === 0}
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
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {sortedOrders.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-gray-500">No orders found</p>
      </CardContent>
          </Card>
        ) : (
          sortedOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Order Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-blue-50 dark:bg-gray-800 border-b">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-500" />
                        <span className="text-sm font-medium text-orange-500">Customer: {order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3 w-3 text-blue-500" />
                        <span>Date of Order: {new Date(order.order_date).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">Order #: {order.order_number}</p>
                  </div>
                </div>

                {/* Order Details - Compact Horizontal Layout */}
                <div className="p-3">
                  <div className="flex items-center gap-6">
                    {/* Product Section */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-200 rounded flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-orange-500">{order.items[0]?.product_name}</p>
                        <p className="text-xs text-gray-500">
                          SKU: {order.items[0]?.product_sku} | Qty: {order.items[0]?.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          Price: ₹{(parseFloat(String(order.items[0]?.unit_price)) || 0).toFixed(2)} | Total: ₹{(parseFloat(String(order.items[0]?.subtotal)) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Return Button Section */}
                    <div className="text-center min-w-[100px]">
                      <Button
                        onClick={() => handleReturnOrder(order)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Return
                      </Button>
                    </div>

                    {/* Price Section */}
                    <div className="text-center min-w-[80px]">
                      <p className="text-lg font-bold">₹{(parseFloat(String(order.total_amount)) || 0).toFixed(2)}</p>
                      {(parseFloat(String(order.tax_amount)) || 0) > 0 && (
                        <p className="text-xs text-gray-500">
                          Tax: ₹{(parseFloat(String(order.tax_amount)) || 0).toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Payment Section */}
                    <div className="text-center min-w-[100px]">
                      <div className="flex items-center justify-center gap-1">
                        {getPaymentMethodIcon(order.payment_method)}
                        <span className="text-sm capitalize">{order.payment_method}</span>
                      </div>
                    </div>

                    {/* Edit Section */}
                    <div className="text-center min-w-[120px]">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditOrder(order)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-3 w-3" />
                        Edit Order
                      </Button>
                    </div>

                    {/* Action Section */}
                    <div className="flex flex-col gap-2 min-w-[120px]">
                      <Button size="sm" variant="outline" onClick={() => handlePrint(order)} className="flex items-center gap-1 text-xs h-7 bg-blue-500 text-white">
                        <Printer className="h-3 w-3" />
                        Print Label
                      </Button>
                      {/* <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="flex items-center gap-1 text-xs h-7"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete Order
                      </Button> */}
                    </div>
                  </div>
                </div>
              </CardContent>
    </Card>
          ))
        )}
      </div>

      {/* Edit Order Dialog */}
      <EditOrderDialog 
        order={editingOrder}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleUpdateOrder}
      />

      {/* Return Order Dialog */}
      <ReturnOrderDialog 
        order={returningOrder}
        isOpen={isReturnDialogOpen}
        onClose={handleCloseReturnDialog}
        onProcessReturn={handleProcessReturn}
        returnItems={returnItems}
        onReturnItemChange={handleReturnItemChange}
        onRemoveReturnItem={handleRemoveReturnItem}
        returnCustomerData={returnCustomerData}
        onReturnCustomerDataChange={handleReturnCustomerDataChange}
      />
    </div>
  )
}

// Edit Order Dialog Component
interface EditOrderDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onSave: (order: Order) => void
}

const EditOrderDialog: React.FC<EditOrderDialogProps> = ({ order, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Order | null>(null)
  const { products, fetchProducts } = useProductStore()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (order) {
      setFormData({ ...order })
    }
  }, [order])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleInputChange = (field: keyof Order, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value })
    }
  }

  const handleItemChange = (itemId: number, field: keyof OrderItem, value: any) => {
    if (formData) {
      const updatedItems = formData.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
      setFormData({ ...formData, items: updatedItems })
    }
  }

  const handleAddItem = () => {
    if (formData) {
      const newItem: OrderItem = {
        id: Date.now(), // Temporary ID
        product_id: 0,
        product_name: '',
        product_sku: '',
        quantity: 1,
        unit_price: 0,
        subtotal: 0
      }
      setFormData({ ...formData, items: [...formData.items, newItem] })
    }
  }

  const handleRemoveItem = (itemId: number) => {
    if (formData) {
      const updatedItems = formData.items.filter(item => item.id !== itemId)
      setFormData({ ...formData, items: updatedItems })
    }
  }

  const addProductToOrder = (product: Product) => {
    if (formData) {
      const newItem: OrderItem = {
        id: Date.now(),
        product_id: parseInt(product.id),
        product_name: product.name,
        product_sku: product.sku,
        quantity: 1,
        unit_price: product.sell_price,
        subtotal: product.sell_price
      }
      setFormData({ ...formData, items: [...formData.items, newItem] })
    }
  }

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSave = () => {
    if (formData) {
      // Normalize date to YYYY-MM-DD for MySQL
      const normalizeDate = (d: string) => {
        if (!d) return d
        // If already in YYYY-MM-DD just return
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
        // If in DD-MM-YYYY convert
        const m = d.match(/^(\d{2})-(\d{2})-(\d{4})$/)
        if (m) return `${m[3]}-${m[2]}-${m[1]}`
        // Try Date parsing fallback
        const dt = new Date(d)
        if (!isNaN(dt.getTime())) {
          const yyyy = dt.getFullYear()
          const mm = String(dt.getMonth() + 1).padStart(2, '0')
          const dd = String(dt.getDate()).padStart(2, '0')
          return `${yyyy}-${mm}-${dd}`
        }
        return d
      }

      const toNumber = (v: any) => {
        const n = parseFloat(String(v).toString().replace(/[, ]/g, ''))
        return isNaN(n) ? 0 : n
      }

      const sanitized = {
        ...formData,
        order_date: normalizeDate(String(formData.order_date || '')),
        subtotal: toNumber(formData.subtotal),
        tax_rate: toNumber(formData.tax_rate),
        tax_amount: toNumber(formData.tax_amount),
        total_amount: toNumber(formData.total_amount),
        items: formData.items.map(it => ({
          ...it,
          quantity: toNumber(it.quantity),
          unit_price: toNumber(it.unit_price),
          subtotal: toNumber(it.subtotal),
        })),
      } as Order

      // Validate product_id for all items before saving
      const invalid = (sanitized.items as any[]).find(it => !it.product_id || Number(it.product_id) <= 0)
      if (invalid) {
        alert('Each order item must have a valid product_id. Please select a valid product or remove the item.')
        return
      }

      onSave(sanitized)
    }
  }

  if (!formData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-orange-500">Edit Order #{formData.order_number}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Side - Product List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Products
                </CardTitle>
                <div className="mt-4">
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{product.icon}</div>
                        <div>
                          <h3 className="font-medium text-orange-500">{product.name}</h3>
                          <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                          <p className="text-sm text-gray-500">Stock: {product.quantityInStock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">₹{product.sell_price}</p>
                          {/* Removed payment status badge per requirement */}
                        </div>
                        <Button
                          onClick={() => addProductToOrder(product)}
                          disabled={product.quantityInStock === 0}
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No products found matching your search.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Cart and Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Products</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No products selected
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {formData.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="text-lg">{item.product_name ? '📦' : '📦'}</div>
                          <div>
                            <p className="font-medium text-sm">{item.product_name || 'Product Name'}</p>
                            <p className="text-xs text-gray-500">₹{item.unit_price} each</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleItemChange(item.id, 'quantity', Math.max(1, item.quantity - 1))}
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            onClick={() => handleItemChange(item.id, 'quantity', item.quantity + 1)}
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => handleRemoveItem(item.id)}
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bottom Row - Order Summary and Customer Form */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{(parseFloat(String(formData.subtotal)) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({(parseFloat(String(formData.tax_rate)) || 0).toFixed(2)}%):</span>
                      <span>₹{(parseFloat(String(formData.tax_amount)) || 0).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Gross Amount:</span>
                      <span>₹{(parseFloat(String(formData.total_amount)) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer_name">Customer Name *</Label>
                      <Input
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={(e) => handleInputChange('customer_name', e.target.value)}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile_no">Mobile No *</Label>
                      <Input
                        id="mobile_no"
                        value={formData.mobile_no}
                        onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                        placeholder="Enter mobile number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="order_date">Date Sell</Label>
                      <Input
                        id="order_date"
                        type="date"
                        value={formData.order_date}
                        onChange={(e) => handleInputChange('order_date', e.target.value)}
                        className="pr-8 [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:mr-3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="payment_method">Payment Method</Label>
                      <Select value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Order Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select order status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="partial_paid">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              Partial Paid
                            </div>
                          </SelectItem>
                          <SelectItem value="paid">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Paid
                            </div>
                          </SelectItem>
                          <SelectItem value="due">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              Due
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSave}
              className="w-full"
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Return Order Dialog Component
interface ReturnOrderDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
  onProcessReturn: () => void
  returnItems: OrderItem[]
  onReturnItemChange: (itemId: number, field: keyof OrderItem, value: any) => void
  onRemoveReturnItem: (itemId: number) => void
  returnCustomerData: {
    customer_name: string
    customer_phone: string
    return_date: string
    payment_method: string
  }
  onReturnCustomerDataChange: (field: string, value: string) => void
}

const ReturnOrderDialog: React.FC<ReturnOrderDialogProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onProcessReturn,
  returnItems,
  onReturnItemChange,
  onRemoveReturnItem,
  returnCustomerData,
  onReturnCustomerDataChange
}) => {
  if (!order) return null

  const formatCurrency = (value: number | string) => `₹${(parseFloat(String(value)) || 0).toFixed(2)}`

  // Calculate return amounts dynamically
  const returnSubtotal = returnItems.reduce((sum, item) => {
    return sum + (parseFloat(String(item.unit_price)) * item.quantity)
  }, 0)
  
  const returnTaxRate = parseFloat(String(order.tax_rate)) || 0
  const returnTaxAmount = (returnSubtotal * returnTaxRate) / 100
  const returnTotalAmount = returnSubtotal + returnTaxAmount

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-orange-500">Return Order #{order.order_number}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Side - Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Items to Return</CardTitle>
              </CardHeader>
              <CardContent>
                {returnItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No items available for return
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {returnItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="text-lg">📦</div>
                          <div>
                            <p className="font-medium text-sm">{item.product_name}</p>
                            <p className="text-xs text-gray-500">SKU: {item.product_sku}</p>
                            <p className="text-xs text-gray-500">₹{item.unit_price} each</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => onReturnItemChange(item.id, 'quantity', Math.max(0, item.quantity - 1))}
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            onClick={() => onReturnItemChange(item.id, 'quantity', item.quantity + 1)}
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => onRemoveReturnItem(item.id)}
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Order Summary and Customer Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Return Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Return Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(returnSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({returnTaxRate.toFixed(2)}%):</span>
                    <span>{formatCurrency(returnTaxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Return Amount:</span>
                    <span>{formatCurrency(returnTotalAmount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="return_customer_name">Customer Name *</Label>
                    <Input 
                      id="return_customer_name"
                      value={returnCustomerData.customer_name}
                      onChange={(e) => onReturnCustomerDataChange('customer_name', e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="return_customer_phone">Mobile No *</Label>
                    <Input 
                      id="return_customer_phone"
                      value={returnCustomerData.customer_phone}
                      onChange={(e) => onReturnCustomerDataChange('customer_phone', e.target.value)}
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="return_date">Return Date</Label>
                    <Input 
                      id="return_date"
                      type="date"
                      value={returnCustomerData.return_date}
                      onChange={(e) => onReturnCustomerDataChange('return_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="return_payment_method">Payment Method</Label>
                    <Select 
                      value={returnCustomerData.payment_method} 
                      onValueChange={(value) => onReturnCustomerDataChange('payment_method', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onProcessReturn} className="bg-orange-600 hover:bg-orange-700">
            <FileText className="w-5 h-5 mr-2" />
            Process Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default page