"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Package, Minus, Plus, Trash2, FileText } from "lucide-react"

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

const ReturnOrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [returningOrder, setReturningOrder] = useState<Order | null>(null)
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false)
  const [returnItems, setReturnItems] = useState<OrderItem[]>([])

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

  const handleReturnOrder = (order: Order) => {
    setReturningOrder(order)
    setReturnItems([...order.items])
    setIsReturnDialogOpen(true)
  }

  const handleCloseReturnDialog = () => {
    setIsReturnDialogOpen(false)
    setReturningOrder(null)
    setReturnItems([])
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

  const handleProcessReturn = async () => {
    if (!returningOrder) return

    try {
      // Filter items that have return quantity > 0
      const itemsToReturn = returnItems.filter(item => item.quantity > 0)
      
      if (itemsToReturn.length === 0) {
        alert('Please select items to return')
        return
      }

      // Calculate total return amount
      const totalReturnAmount = itemsToReturn.reduce((sum, item) => {
        return sum + (parseFloat(String(item.unit_price)) * item.quantity)
      }, 0)

      // Prepare return data
      const returnData = {
        original_order_id: returningOrder.id,
        customer_name: returningOrder.customer_name,
        customer_phone: returningOrder.mobile_no,
        return_date: new Date().toISOString().split('T')[0], // Today's date
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

      // Call API to create return
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/returns/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...returnData,
          items: JSON.stringify(returnData.items)
        })
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

  const formatCurrency = (value: number | string) => `₹${(parseFloat(String(value)) || 0).toFixed(2)}`

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'new': { label: 'New', color: 'bg-blue-100 text-blue-800' },
      'in progress': { label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
      'fulfilled': { label: 'Fulfilled', color: 'bg-green-100 text-green-800' },
      'shipped': { label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
      'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-800' },
      'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['new']
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

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
    <Card className="mt-1 flex flex-col shadow-none poppins border-none">
      <CardHeader className="flex justify-between p-2">
        <div className="flex justify-between items-center">
          <div className="">
            <CardTitle className="font-bold text-[23px]">Return Orders</CardTitle>
            <p className="text-sm text-slate-600">{orders.length} orders available for return</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">No orders found</div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone No</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.mobile_no}</TableCell>
                    <TableCell>
                      {new Date(order.order_date).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(order.total_amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {order.payment_method}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleReturnOrder(order)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Return
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Return Order Dialog */}
      <ReturnOrderDialog 
        order={returningOrder}
        isOpen={isReturnDialogOpen}
        onClose={handleCloseReturnDialog}
        onProcessReturn={handleProcessReturn}
        returnItems={returnItems}
        onReturnItemChange={handleReturnItemChange}
        onRemoveReturnItem={handleRemoveReturnItem}
      />
    </Card>
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
}

const ReturnOrderDialog: React.FC<ReturnOrderDialogProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onProcessReturn,
  returnItems,
  onReturnItemChange,
  onRemoveReturnItem
}) => {
  if (!order) return null

  const formatCurrency = (value: number | string) => `₹${(parseFloat(String(value)) || 0).toFixed(2)}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-orange-500">Return Order #{order.id}</DialogTitle>
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
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({(parseFloat(String(order.tax_rate)) || 0).toFixed(2)}%):</span>
                    <span>{formatCurrency(order.tax_amount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(order.total_amount)}</span>
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
                    <Label>Customer Name</Label>
                    <Input value={order.customer_name} disabled />
                  </div>
                  <div>
                    <Label>Mobile No</Label>
                    <Input value={order.mobile_no} disabled />
                  </div>
                  <div>
                    <Label>Order Date</Label>
                    <Input 
                      value={new Date(order.order_date).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })} 
                      disabled 
                    />
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <Input value={order.payment_method} disabled />
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

export default ReturnOrderPage
