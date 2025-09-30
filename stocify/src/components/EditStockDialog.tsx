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
import { useStockStore } from "@/stores/stockStore"
import { useCategoryStore } from "@/stores/categoryStore"
import { useSupplierStore } from "@/stores/supplierStore"
import { Stock } from "@/lib/stock-data"

interface StockFormData {
  sku: string
  productName: string
  category: string
  quantityAvailable: string
  minimumStockLevel: string
  maximumStockLevel: string
  status: "draft" | "published" | "inactive" | "active"
  purchase_price: string
  supplier: string
}

interface EditStockDialogProps {
  stock: Stock | null
  isOpen: boolean
  onClose: () => void
}

export default function EditStockDialog({ stock, isOpen, onClose }: EditStockDialogProps) {
  const [formData, setFormData] = useState<StockFormData>({
    sku: "",
    productName: "",
    category: "",
    quantityAvailable: "",
    minimumStockLevel: "10",
    maximumStockLevel: "1000",
    status: "draft",
    purchase_price: "",
    supplier: ""
  })
  const [errors, setErrors] = useState<Partial<StockFormData>>({})
  const updateStock = useStockStore((state) => state.updateStock)
  const { categories, fetchCategories } = useCategoryStore()
  const { suppliers, fetchSuppliers } = useSupplierStore()

  // Fetch categories and suppliers when component mounts
  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
  }, [fetchCategories, fetchSuppliers])

  // Populate form when stock changes
  useEffect(() => {
    if (stock) {
      setFormData({
        sku: stock.sku,
        productName: stock.productName,
        category: stock.category,
        quantityAvailable: stock.quantityAvailable.toString(),
        minimumStockLevel: stock.minimumStockLevel.toString(),
        maximumStockLevel: stock.maximumStockLevel.toString(),
        status: stock.status,
        purchase_price: stock.purchase_price.toString(),
        supplier: stock.supplier
      })
      setErrors({})
    }
  }, [stock])

  const handleInputChange = (field: keyof StockFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<StockFormData> = {}
    
    if (!formData.sku.trim()) newErrors.sku = "SKU is required"
    if (!formData.productName.trim()) newErrors.productName = "Product name is required"
    if (!formData.category.trim()) newErrors.category = "Category is required"
    if (!formData.quantityAvailable.trim()) newErrors.quantityAvailable = "Quantity available is required"
    if (!formData.minimumStockLevel.trim()) newErrors.minimumStockLevel = "Minimum stock level is required"
    if (!formData.maximumStockLevel.trim()) newErrors.maximumStockLevel = "Maximum stock level is required"
    if (!formData.purchase_price.trim()) newErrors.purchase_price = "Purchase price is required"
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier is required"
    
    // Validate numeric fields
    if (formData.quantityAvailable.trim() && (isNaN(parseInt(formData.quantityAvailable)) || parseInt(formData.quantityAvailable) < 0)) {
      newErrors.quantityAvailable = "Quantity must be a non-negative number"
    }
    if (formData.minimumStockLevel.trim() && (isNaN(parseInt(formData.minimumStockLevel)) || parseInt(formData.minimumStockLevel) < 0)) {
      newErrors.minimumStockLevel = "Minimum stock level must be a non-negative number"
    }
    if (formData.maximumStockLevel.trim() && (isNaN(parseInt(formData.maximumStockLevel)) || parseInt(formData.maximumStockLevel) < 0)) {
      newErrors.maximumStockLevel = "Maximum stock level must be a non-negative number"
    }
    if (formData.purchase_price.trim() && (isNaN(parseFloat(formData.purchase_price)) || parseFloat(formData.purchase_price) < 0)) {
      newErrors.purchase_price = "Purchase price must be a non-negative number"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm() && stock) {
      try {
        // Update stock via API
        await updateStock(stock.id, {
          sku: formData.sku,
          productName: formData.productName,
          category: formData.category,
          quantityAvailable: parseInt(formData.quantityAvailable),
          minimumStockLevel: parseInt(formData.minimumStockLevel),
          maximumStockLevel: parseInt(formData.maximumStockLevel),
          status: formData.status,
          purchase_price: parseFloat(formData.purchase_price),
          supplier: formData.supplier
        })
        
        onClose()
      } catch (error) {
        console.error('Failed to update stock:', error)
      }
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-7 px-8 poppins min-w-6xl min-h-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[22px]">Edit Stock</DialogTitle>
          <DialogDescription>
            Update the stock item information.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        
        <div className="flex flex-col gap-2 mt-1">
          {/* First row: SKU and Product Name */}
          <div className="grid grid-cols-2 gap-7">
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
              <Label htmlFor="product-name">Product Name</Label>
              <Input
                id="product-name"
                placeholder="Laptop Pro..."
                value={formData.productName}
                onChange={(e) => handleInputChange("productName", e.target.value)}
                className={errors.productName ? "border-red-500" : ""}
              />
              {errors.productName && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.productName}
                </div>
              )}
            </div>
          </div>

          {/* Second row: Category and Supplier */}
          <div className="grid grid-cols-2 gap-7 mt-3">
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

          {/* Third row: Quantity Available and Unit Cost */}
          <div className="grid grid-cols-2 gap-7 mt-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity-available">Quantity Available</Label>
              <Input
                id="quantity-available"
                type="number"
                min="0"
                placeholder="100"
                value={formData.quantityAvailable}
                onChange={(e) => handleInputChange("quantityAvailable", e.target.value)}
                className={errors.quantityAvailable ? "border-red-500" : ""}
              />
              {errors.quantityAvailable && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.quantityAvailable}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="purchase-price">Purchase Price</Label>
              <Input
                id="purchase-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
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
          </div>

          {/* Fourth row: Min Level, Max Level, and Status */}
          <div className="mt-3 grid grid-cols-3 gap-7 max-lg:grid-cols-2 max-lg:gap-1 max-sm:grid-cols-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="min-level">Minimum Stock Level</Label>
              <Input
                id="min-level"
                type="number"
                min="0"
                placeholder="10"
                value={formData.minimumStockLevel}
                onChange={(e) => handleInputChange("minimumStockLevel", e.target.value)}
                className={errors.minimumStockLevel ? "border-red-500" : ""}
              />
              {errors.minimumStockLevel && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.minimumStockLevel}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="max-level">Maximum Stock Level</Label>
              <Input
                id="max-level"
                type="number"
                min="0"
                placeholder="1000"
                value={formData.maximumStockLevel}
                onChange={(e) => handleInputChange("maximumStockLevel", e.target.value)}
                className={errors.maximumStockLevel ? "border-red-500" : ""}
              />
              {errors.maximumStockLevel && (
                <div className="flex items-center gap-1 text-red-500 text-sm">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.maximumStockLevel}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="inactive">Inactive</option>
                <option value="active">Active</option>
              </select>
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
            Update Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
