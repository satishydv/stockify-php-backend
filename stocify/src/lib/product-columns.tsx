"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product, getStatusBadge } from "./product-data"
import { useProductStore } from "@/stores/productStore"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IoCopy, IoCreate, IoTrash, IoEllipsisVertical, IoCash, IoCard, IoWallet, IoPrint } from "react-icons/io5"
import { useState } from "react"
import EditProductDialog from "@/components/EditProductDialog"
import { toast } from "sonner"

export const useProductColumns = () => {
  const { deleteProduct } = useProductStore()
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleCopy = (product: Product) => {
    const productData = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      purchase_price: product.purchase_price,
      sell_price: product.sell_price,
      category: product.category,
      status: product.status,
      quantityInStock: product.quantityInStock,
      supplier: product.supplier
    }
    
    navigator.clipboard.writeText(JSON.stringify(productData, null, 2))
    toast.success("Product data copied to clipboard")
  }

  const handleEdit = (product: Product) => {
    console.log('Editing product:', product)
    // Ensure we have a valid product object
    if (product && typeof product === 'object' && 'id' in product && 'name' in product && 'sku' in product) {
      setEditingProduct(product)
      setIsEditDialogOpen(true)
    } else {
      console.error('Invalid product object:', product)
      toast.error('Invalid product data')
    }
  }

  const handleCloseEditDialog = () => {
    setEditingProduct(null)
    setIsEditDialogOpen(false)
  }

  const handleDelete = async (product: Product) => {
    if (window.confirm(`Are you sure you want to delete product "${product.name}"?`)) {
      try {
        await deleteProduct(product.id)
        toast.success(`Product "${product.name}" deleted successfully`)
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error(error instanceof Error ? error.message : 'Network error. Please try again.')
      }
    }
  }

  const handlePrintBill = (product: Product) => {
    const formatCurrency = (value: number | string) => {
      const num = typeof value === 'string' ? parseFloat(value) : value
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num || 0)
    }

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return '-'
      const d = new Date(dateStr)
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yy = String(d.getFullYear()).slice(-2)
      return `${dd}/${mm}/${yy}`
    }

    const netPurchase = (product.quantityInStock || 0) * (Number(product.purchase_price) || 0)

    // Create a hidden iframe for printing
    const iframe = document.createElement('iframe')
    iframe.style.position = 'absolute'
    iframe.style.left = '-9999px'
    iframe.style.top = '-9999px'
    iframe.style.width = '800px'
    iframe.style.height = '600px'
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) {
      document.body.removeChild(iframe)
      toast.error('Unable to create print preview')
      return
    }

    doc.open()
    doc.write(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Product Bill - ${product.name}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, Helvetica, sans-serif; margin: 20px; color: #333; }
      .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
      .title { font-size: 24px; font-weight: bold; }
      .meta { color: #666; font-size: 14px; }
      .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 20px; }
      .info-section h4 { margin-bottom: 5px; color: #333; }
      .info-section p { color: #666; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
      th { background: #f5f5f5; font-weight: bold; }
      .right { text-align: right; }
      .totals { margin-top: 20px; display: flex; justify-content: flex-end; }
      .totals .box { min-width: 300px; }
      .totals table { margin-top: 0; }
      .totals td { border-bottom: none; }
      .total-row { font-weight: bold; font-size: 16px; }
      @media print {
        body { margin: 0; }
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="title">PURCHASE BILL</div>
      <div class="meta">Generated: ${formatDate(new Date().toISOString())}</div>
    </div>
    
    <div class="card">
      <div class="info-grid">
        <div class="info-section">
          <h4>Product Details</h4>
          <p><strong>Name:</strong> ${product.name}</p>
          <p><strong>SKU:</strong> ${product.sku}</p>
        </div>
        <div class="info-section">
          <h4>Supplier Details</h4>
          <p><strong>Supplier:</strong> ${product.supplier || '-'}</p>
          <p><strong>Category:</strong> ${product.category || '-'}</p>
        </div>
        <div class="info-section">
          <h4>Order Details</h4>
          <p><strong>Status:</strong> ${product.status.toUpperCase()}</p>
          <p><strong>Created:</strong> ${formatDate(product.createdAt)}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th class="right">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${product.name}</td>
            <td>${product.quantityInStock || 0}</td>
            <td>${formatCurrency(product.purchase_price)}</td>
            <td class="right">${formatCurrency(netPurchase)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="totals">
        <div class="box">
          <table>
            <tbody>
              <tr>
                <td><strong>Subtotal:</strong></td>
                <td class="right total-row">${formatCurrency(netPurchase)}</td>
              </tr>
              ${product.payment_method ? `<tr><td>Payment Method:</td><td class="right">${product.payment_method.toUpperCase()}</td></tr>` : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="no-print" style="text-align: center; margin-top: 20px;">
      <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Print Bill</button>
    </div>
  </body>
</html>
    `)
    doc.close()

    // Wait for content to load then print
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.print()
          // Clean up after printing
          setTimeout(() => {
            document.body.removeChild(iframe)
          }, 1000)
        } catch (error) {
          console.error('Print failed:', error)
          document.body.removeChild(iframe)
          toast.error('Print failed. Please try again.')
        }
      }, 500)
    }
  }

  const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg">{product.icon}</span>
          <span className="font-medium">{product.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "purchase_price",
    header: "Purchase Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("purchase_price"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(price)
      return <span className="font-medium">{formatted}</span>
    },
  },
  {
    accessorKey: "net_purchase_price",
    header: "Net Purchase Price",
    cell: ({ row }) => {
      const product = row.original
      const quantity = product.quantityInStock || 0
      const purchasePrice = parseFloat(product.purchase_price) || 0
      const netPrice = quantity * purchasePrice
      
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(netPrice)
      return <span className="font-medium text-blue-600">{formatted}</span>
    },
  },
  // {
  //   accessorKey: "sell_price",
  //   header: "Sell Price",
  //   cell: ({ row }) => {
  //     const price = parseFloat(row.getValue("sell_price"))
  //     const formatted = new Intl.NumberFormat("en-IN", {
  //       style: "currency",
  //       currency: "INR",
  //     }).format(price)
  //     return <span className="font-medium text-green-600">{formatted}</span>
  //   },
  // },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      return <span className="text-muted-foreground">{row.getValue("category")}</span>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Product["status"]
      return getStatusBadge(status)
    },
  },
  {
    accessorKey: "quantityInStock",
    header: "Quantity In Stock",
    cell: ({ row }) => {
      return <span className="font-medium">{row.getValue("quantityInStock")}</span>
    },
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: ({ row }) => {
      return <span className="text-muted-foreground">{row.getValue("supplier")}</span>
    },
  },
  {
    accessorKey: "branch_name",
    header: "Branch",
    cell: ({ row }) => {
      const branchName = row.getValue("branch_name") as string
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg">🏢</span>
          <span className="text-muted-foreground">{branchName || "No Branch"}</span>
        </div>
      )
    },
  },
  // {
  //   accessorKey: "payment_method",
  //   header: "Payment Method",
  //   cell: ({ row }) => {
  //     const paymentMethod = row.getValue("payment_method") as string
  //     if (!paymentMethod) return <span className="text-muted-foreground">-</span>
  //     
  //     const getPaymentIcon = (method: string) => {
  //       switch (method) {
  //         case 'cash': return <IoCash className="w-4 h-4 text-green-600" />
  //         case 'card': return <IoCard className="w-4 h-4 text-blue-600" />
  //         case 'upi': return <IoWallet className="w-4 h-4 text-purple-600" />
  //         case 'bank_transfer': return <IoCard className="w-4 h-4 text-indigo-600" />
  //         case 'cheque': return <IoCard className="w-4 h-4 text-orange-600" />
  //         default: return null
  //       }
  //     }
  //     
  //     const getPaymentLabel = (method: string) => {
  //       switch (method) {
  //         case 'cash': return 'Cash'
  //         case 'card': return 'Card'
  //         case 'upi': return 'UPI'
  //         case 'bank_transfer': return 'Bank Transfer'
  //         case 'cheque': return 'Cheque'
  //         default: return method
  //       }
  //     }
  //     
  //     return (
  //       <div className="flex items-center gap-2">
  //         {getPaymentIcon(paymentMethod)}
  //         <span className="text-sm">{getPaymentLabel(paymentMethod)}</span>
  //       </div>
  //     )
  //   },
  // },
  // {
  //   accessorKey: "receipt_url",
  //   header: "Receipt",
  //   cell: ({ row }) => {
  //     const receiptUrl = row.getValue("receipt_url") as string
  //     if (!receiptUrl) return <span className="text-muted-foreground">-</span>
  //     
  //     return (
  //       <Button
  //         variant="outline"
  //         size="sm"
  //         onClick={() => window.open(receiptUrl, '_blank')}
  //         className="h-8 text-xs"
  //       >
  //         View Receipt
  //       </Button>
  //     )
  //   },
  // },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      if (!date) return <span className="text-muted-foreground">-</span>
      
      const dateObj = new Date(date)
      const day = dateObj.getDate().toString().padStart(2, '0')
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
      const year = dateObj.getFullYear().toString().slice(-2)
      
      const formattedDate = `${day}/${month}/${year}`
      
      return <span className="text-muted-foreground text-sm">{formattedDate}</span>
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const product = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <IoEllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuItem onClick={() => handleCopy(product)}>
              <IoCopy className="mr-2 h-4 w-4" />
              Copy
            </DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => handleEdit(product)}>
              <IoCreate className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(product)} className="text-red-600">
              <IoTrash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  {
    id: "print",
    header: "Print",
    cell: ({ row }) => {
      const product = row.original
      return (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePrintBill(product)}
          className="h-8 text-xs"
          title={'Print bill'}
        >
          <IoPrint className="mr-1 h-4 w-4" />
          Print
        </Button>
      )
    },
  },
  ]

  return {
    columns,
    editDialog: editingProduct && isEditDialogOpen ? (
      <EditProductDialog
        product={editingProduct}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
      />
    ) : null
  }
}
