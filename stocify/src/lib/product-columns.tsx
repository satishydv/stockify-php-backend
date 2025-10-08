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
import { IoCopy, IoCreate, IoTrash, IoEllipsisVertical } from "react-icons/io5"
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
    accessorKey: "sell_price",
    header: "Sell Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("sell_price"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(price)
      return <span className="font-medium text-green-600">{formatted}</span>
    },
  },
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
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string
      if (!date) return <span className="text-muted-foreground">-</span>
      
      const formattedDate = new Date(date).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
      
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
