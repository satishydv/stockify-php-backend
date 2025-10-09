"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarIcon
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

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

interface SalesMetrics {
  totalRevenue: number
  totalOrders: number
  paidOrders: number
  dueOrders: number
  inProgressOrders: number
  averageOrderValue: number
  totalCustomers: number
  uniqueCustomers: number
  totalItemsSold: number
  conversionRate: number
}

interface DailySales {
  date: string
  revenue: number
  orders: number
  customers: number
}

interface PaymentMethodStats {
  method: string
  count: number
  total: number
  percentage: number
}

interface TopCustomer {
  customer_name: string
  mobile_no: string
  orders: number
  total_spent: number
  last_order_date: string
}

interface TopProduct {
  product_name: string
  product_sku: string
  total_sold: number
  total_revenue: number
  orders_count: number
}

const SalesReportPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    paidOrders: 0,
    dueOrders: 0,
    inProgressOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    uniqueCustomers: 0,
    totalItemsSold: 0,
    conversionRate: 0
  })
  const [dailySales, setDailySales] = useState<DailySales[]>([])
  const [paymentMethodStats, setPaymentMethodStats] = useState<PaymentMethodStats[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  // Fetch orders from API
  useEffect(() => {
    fetchOrders()
  }, [])

  // Calculate metrics when orders change
  useEffect(() => {
    if (orders.length > 0) {
      calculateMetrics()
    }
  }, [orders, fromDate, toDate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/orders`)
      if (response.ok) {
        const data = await response.json()
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

  const getFilteredOrders = () => {
    let filtered = orders

    // Apply date filtering
    if (fromDate || toDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.order_date)
        if (fromDate && orderDate < fromDate) return false
        if (toDate && orderDate > toDate) return false
        return true
      })
    }

    return filtered
  }

  const calculateMetrics = () => {
    const filteredOrders = getFilteredOrders()
    
    // Basic metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0)
    const totalOrders = filteredOrders.length
    const paidOrders = filteredOrders.filter(order => order.status === 'paid').length
    const dueOrders = filteredOrders.filter(order => order.status === 'due').length
    const inProgressOrders = filteredOrders.filter(order => order.status === 'in_progress').length
    
    // Customer metrics
    const uniqueCustomers = new Set(filteredOrders.map(order => order.mobile_no)).size
    const totalItemsSold = filteredOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    )
    
    // Calculate averages
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    const conversionRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0

    setSalesMetrics({
      totalRevenue,
      totalOrders,
      paidOrders,
      dueOrders,
      inProgressOrders,
      averageOrderValue,
      totalCustomers: filteredOrders.length,
      uniqueCustomers,
      totalItemsSold,
      conversionRate
    })

    // Calculate daily sales
    calculateDailySales(filteredOrders)
    
    // Calculate payment method stats
    calculatePaymentMethodStats(filteredOrders)
    
    // Calculate top customers
    calculateTopCustomers(filteredOrders)
    
    // Calculate top products
    calculateTopProducts(filteredOrders)
  }

  const calculateDailySales = (filteredOrders: Order[]) => {
    const dailyMap = new Map<string, { revenue: number, orders: number, customers: Set<string> }>()
    
    filteredOrders.forEach(order => {
      const date = order.order_date
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { revenue: 0, orders: 0, customers: new Set() })
      }
      const dayData = dailyMap.get(date)!
      dayData.revenue += parseFloat(order.total_amount.toString())
      dayData.orders += 1
      dayData.customers.add(order.mobile_no)
    })

    const dailySalesData = Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
      customers: data.customers.size
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setDailySales(dailySalesData)
  }

  const calculatePaymentMethodStats = (filteredOrders: Order[]) => {
    const methodMap = new Map<string, { count: number, total: number }>()
    
    filteredOrders.forEach(order => {
      const method = order.payment_method
      if (!methodMap.has(method)) {
        methodMap.set(method, { count: 0, total: 0 })
      }
      const methodData = methodMap.get(method)!
      methodData.count += 1
      methodData.total += parseFloat(order.total_amount.toString())
    })

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0)
    
    const paymentStats = Array.from(methodMap.entries()).map(([method, data]) => ({
      method: method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' '),
      count: data.count,
      total: data.total,
      percentage: totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0
    })).sort((a, b) => b.total - a.total)

    setPaymentMethodStats(paymentStats)
  }

  const calculateTopCustomers = (filteredOrders: Order[]) => {
    const customerMap = new Map<string, { 
      customer_name: string, 
      mobile_no: string, 
      orders: number, 
      total_spent: number, 
      last_order_date: string 
    }>()
    
    filteredOrders.forEach(order => {
      const mobile = order.mobile_no
      if (!customerMap.has(mobile)) {
        customerMap.set(mobile, {
          customer_name: order.customer_name,
          mobile_no: mobile,
          orders: 0,
          total_spent: 0,
          last_order_date: order.order_date
        })
      }
      const customer = customerMap.get(mobile)!
      customer.orders += 1
      customer.total_spent += parseFloat(order.total_amount.toString())
      if (new Date(order.order_date) > new Date(customer.last_order_date)) {
        customer.last_order_date = order.order_date
      }
    })

    const topCustomersData = Array.from(customerMap.values())
      .sort((a, b) => b.total_spent - a.total_spent)
      .slice(0, 10)

    setTopCustomers(topCustomersData)
  }

  const calculateTopProducts = (filteredOrders: Order[]) => {
    const productMap = new Map<string, { 
      product_name: string, 
      product_sku: string, 
      total_sold: number, 
      total_revenue: number, 
      orders_count: number 
    }>()
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.product_name}-${item.product_sku}`
        if (!productMap.has(key)) {
          productMap.set(key, {
            product_name: item.product_name,
            product_sku: item.product_sku,
            total_sold: 0,
            total_revenue: 0,
            orders_count: 0
          })
        }
        const product = productMap.get(key)!
        product.total_sold += item.quantity
        product.total_revenue += parseFloat(item.subtotal.toString())
        product.orders_count += 1
      })
    })

    const topProductsData = Array.from(productMap.values())
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10)

    setTopProducts(topProductsData)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'due':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'due':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

  const handleApplyFilter = () => {
    calculateMetrics()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading sales report...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-orange-500">Sales Report</h1>
        <p className="text-gray-600">Comprehensive sales analytics and insights</p>
      </div>

      {/* Date Filter */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date Range
          </CardTitle>
          <p className="text-sm text-gray-600">Choose the period for which you want to view income data</p>
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
                    onSelect={(date) => setFromDate(date)}
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
                    onSelect={(date) => setToDate(date)}
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(salesMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics.totalOrders} orders • {formatDateRange()}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {salesMetrics.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(salesMetrics.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {salesMetrics.uniqueCustomers}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics.totalItemsSold} items sold
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {salesMetrics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Paid vs Total orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {salesMetrics.paidOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics.totalOrders > 0 ? ((salesMetrics.paidOrders / salesMetrics.totalOrders) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {salesMetrics.dueOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics.totalOrders > 0 ? ((salesMetrics.dueOrders / salesMetrics.totalOrders) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {salesMetrics.inProgressOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesMetrics.totalOrders > 0 ? ((salesMetrics.inProgressOrders / salesMetrics.totalOrders) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Daily Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailySales.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">{formatDate(day.date)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(day.revenue)}</div>
                    <div className="text-xs text-gray-500">{day.orders} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethodStats.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(method.total)}</div>
                    <div className="text-xs text-gray-500">{method.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers and Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.slice(0, 5).map((customer, index) => (
                <div key={customer.mobile_no} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{customer.customer_name}</div>
                    <div className="text-sm text-gray-500">{customer.mobile_no}</div>
                    <div className="text-xs text-gray-400">{customer.orders} orders</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">{formatCurrency(customer.total_spent)}</div>
                    <div className="text-xs text-gray-500">Last: {formatDate(customer.last_order_date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={`${product.product_name}-${product.product_sku}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{product.product_name}</div>
                    <div className="text-sm text-gray-500">SKU: {product.product_sku}</div>
                    <div className="text-xs text-gray-400">{product.total_sold} units sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">{formatCurrency(product.total_revenue)}</div>
                    <div className="text-xs text-gray-500">{product.orders_count} orders</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Summary */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Recent Orders Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getFilteredOrders().slice(0, 10).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <div className="font-medium text-gray-900">{order.customer_name}</div>
                    <div className="text-sm text-gray-500">{order.mobile_no}</div>
                    <div className="text-xs text-gray-400">{formatDate(order.order_date)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(parseFloat(order.total_amount.toString()))}</div>
                    <div className="text-xs text-gray-500">{order.items.length} items</div>
                  </div>
                </div>
              </div>
            ))}
            {getFilteredOrders().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders found for the selected date range.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesReportPage
