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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProductStore } from "@/stores/productStore"
import { useCategoryStore } from "@/stores/categoryStore"
import { useSupplierStore } from "@/stores/supplierStore"
import { useBranchStore } from "@/stores/branchStore"
import { Plus, X } from "lucide-react"
import { IoCash, IoCard, IoWallet, IoCloudUpload } from "react-icons/io5"

interface ProductItem {
  name: string
  sku: string
  quantity: string
  sell_price: string
  purchase_price: string
  net_purchase_price: string
}

interface ProductFormData {
  supplier: string
  category: string
  branch_name: string
  products: ProductItem[]
  status: "partial_paid" | "paid" | "due"
  payment_method: string
  receipt_file: File | null
}

const initialProductItem: ProductItem = {
  name: "",
  sku: "",
  quantity: "",
  sell_price: "",
  purchase_price: "",
  net_purchase_price: ""
}

const initialFormData: ProductFormData = {
  supplier: "",
  category: "",
  branch_name: "",
  products: [initialProductItem],
  status: "partial_paid",
  payment_method: "",
  receipt_file: null
}

export default function ProductDialog() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [errors, setErrors] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const addProduct = useProductStore((state) => state.addProduct)
  const { categories, fetchCategories } = useCategoryStore()
  const { suppliers, fetchSuppliers } = useSupplierStore()
  const { branches, fetchBranches } = useBranchStore()

  // Fetch categories, suppliers, and branches when component mounts
  useEffect(() => {
    fetchCategories()
    fetchSuppliers()
    fetchBranches()
  }, [fetchCategories, fetchSuppliers, fetchBranches])

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData((prev: ProductFormData) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  const calculateNetPurchasePrice = (quantity: string, purchasePrice: string): string => {
    const qty = parseFloat(quantity) || 0
    const price = parseFloat(purchasePrice) || 0
    return (qty * price).toFixed(2)
  }

  const handleProductChange = (index: number, field: keyof ProductItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) => {
        if (i === index) {
          const updatedProduct = { ...product, [field]: value }
          
          // Auto-calculate net purchase price when quantity or purchase_price changes
          if (field === 'quantity' || field === 'purchase_price') {
            updatedProduct.net_purchase_price = calculateNetPurchasePrice(
              field === 'quantity' ? value : product.quantity,
              field === 'purchase_price' ? value : product.purchase_price
            )
          }
          
          return updatedProduct
        }
        return product
      })
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setFormData(prev => ({ ...prev, receipt_file: file }))
  }

  const addProductRow = () => {
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { ...initialProductItem }]
    }))
  }

  const removeProductRow = (index: number) => {
    if (formData.products.length > 1) {
      setFormData(prev => ({
        ...prev,
        products: prev.products.filter((_, i) => i !== index)
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: any = {}
    
    if (!formData.supplier.trim()) newErrors.supplier = "Supplier's name is required"
    if (!formData.category.trim()) newErrors.category = "Product category is required"
    if (!formData.status.trim()) newErrors.status = "Product status is required"
    
    // Validate each product
    formData.products.forEach((product, index) => {
      if (!product.name.trim()) {
        newErrors[`product_${index}_name`] = "Product name is required"
      }
      if (!product.sku.trim()) {
        newErrors[`product_${index}_sku`] = "SKU is required"
      }
      if (!product.quantity.trim()) {
        newErrors[`product_${index}_quantity`] = "Quantity is required"
      }
      if (!product.purchase_price.trim()) {
        newErrors[`product_${index}_purchase_price`] = "Purchase price is required"
      }
      if (!product.sell_price.trim()) {
        newErrors[`product_${index}_sell_price`] = "Sell price is required"
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true)
      try {
        // Create products for each item in the products array
        // Strategy: upload receipt with first product, capture returned receipt_url,
        // reuse same receipt_url for all subsequent products (no re-upload).
        let sharedReceiptUrl: string | null = null
        for (let i = 0; i < formData.products.length; i++) {
          const product = formData.products[i]
          const productFormData = new FormData()

          productFormData.append('name', product.name)
          productFormData.append('sku', product.sku)
          productFormData.append('purchase_price', product.purchase_price)
          productFormData.append('sell_price', product.sell_price)
          productFormData.append('category', formData.category)
          productFormData.append('status', formData.status)
          productFormData.append('quantityInStock', product.quantity)
          productFormData.append('supplier', formData.supplier)
          if (formData.branch_name) productFormData.append('branch_name', formData.branch_name)
          if (formData.payment_method) productFormData.append('payment_method', formData.payment_method)

          // First product: attach file if present; others: pass receipt_url
          if (i === 0) {
            if (formData.receipt_file) productFormData.append('receipt', formData.receipt_file)
          } else if (sharedReceiptUrl) {
            productFormData.append('receipt_url', sharedReceiptUrl)
          }

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/products`, {
            method: 'POST',
            body: productFormData
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(errorText || 'Failed to create product')
          }

          const result = await response.json()
          console.log('Product created:', result)
          // Capture receipt_url from first response if available
          if (i === 0) {
            const created = result?.product
            if (created?.receipt_url) sharedReceiptUrl = created.receipt_url
          }
        }
        
        // Reset form after successful submission
        setFormData(initialFormData)
        setErrors({})
        
        // Close dialog (you might want to add a callback prop for this)
        window.location.reload() // Temporary solution to refresh the page
      } catch (error) {
        console.error('Error creating product:', error)
        setErrors({ supplier: 'Failed to create product. Please try again.' })
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
      <DialogContent className="p-7 px-8 poppins min-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[22px]">Add Product</DialogTitle>
          <DialogDescription>
            Fill in the form to add a new product.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 mt-1">
          {/* First row: Supplier, Category, Branch */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2 px-1">
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="branch_name">Branch</Label>
              <select
                id="branch_name"
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
          </div>

          {/* Product Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Products</h3>
              <Button
                type="button"
                onClick={addProductRow}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>

            {/* Product Items Table */}
            <div className="border rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-7 gap-4 p-3 bg-muted border-b font-medium text-sm">
                <div>Product</div>
                <div>SKU</div>
                <div>Qty</div>
                <div>Purchase Price</div>
                <div>Net Purchase Price</div>
                <div>Sell Price</div>
                <div className="text-center">Actions</div>
              </div>

              {/* Product Rows */}
              {formData.products.map((product, index) => (
                <div key={index} className="grid grid-cols-7 gap-4 p-3 border-b last:border-b-0">
                  <div className="flex flex-col gap-1">
                    <Input
                      placeholder="Product name..."
                      value={product.name}
                      onChange={(e) => handleProductChange(index, "name", e.target.value)}
                      className={errors[`product_${index}_name`] ? "border-red-500" : ""}
                    />
                    {errors[`product_${index}_name`] && (
                      <div className="text-xs text-red-500">
                        {errors[`product_${index}_name`]}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Input
                      placeholder="SKU..."
                      value={product.sku}
                      onChange={(e) => handleProductChange(index, "sku", e.target.value)}
                      className={errors[`product_${index}_sku`] ? "border-red-500" : ""}
                    />
                    {errors[`product_${index}_sku`] && (
                      <div className="text-xs text-red-500">
                        {errors[`product_${index}_sku`]}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Input
                      type="number"
                      placeholder="0"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                      className={errors[`product_${index}_quantity`] ? "border-red-500" : ""}
                    />
                    {errors[`product_${index}_quantity`] && (
                      <div className="text-xs text-red-500">
                        {errors[`product_${index}_quantity`]}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={product.purchase_price}
                      onChange={(e) => handleProductChange(index, "purchase_price", e.target.value)}
                      className={errors[`product_${index}_purchase_price`] ? "border-red-500" : ""}
                    />
                    {errors[`product_${index}_purchase_price`] && (
                      <div className="text-xs text-red-500">
                        {errors[`product_${index}_purchase_price`]}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={product.net_purchase_price}
                      readOnly
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    />
                    <div className="text-xs text-muted-foreground">
                      Auto-calculated
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={product.sell_price}
                      onChange={(e) => handleProductChange(index, "sell_price", e.target.value)}
                      className={errors[`product_${index}_sell_price`] ? "border-red-500" : ""}
                    />
                    {errors[`product_${index}_sell_price`] && (
                      <div className="text-xs text-red-500">
                        {errors[`product_${index}_sell_price`]}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <Button
                      type="button"
                      onClick={() => removeProductRow(index)}
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      disabled={formData.products.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation Row */}
            {/* <div className="border-t bg-gray-50">
              <div className="grid grid-cols-7 gap-4 p-3">
                <div className="col-span-5 font-medium text-sm text-gray-700">Product Totals:</div>
                <div className="text-sm text-gray-600">
                  {formData.products.map((product, index) => {
                    const total = (parseFloat(product.purchase_price) || 0) * (parseInt(product.quantity) || 0)
                    return (
                      <div key={index} className="text-right">
                        {product.name ? `₹${total.toFixed(2)}` : '₹0.00'}
                      </div>
                    )
                  })}
                </div>
                <div></div>
              </div>
            </div> */}

            {/* Subtotal Row */}
            <div className="border-t bg-muted/50">
              <div className="grid grid-cols-7 gap-4 p-3">
                <div className="col-span-5 font-semibold text-sm text-foreground">Subtotal:</div>
                <div className="text-sm font-semibold text-foreground text-right">
                  ₹{formData.products.reduce((sum, product) => {
                    const total = (parseFloat(product.purchase_price) || 0) * (parseInt(product.quantity) || 0)
                    return sum + total
                  }, 0).toFixed(2)}
                </div>
                <div></div>
              </div>
            </div>

            {/* Status, Payment Method, and Receipt Section */}
            <div className="mt-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Product Status */}
                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-foreground">
                    Product Status *
                  </Label>
                  <Select value={formData.status} onValueChange={(value: "partial_paid" | "paid" | "due") => handleInputChange('status', value)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue placeholder="Choose product status" />
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
                  {errors.status && <div className="text-xs text-red-500 mt-1">{errors.status}</div>}
                </div>

                {/* Receipt Upload (single for all products) */}
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Payment Receipt (Optional)
                  </Label>
                  <div className="mt-1">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="h-8 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {formData.receipt_file && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <IoCloudUpload className="w-3 h-3" />
                        {formData.receipt_file.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment Method (single for all products) */}
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Payment Method
                  </Label>
                  <div className="mt-1">
                    <Select 
                      value={formData.payment_method} 
                      onValueChange={(value) => handleInputChange('payment_method', value)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          <div className="flex items-center gap-2">
                            <IoCash className="w-3 h-3 text-green-600" />
                            Cash
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <IoCard className="w-3 h-3 text-blue-600" />
                            Card
                          </div>
                        </SelectItem>
                        <SelectItem value="upi">
                          <div className="flex items-center gap-2">
                            <IoWallet className="w-3 h-3 text-purple-600" />
                            UPI
                          </div>
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center gap-2">
                            <IoCard className="w-3 h-3 text-indigo-600" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                        <SelectItem value="cheque">
                          <div className="flex items-center gap-2">
                            <IoCard className="w-3 h-3 text-orange-600" />
                            Cheque
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        <DialogFooter className="mt-4 mb-0 flex items-center gap-4 flex-shrink-0">
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
