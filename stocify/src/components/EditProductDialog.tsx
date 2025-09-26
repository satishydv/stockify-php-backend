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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { IoCheckmark, IoClose as IoCloseIcon, IoMail } from "react-icons/io5"
import { useProductStore } from "@/stores/productStore"
import { Product } from "@/lib/product-data"
import { toast } from "sonner"

interface EditProductFormData {
  name: string
  sku: string
  price: string
  category: string
  status: string
  quantity: string
  supplier: string
}

interface EditProductDialogProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

const categories = [
  "Electronics",
  "Furniture", 
  "Clothing",
  "Books",
  "Toys",
  "Beauty",
  "Sports",
  "Home Decor",
  "Home Appliances",
  "Others"
]

export default function EditProductDialog({ product, isOpen, onClose }: EditProductDialogProps) {
  const [formData, setFormData] = useState<EditProductFormData>({
    name: "",
    sku: "",
    price: "",
    category: "Electronics",
    status: "published",
    quantity: "",
    supplier: ""
  })
  const [errors, setErrors] = useState<Partial<EditProductFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateProduct, fetchProducts } = useProductStore()

  // Populate form when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        price: product.price?.toString() || "",
        category: product.category || "Electronics",
        status: product.status || "published",
        quantity: product.quantityInStock?.toString() || "",
        supplier: product.supplier || ""
      })
      setErrors({})
    }
  }, [product, isOpen])

  const handleInputChange = (field: keyof EditProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<EditProductFormData> = {}
    
    if (!formData.name.trim()) newErrors.name = "The product name is required"
    if (!formData.sku.trim()) newErrors.sku = "The SKU ref is required"
    if (!formData.price.trim()) newErrors.price = "The Price is required"
    if (!formData.quantity.trim()) newErrors.quantity = "The quantity is required"
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier's name is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!product || !validateForm()) return

    setIsSubmitting(true)
    try {
      await updateProduct(product.id, {
        name: formData.name,
        sku: formData.sku,
        price: parseFloat(formData.price),
        category: formData.category,
        status: formData.status,
        quantityInStock: parseInt(formData.quantity),
        supplier: formData.supplier,
        icon: product.icon // Keep existing icon
      })
      
      // Refresh the products list to show updated data
      await fetchProducts()
      
      toast.success(`Product "${formData.name}" updated successfully`)
      onClose()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <IoCheckmark className="w-4 h-4" />
      case "inactive":
        return <IoCloseIcon className="w-4 h-4" />
      case "draft":
        return <IoMail className="w-4 h-4" />
      default:
        return <IoCheckmark className="w-4 h-4" />
    }
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-7 px-8 poppins min-w-6xl min-h-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[22px]">Edit Product</DialogTitle>
          <DialogDescription>
            Update the product information below.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        
        <div className="flex flex-col gap-2 mt-1">
          {/* First row: Product Name and SKU */}
          <div className="grid grid-cols-2 gap-7">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Product's Name</Label>
              <Input
                id="edit-name"
                placeholder="Laptop..."
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-sku">SKU</Label>
              <Input
                id="edit-sku"
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

          {/* Second row: Category and Supplier */}
          <div className="grid grid-cols-2 gap-7">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-category">Product's Category</Label>
              <select
                id="edit-category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-supplier">Supplier's name</Label>
              <Input
                id="edit-supplier"
                placeholder="TechWorld..."
                value={formData.supplier}
                onChange={(e) => handleInputChange("supplier", e.target.value)}
                className={errors.supplier ? "border-red-500" : ""}
              />
              {errors.supplier && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.supplier}
                </div>
              )}
            </div>
          </div>

          {/* Third row: Status */}
          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <div className="flex gap-3">
              {[
                { value: "published", label: "Published", icon: getStatusIcon("published") },
                { value: "inactive", label: "Inactive", icon: getStatusIcon("inactive") },
                { value: "draft", label: "Draft", icon: getStatusIcon("draft") }
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => handleInputChange("status", status.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    formData.status === status.value
                      ? "bg-gray-800 text-white border-gray-800"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {status.icon}
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fourth row: Quantity and Price */}
          <div className="grid grid-cols-2 gap-7">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
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
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                placeholder="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.price}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-9 mb-4 flex items-center gap-4">
          <Button variant="secondary" className="h-11 px-11" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="h-11 px-11 bg-red-600 hover:bg-red-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
