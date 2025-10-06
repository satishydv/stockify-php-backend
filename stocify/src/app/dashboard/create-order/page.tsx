"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProductStore } from "@/stores/productStore"
import { useTaxStore } from "@/stores/taxStore"
import { useOrderStore } from "@/stores/orderStore"
import { Product } from "@/lib/product-data"
import { Tax } from "@/stores/taxStore"
import { IoAdd, IoRemove, IoSearch, IoTrash, IoCheckmark, IoCard, IoCash, IoCloudUpload, IoWallet } from "react-icons/io5"

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

interface CustomerForm {
  customerName: string
  mobileNo: string
  dateSell: string
  customerAddress: string
}

interface PaymentForm {
  paymentMethod: string
  transactionId: string
  paymentAttachment: File | null
}

export default function CreateOrderPage() {
  const { products, loading, fetchProducts } = useProductStore()
  const { taxes, fetchTaxes } = useTaxStore()
  const { addOrder } = useOrderStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    customerName: "",
    mobileNo: "",
    dateSell: new Date().toISOString().split('T')[0],
    customerAddress: ""
  })
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    paymentMethod: "",
    transactionId: "",
    paymentAttachment: null
  })

  // Fetch data on component mount
  useEffect(() => {
    fetchProducts()
    fetchTaxes()
  }, [fetchProducts, fetchTaxes])

  // Auto-select first enabled tax when taxes are loaded
  useEffect(() => {
    if (taxes.length > 0 && !selectedTax) {
      const enabledTax = taxes.find(tax => tax.status === 'enable')
      if (enabledTax) {
        setSelectedTax(enabledTax)
      }
    }
  }, [taxes, selectedTax])

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * product.sell_price }
          : item
      ))
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        subtotal: product.sell_price
      }])
    }
  }

  // Update quantity in cart
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.product.sell_price }
        : item
    ))
  }

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const taxAmount = selectedTax ? (subtotal * selectedTax.rate) / 100 : 0
  const grossAmount = subtotal + taxAmount

  // Handle form input changes
  const handleFormChange = (field: keyof CustomerForm, value: string) => {
    setCustomerForm(prev => ({ ...prev, [field]: value || "" }))
  }

  // Handle payment form changes
  const handlePaymentFormChange = (field: keyof PaymentForm, value: string | File | null) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }))
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    handlePaymentFormChange('paymentAttachment', file)
  }


  // Open payment dialog
  const handleCreateOrder = () => {
    if (cart.length === 0) {
      alert("Please add at least one product to the cart")
      return
    }

    if (!customerForm.customerName || !customerForm.mobileNo) {
      alert("Please fill in customer name and mobile number")
      return
    }

    setIsPaymentDialogOpen(true)
  }

  // Submit order with payment
  const handleSubmitOrder = async () => {
    if (!paymentForm.paymentMethod) {
      alert("Please select a payment method")
      return
    }

    if (paymentForm.paymentMethod === 'upi' && !paymentForm.transactionId) {
      alert("Please enter transaction ID for UPI payment")
      return
    }

    try {
      // Create FormData for file upload and order data
      const formData = new FormData()

      // Append customer details
      formData.append('customer_name', customerForm.customerName)
      formData.append('mobile_no', customerForm.mobileNo)
      formData.append('customer_address', customerForm.customerAddress)
      formData.append('order_date', customerForm.dateSell)

      // Append order totals
      formData.append('subtotal', subtotal.toFixed(2))
      formData.append('tax_rate', (parseFloat(selectedTax?.rate?.toString() || '0')).toFixed(2))
      formData.append('tax_amount', taxAmount.toFixed(2))
      formData.append('total_amount', grossAmount.toFixed(2))
      // Status is set to 'fulfilled' by default in the backend

      // Append payment details
      formData.append('payment_method', paymentForm.paymentMethod)
      if (paymentForm.transactionId) {
        formData.append('transaction_id', paymentForm.transactionId)
      }
      if (paymentForm.paymentAttachment) {
        formData.append('payment_attachment', paymentForm.paymentAttachment)
      }
      formData.append('payment_date', new Date().toISOString())

      // Append cart items as JSON string
      formData.append('items', JSON.stringify(cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        quantity: item.quantity,
        unit_price: item.product.sell_price,
        subtotal: item.subtotal
      }))))

      // Make API call to your backend
      console.log('Sending request to:', `${process.env.NEXT_PUBLIC_API_URL}/index.php/api/orders`)
      console.log('FormData contents:', Array.from(formData.entries()))
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/orders`, {
        method: 'POST',
        body: formData, // FormData automatically sets Content-Type: multipart/form-data
      })
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        let errorMessage = "Failed to create order"
        try {
          // Clone the response to read it safely
          const responseClone = response.clone()
          const errorData = await responseClone.json()
          errorMessage = errorData.message || errorMessage
        } catch (jsonError) {
          // If response is not JSON, get text response
          const textResponse = await response.text()
          errorMessage = textResponse || errorMessage
        }
        throw new Error(errorMessage)
      }

      const result = await response.json()
      alert(result.message || "Order created successfully!")

      // Reset form and cart
      setCart([])
      setCustomerForm({
        customerName: "",
        mobileNo: "",
        dateSell: new Date().toISOString().split('T')[0]
      })
      setPaymentForm({
        paymentMethod: "",
        transactionId: "",
        paymentAttachment: null
      })
      setIsPaymentDialogOpen(false)

      // Reset tax selection
      const enabledTax = taxes.find(tax => tax.status === 'enable')
      setSelectedTax(enabledTax || null)

    } catch (error: any) {
      console.error("Error creating order:", error)
      alert(`Error: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-orange-500">Create New Order</h1>
          <p className="text-gray-600 mt-2">Select products and create a new order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Product List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IoSearch className="w-5 h-5" />
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
                        <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => addToCart(product)}
                        disabled={product.quantityInStock === 0}
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <IoAdd className="w-4 h-4" />
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
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products selected
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="text-lg">{item.product.icon}</div>
                        <div>
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-gray-500">₹{item.product.sell_price} each</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                        >
                          <IoRemove className="w-3 h-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                        >
                          <IoAdd className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => removeFromCart(item.product.id)}
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <IoTrash className="w-3 h-3" />
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
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {selectedTax && taxes.some(tax => tax.status === 'enable') && (
                    <div className="flex justify-between">
                      <span>Tax ({selectedTax.name} - {selectedTax.rate}%):</span>
                      <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Gross Amount:</span>
                    <span>₹{grossAmount.toFixed(2)}</span>
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
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={customerForm.customerName}
                      onChange={(e) => handleFormChange('customerName', e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobileNo">Mobile No *</Label>
                    <Input
                      id="mobileNo"
                      value={customerForm.mobileNo}
                      onChange={(e) => handleFormChange('mobileNo', e.target.value)}
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerAddress">Customer Address</Label>
                    <Input
                      id="customerAddress"
                      value={customerForm.customerAddress || ""}
                      onChange={(e) => handleFormChange('customerAddress', e.target.value)}
                      placeholder="Enter customer address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateSell">Date Sell</Label>
                    <Input
                      id="dateSell"
                      type="date"
                      value={customerForm.dateSell}
                      onChange={(e) => handleFormChange('dateSell', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleCreateOrder}
            disabled={cart.length === 0}
            className="w-full"
            size="lg"
          >
            <IoCheckmark className="w-5 h-5 mr-2" />
            Create Order
          </Button>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-5xl min-w-5xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <IoWallet className="w-6 h-6 text-blue-600" />
              Complete Your Order
            </DialogTitle>
            <DialogDescription>
              Review your order and complete the payment to finalize your purchase.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            {/* Left Side - Order Summary */}
            <div className="space-y-4 lg:col-span-2">
              <Card className="border-2 border-blue-100 bg-blue-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                    <IoCheckmark className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Customer Info */}
                  <div className="bg-white p-3 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-2">Customer Details</h4>
                    <p className="text-sm text-gray-600"><strong>Name:</strong> {customerForm.customerName}</p>
                    <p className="text-sm text-gray-600"><strong>Mobile:</strong> {customerForm.mobileNo}</p>
                    <p className="text-sm text-gray-600"><strong>Date:</strong> {customerForm.dateSell}</p>
                  </div>

                  {/* Cart Items */}
                  <div className="bg-white p-3 rounded-lg border">
                    <h4 className="font-semibold text-gray-800 mb-3">Items ({cart.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <div className="text-lg">{item.product.icon}</div>
                            <div>
                              <p className="text-sm font-medium">{item.product.name}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold">₹{item.subtotal.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {selectedTax && taxes.some(tax => tax.status === 'enable') && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax ({selectedTax.name} - {selectedTax.rate}%):</span>
                          <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between text-lg font-bold text-green-600">
                        <span>Total Amount:</span>
                        <span>₹{grossAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Payment Form */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="border-2 border-green-100 bg-green-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                    <IoCard className="w-5 h-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method */}
                  <div>
                    <Label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                      Select Payment Method *
                    </Label>
                    <Select value={paymentForm.paymentMethod} onValueChange={(value) => handlePaymentFormChange('paymentMethod', value)}>
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Choose payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <IoCash className="w-4 h-4 text-green-600" />
                            Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <IoCard className="w-4 h-4 text-blue-600" />
                            Card
                          </div>
                        </SelectItem>
                        <SelectItem value="upi">
                          <div className="flex items-center gap-2">
                            <IoWallet className="w-4 h-4 text-purple-600" />
                            UPI
                          </div>
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center gap-2">
                            <IoCard className="w-4 h-4 text-indigo-600" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                        <SelectItem value="cheque">
                          <div className="flex items-center gap-2">
                            <IoCard className="w-4 h-4 text-orange-600" />
                            Cheque
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Transaction ID (conditional for UPI) */}
                  {paymentForm.paymentMethod === 'upi' && (
                    <div>
                      <Label htmlFor="transactionId" className="text-sm font-medium text-gray-700">
                        Transaction ID *
                      </Label>
                      <Input
                        id="transactionId"
                        value={paymentForm.transactionId}
                        onChange={(e) => handlePaymentFormChange('transactionId', e.target.value)}
                        placeholder="Enter UPI transaction ID"
                        className="mt-1 w-full"
                      />
                    </div>
                  )}

                  {/* File Upload */}
                  <div>
                    <Label htmlFor="paymentAttachment" className="text-sm font-medium text-gray-700">
                      Payment Receipt (Optional)
                    </Label>
                    <div className="mt-1">
                      <Input
                        id="paymentAttachment"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileUpload}
                        className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {paymentForm.paymentAttachment && (
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                          <IoCloudUpload className="w-4 h-4" />
                          {paymentForm.paymentAttachment.name}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitOrder}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
            >
              <IoCheckmark className="w-5 h-5 mr-2" />
              Pay ₹{grossAmount.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
