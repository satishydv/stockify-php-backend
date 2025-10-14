"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Branch, getStatusBadge } from "./branch-data"
import { useBranchStore } from "@/stores/branchStore"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IoCopy, IoCreate, IoTrash, IoEllipsisVertical } from "react-icons/io5"
import { useState } from "react"
import EditBranchDialog from "@/components/EditBranchDialog"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/usePermissions"

export const useBranchColumns = () => {
  const { deleteBranch } = useBranchStore()
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { canUpdate, canDelete } = usePermissions()

  const handleCopy = (branch: Branch) => {
    const branchData = {
      id: branch.id,
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      status: branch.status
    }
    
    navigator.clipboard.writeText(JSON.stringify(branchData, null, 2))
    toast.success("Branch data copied to clipboard")
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setIsEditDialogOpen(true)
  }

  const handleCloseEditDialog = () => {
    setEditingBranch(null)
    setIsEditDialogOpen(false)
  }

  const handleDelete = async (branch: Branch) => {
    if (window.confirm(`Are you sure you want to delete branch "${branch.name}"?`)) {
      try {
        await deleteBranch(branch.id)
        toast.success(`Branch "${branch.name}" deleted successfully`)
      } catch (error) {
        console.error('Error deleting branch:', error)
        toast.error(error instanceof Error ? error.message : 'Network error. Please try again.')
      }
    }
  }

  const columns: ColumnDef<Branch>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const branch = row.original
        return (
          <div className="flex items-center gap-2">
            <span className="text-lg">🏢</span>
            <span className="font-medium">{branch.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.getValue("address") as string
        return (
          <div className="max-w-xs">
            <span className="text-muted-foreground text-sm line-clamp-2">{address}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        return <span className="text-muted-foreground">{row.getValue("phone")}</span>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Branch["status"]
        return getStatusBadge(status)
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string
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
        const branch = row.original
        const hasEditPermission = canUpdate('branch')
        const hasDeletePermission = canDelete('branch')
        
        // Don't show actions column if user has no permissions
        if (!hasEditPermission && !hasDeletePermission) {
          return null
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IoEllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuItem onClick={() => handleCopy(branch)}>
                <IoCopy className="mr-2 h-4 w-4" />
                Copy
              </DropdownMenuItem> */}
              {hasEditPermission && (
                <DropdownMenuItem onClick={() => handleEdit(branch)}>
                  <IoCreate className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {hasDeletePermission && (
                <DropdownMenuItem onClick={() => handleDelete(branch)} className="text-red-600">
                  <IoTrash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return {
    columns,
    editDialog: (
      <EditBranchDialog
        branch={editingBranch}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
      />
    )
  }
}
