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
import { useProductStore } from "@/stores/productStore"
import { useCategoryStore } from "@/stores/categoryStore"
import { useSupplierStore } from "@/stores/supplierStore"
import { useBranchStore } from "@/stores/branchStore"
import { Product } from "@/lib/product-data"
import { toast } from "sonner"

interface EditProductFormData {
  name: string
  sku: string
  purchase_price: string
  sell_price: string
  category: string
  status: string
  quantity: string
  supplier: string
  branch_name: string
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
    purchase_price: "",
    sell_price: "",
    category: "Electronics",
    status: "paid",
    quantity: "",
    supplier: "",
    branch_name: ""
  })
  const [errors, setErrors] = useState<Partial<EditProductFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { updateProduct, fetchProducts } = useProductStore()
  const { categories, fetchCategories } = useCategoryStore()
  const { suppliers, fetchSuppliers } = useSupplierStore()
  const { branches, fetchBranches } = useBranchStore()

  // Fetch data when component mounts
  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
    fetchBranches()
  }, [fetchCategories, fetchSuppliers, fetchBranches])

  // Populate form when product changes
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        purchase_price: product.purchase_price?.toString() || "",
        sell_price: product.sell_price?.toString() || "",
        category: product.category || "Electronics",
        status: product.status || "paid",
        quantity: product.quantityInStock?.toString() || "",
        supplier: product.supplier || "",
        branch_name: product.branch_name || ""
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
    if (!formData.purchase_price.trim()) newErrors.purchase_price = "The Purchase Price is required"
    if (!formData.sell_price.trim()) newErrors.sell_price = "The Sell Price is required"
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
        purchase_price: parseFloat(formData.purchase_price),
        sell_price: parseFloat(formData.sell_price),
        category: formData.category,
        status: formData.status,
        quantityInStock: parseInt(formData.quantity),
        supplier: formData.supplier,
        branch_name: formData.branch_name || undefined,
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
                  <option key={category.id} value={category.name}>
                    {category.name}
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

          {/* Branch selection row */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-branch_name">Branch</Label>
            <select
              id="edit-branch_name"
              value={formData.branch_name}
              onChange={(e) => handleInputChange("branch_name", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a branch (optional)...</option>
              {branches
                .filter(branch => branch.status === 'active')
                .map((branch) => (
                  <option key={branch.id} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Third row: Status */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-status">Status</Label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="paid">Paid</option>
              <option value="due">Due</option>
              <option value="partial_paid">Partial Paid</option>
            </select>
          </div>

          {/* Fourth row: Quantity, Purchase Price, and Sell Price */}
          <div className="grid grid-cols-3 gap-7">
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
              <Label htmlFor="edit-purchase_price">Purchase Price</Label>
              <Input
                id="edit-purchase_price"
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
              <Label htmlFor="edit-sell_price">Sell Price</Label>
              <Input
                id="edit-sell_price"
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
