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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useProductStore } from "@/stores/productStore"
import { useCategoryStore } from "@/stores/categoryStore"
import { useSupplierStore } from "@/stores/supplierStore"

interface ProductFormData {
  name: string
  sku: string
  purchase_price: string
  sell_price: string
  category: string
  status: string
  quantity: string
  supplier: string
}

const initialFormData: ProductFormData = {
  name: "",
  sku: "",
  purchase_price: "",
  sell_price: "",
  category: "",
  status: "published",
  quantity: "",
  supplier: ""
}

export default function ProductDialog() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<ProductFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addProduct = useProductStore((state) => state.addProduct)
  const { categories, fetchCategories } = useCategoryStore()
  const { suppliers, fetchSuppliers } = useSupplierStore()

  // Fetch categories and suppliers when component mounts
  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
  }, [fetchCategories, fetchSuppliers])

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {}
    
    if (!formData.name.trim()) newErrors.name = "The product name is required"
    if (!formData.sku.trim()) newErrors.sku = "The SKU ref is required"
    if (!formData.purchase_price.trim()) newErrors.purchase_price = "The Purchase Price is required"
    if (!formData.sell_price.trim()) newErrors.sell_price = "The Sell Price is required"
    if (!formData.quantity.trim()) newErrors.quantity = "The quantity is required"
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier's name is required"
    if (!formData.category.trim()) newErrors.category = "Product category is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        await addProduct({
          name: formData.name,
          sku: formData.sku,
          purchase_price: parseFloat(formData.purchase_price),
          sell_price: parseFloat(formData.sell_price),
          category: formData.category,
          status: formData.status,
          quantityInStock: parseInt(formData.quantity),
          supplier: formData.supplier,
          icon: "📦" // Default icon for new products
        })
        
        // Reset form after successful submission
        setFormData(initialFormData)
        setErrors({})
        
        // Close dialog (you might want to add a callback prop for this)
        window.location.reload() // Temporary solution to refresh the page
      } catch (error) {
        console.error('Error creating product:', error)
        setErrors({ submit: 'Failed to create product. Please try again.' })
      } finally {
        setIsSubmitting(false)
      }
    }
  }


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="h-10">Add Product</Button>
      </DialogTrigger>
      <DialogContent className="p-7 px-8 poppins min-w-6xl min-h-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[22px]">Add Product</DialogTitle>
          <DialogDescription>
            Fill in the form to add a new product.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        
        <div className="flex flex-col gap-2 mt-1">
          {/* First row: Product Name and SKU */}
          <div className="grid grid-cols-2 gap-7">
            <div className="flex flex-col gap-2">
              <Label htmlFor="product-name">Product's Name</Label>
              <div className="relative">
                <Input
                  id="product-name"
                  placeholder="Laptop..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                >
                  📖
                </Button>
              </div>
              {errors.name && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.name}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="ABC001"
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
          </div>

          {/* Second row: Supplier and Category */}
          <div className="grid grid-cols-2 gap-5 items-center mt-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier">Supplier's name</Label>
              <select
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.supplier ? "border-red-500" : ""}`}
              >
                <option value="">Select a supplier...</option>
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Product's Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.category ? "border-red-500" : ""}`}
              >
                <option value="">Select a category...</option>
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
          </div>

          {/* Third row: Status, Quantity, Purchase Price, and Sell Price */}
          <div className="mt-3 grid grid-cols-4 gap-7 max-lg:grid-cols-2 max-lg:gap-1 max-sm:grid-cols-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="published">Published</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="34"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.quantity}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.purchase_price}
                onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                className={errors.purchase_price ? "border-red-500" : ""}
              />
              {errors.purchase_price && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.purchase_price}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sell_price">Sell Price</Label>
              <Input
                id="sell_price"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.sell_price}
                onChange={(e) => handleInputChange("sell_price", e.target.value)}
                className={errors.sell_price ? "border-red-500" : ""}
              />
              {errors.sell_price && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.sell_price}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-9 mb-4 flex items-center gap-4">
          <DialogClose asChild>
            <Button variant="secondary" className="h-11 px-11" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit} 
            className="h-11 px-11 bg-red-600 hover:bg-red-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
