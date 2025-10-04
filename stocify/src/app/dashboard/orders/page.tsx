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
  Minus
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
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

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

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setEditingOrder(null)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'new': { label: 'New', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      'in progress': { label: 'Processing', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      'fulfilled': { label: 'Fulfilled', variant: 'secondary' as const, color: 'bg-green-100 text-green-800' },
      'shipped': { label: 'Shipped', variant: 'secondary' as const, color: 'bg-purple-100 text-purple-800' },
      'delivered': { label: 'Delivered', variant: 'secondary' as const, color: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Cancelled', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['new']
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
                         order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return (parseFloat(b.total_amount) || 0) - (parseFloat(a.total_amount) || 0)
      case 'amount_low':
        return (parseFloat(a.total_amount) || 0) - (parseFloat(b.total_amount) || 0)
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by ID, name, status..."
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
              <DropdownMenuItem onClick={() => setStatusFilter('new')}>New</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in progress')}>Processing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('shipped')}>Shipped</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('delivered')}>Delivered</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>Cancelled</DropdownMenuItem>
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
                    <p className="text-sm font-semibold">Order ID: {order.id}</p>
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
                          Price: ₹{(parseFloat(order.items[0]?.unit_price) || 0).toFixed(2)} | Total: ₹{(parseFloat(order.items[0]?.subtotal) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Price Section */}
                    <div className="text-center min-w-[80px]">
                      <p className="text-lg font-bold">₹{(parseFloat(order.total_amount) || 0).toFixed(2)}</p>
                      {(parseFloat(order.tax_amount) || 0) > 0 && (
                        <p className="text-xs text-gray-500">
                          Tax: ₹{(parseFloat(order.tax_amount) || 0).toFixed(2)}
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
                      <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs h-7 bg-blue-500 text-white">
                        <Printer className="h-3 w-3" />
                        Print Label
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="flex items-center gap-1 text-xs h-7"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete Order
                      </Button>
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

  useEffect(() => {
    if (order) {
      setFormData({ ...order })
    }
  }, [order])

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
      <DialogContent className="min-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order #{formData.id}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="mobile_no">Mobile Number</Label>
                <Input
                  id="mobile_no"
                  value={formData.mobile_no}
                  onChange={(e) => handleInputChange('mobile_no', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="order_date">Order Date</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => handleInputChange('order_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Information</h3>
            <div className="space-y-3">
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
                <Label htmlFor="transaction_id">Transaction ID</Label>
                <Input
                  id="transaction_id"
                  value={formData.transaction_id || ''}
                  onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Order Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Order Items</h3>
            <Button onClick={handleAddItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 border rounded-lg">
                <div>
                  <Label>Product Name</Label>
                  <Input
                    value={item.product_name}
                    onChange={(e) => handleItemChange(item.id, 'product_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={item.product_sku}
                    onChange={(e) => handleItemChange(item.id, 'product_sku', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>Subtotal</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.subtotal}
                    onChange={(e) => handleItemChange(item.id, 'subtotal', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => handleRemoveItem(item.id)}
                    size="sm"
                    variant="destructive"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default page