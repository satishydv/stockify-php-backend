"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { IoCheckmark, IoClose as IoCloseIcon, IoMail, IoTime, IoCar, IoCheckmarkCircle } from "react-icons/io5"
import { useOrderStore } from "@/stores/orderStore"
import { useCategoryStore } from "@/stores/categoryStore"
import { useSupplierStore } from "@/stores/supplierStore"
import { Order } from "@/lib/order-data"

interface OrderFormData {
  orderDate: string
  name: string
  sku: string
  supplier: string
  category: string
  numberOfItems: string
  status: "new" | "in_progress" | "fulfilled" | "shipped" | "canceled"
  expectedDeliveryDate: string
  totalAmount: string
}

interface EditOrderDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export default function EditOrderDialog({ order, isOpen, onClose }: EditOrderDialogProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    orderDate: new Date().toISOString().split('T')[0],
    name: "",
    sku: "",
    supplier: "",
    category: "",
    numberOfItems: "",
    status: "new",
    expectedDeliveryDate: "",
    totalAmount: ""
  })
  const [errors, setErrors] = useState<Partial<OrderFormData>>({})
  const updateOrder = useOrderStore((state) => state.updateOrder)
  const { categories, fetchCategories } = useCategoryStore()
  const { suppliers, fetchSuppliers } = useSupplierStore()

  // Fetch categories and suppliers when component mounts
  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
  }, [fetchCategories, fetchSuppliers])

  // Populate form when order changes
  useEffect(() => {
    if (order) {
      setFormData({
        orderDate: order.orderDate,
        name: order.name,
        sku: order.sku,
        supplier: order.supplier,
        category: order.category,
        numberOfItems: order.numberOfItems.toString(),
        status: order.status,
        expectedDeliveryDate: order.expectedDeliveryDate,
        totalAmount: order.totalAmount.toString()
      })
      setErrors({})
    }
  }, [order])

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {}
    
    if (!formData.name.trim()) newErrors.name = "Product name is required"
    if (!formData.sku.trim()) newErrors.sku = "SKU is required"
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier is required"
    if (!formData.category.trim()) newErrors.category = "Category is required"
    if (!formData.numberOfItems.trim()) newErrors.numberOfItems = "Number of items is required"
    if (!formData.expectedDeliveryDate.trim()) newErrors.expectedDeliveryDate = "Expected delivery date is required"
    if (!formData.totalAmount.trim()) newErrors.totalAmount = "Total amount is required"
    
    // Validate number of items is a positive integer
    if (formData.numberOfItems.trim() && (isNaN(parseInt(formData.numberOfItems)) || parseInt(formData.numberOfItems) <= 0)) {
      newErrors.numberOfItems = "Number of items must be a positive number"
    }
    
    // Validate total amount is a positive number
    if (formData.totalAmount.trim() && (isNaN(parseFloat(formData.totalAmount)) || parseFloat(formData.totalAmount) <= 0)) {
      newErrors.totalAmount = "Total amount must be a positive number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm() && order) {
      try {
        // Update order via API
        await updateOrder(order.id, {
          orderDate: formData.orderDate,
          name: formData.name,
          sku: formData.sku,
          supplier: formData.supplier,
          category: formData.category,
          numberOfItems: parseInt(formData.numberOfItems),
          status: formData.status,
          expectedDeliveryDate: formData.expectedDeliveryDate,
          totalAmount: parseFloat(formData.totalAmount)
        })
        
        onClose()
      } catch (error) {
        console.error('Failed to update order:', error)
      }
    }
  }

  const getStatusIcon = (status: OrderFormData["status"]) => {
    switch (status) {
      case "new":
        return <IoMail className="w-4 h-4" />
      case "in_progress":
        return <IoTime className="w-4 h-4" />
      case "fulfilled":
        return <IoCheckmarkCircle className="w-4 h-4" />
      case "shipped":
        return <IoCar className="w-4 h-4" />
      case "canceled":
        return <IoCloseIcon className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-7 px-8 poppins min-w-6xl min-h-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[22px]">Edit Order</DialogTitle>
          <DialogDescription>
            Update the order information.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        
        <div className="flex flex-col gap-2 mt-1">
          {/* First row: Order Date and Product Name */}
          <div className="grid grid-cols-2 gap-7">
            <div className="flex flex-col gap-2">
              <Label htmlFor="order-date">Order Date</Label>
              <Input
                id="order-date"
                type="date"
                value={formData.orderDate}
                onChange={(e) => handleInputChange("orderDate", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                placeholder="Laptop Pro..."
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.name}
                </div>
              )}
            </div>
          </div>

          {/* Second row: SKU and Supplier */}
          <div className="grid grid-cols-2 gap-7 mt-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="LP001"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                className={errors.sku ? "border-red-500" : ""}
              />
              {errors.sku && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.sku}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <select
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.supplier ? "border-red-500" : ""}`}
              >
                <option value="">Select a supplier</option>
                {suppliers
                  .filter(supplier => supplier.status === 'active')
                  .map((supplier) => (
                    <option key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </option>
                  ))}
              </select>
              {errors.supplier && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.supplier}
                </div>
              )}
            </div>
          </div>

          {/* Third row: Category and Number of Items */}
          <div className="grid grid-cols-2 gap-5 items-center mt-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.category ? "border-red-500" : ""}`}
              >
                <option value="">Select a category</option>
                {categories
                  .filter(category => category.status === 'active')
                  .map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.category}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="number-of-items">Number of Items</Label>
              <Input
                id="number-of-items"
                type="number"
                min="1"
                placeholder="1"
                value={formData.numberOfItems}
                onChange={(e) => handleInputChange("numberOfItems", e.target.value)}
                className={errors.numberOfItems ? "border-red-500" : ""}
              />
              {errors.numberOfItems && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.numberOfItems}
                </div>
              )}
            </div>
          </div>

          {/* Fourth row: Status, Expected Delivery Date, and Total Amount */}
          <div className="mt-3 grid grid-cols-3 gap-7 max-lg:grid-cols-2 max-lg:gap-1 max-sm:grid-cols-1">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <div className="flex gap-2 flex-wrap">
                {(["new", "in_progress", "fulfilled", "shipped", "canceled"] as const).map((status) => (
                  <Button
                    key={status}
                    variant={formData.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleInputChange("status", status)}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(status)}
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="expected-delivery">Expected Delivery Date</Label>
              <Input
                id="expected-delivery"
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => handleInputChange("expectedDeliveryDate", e.target.value)}
                className={errors.expectedDeliveryDate ? "border-red-500" : ""}
              />
              {errors.expectedDeliveryDate && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.expectedDeliveryDate}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="total-amount">Total Amount</Label>
              <Input
                id="total-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.totalAmount}
                onChange={(e) => handleInputChange("totalAmount", e.target.value)}
                className={errors.totalAmount ? "border-red-500" : ""}
              />
              {errors.totalAmount && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.totalAmount}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-9 mb-4 flex items-center gap-4">
          <DialogClose asChild>
            <Button variant="secondary" className="h-11 px-11">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} className="h-11 px-11 bg-red-600 hover:bg-red-700">
            Update Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
