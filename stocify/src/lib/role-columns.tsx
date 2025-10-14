"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Role, getRoleTypeBadge, moduleNames } from "./role-data"
import { useRoleStore } from "@/stores/roleStore"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IoCreate, IoTrash, IoEllipsisVertical } from "react-icons/io5"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { useState } from "react"
import EditRoleDialog from "@/components/EditRoleDialog"
import DeletedRecordsDialog from "@/components/DeletedRecordsDialog"
import { usePermissions } from "@/hooks/usePermissions"

export const useRoleColumns = () => {
  const { deleteRole, updateRolePermissions, fetchRoles } = useRoleStore()
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { canUpdate, canDelete } = usePermissions()

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (role: Role) => {
    if (window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      try {
        await deleteRole(role.id)
        toast.success(`Role "${role.name}" deleted successfully`)
      } catch (error) {
        console.error('Error deleting role:', error)
        toast.error(error instanceof Error ? error.message : 'Network error. Please try again.')
      }
    }
  }

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Role Name",
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => <span>{row.original.createdAt}</span>,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => <span>{row.original.updatedAt}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original
        const hasEditPermission = canUpdate('roles')
        const hasDeletePermission = canDelete('roles')
        
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
              {hasEditPermission && (
                <DropdownMenuItem onClick={() => handleEdit(role)}>
                  <IoCreate className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {hasDeletePermission && (
                <DropdownMenuItem onClick={() => handleDelete(role)} className="text-red-600">
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
      <EditRoleDialog
        role={editingRole}
        isOpen={isEditDialogOpen}
        onClose={() => { setEditingRole(null); setIsEditDialogOpen(false) }}
      />
    ),
    deletedRecordsDialog: (
      <DeletedRecordsDialog table="roles" tableName="Role">
        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
          <IoTrash className="mr-2 h-4 w-4" />
          View Deleted
        </Button>
      </DeletedRecordsDialog>
    )
  }
}
