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

export const useRoleColumns = () => {
  const { deleteRole, updateRolePermissions, fetchRoles } = useRoleStore()
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Minimal columns for Roles page: id, role name, createdAt, updatedAt
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
  ]

  return {
    columns,
    editDialog: (
      <EditRoleDialog
        role={editingRole}
        isOpen={isEditDialogOpen}
        onClose={() => { setEditingRole(null); setIsEditDialogOpen(false) }}
      />
    )
  }
}
