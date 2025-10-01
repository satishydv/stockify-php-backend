"use client"

import React, { useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { IoClose } from "react-icons/io5"
import { DataTable } from "@/components/DataTable"
import { useBranchColumns } from "@/lib/branch-columns"
import { useFilterStore } from "@/stores/filterStore"
import { useBranchStore } from "@/stores/branchStore"

function FilterArea() {
  return (
    <div className="flex gap-3">
      {/* status */}
      <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
        <span className="text-gray-600">Status</span>
        <Separator orientation="vertical" />
        <div className="flex gap-2 items-center">
          <Badge variant={"secondary"}>Active</Badge>
          <Badge variant={"secondary"}>Inactive</Badge>
        </div>
      </div>
      <Button variant={"ghost"} className="p-1 px-2">
        <span>Reset</span>
        <IoClose />
      </Button>
    </div>
  )
}

export function BranchTable() {
  const { branches, loading, error, fetchBranches } = useBranchStore()
  const { searchQuery, setSearchQuery } = useFilterStore()
  const { columns: branchColumns, editDialog } = useBranchColumns()

  // Fetch branches on component mount
  useEffect(() => {
    fetchBranches()
  }, [fetchBranches])

  // Filter branches based on search query
  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.phone.includes(searchQuery)
  )

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading branches...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error: {error}</div>
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-8 mt-6">
        <div className="flex items-center justify-between">
          <Input 
            placeholder="Search by name, address, or phone..." 
            className="max-w-sm h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* filter area */}
        <FilterArea />
      </div>
      {/* Branches table */}
      <DataTable columns={branchColumns} data={filteredBranches} />
      
      {/* Edit Dialog */}
      {editDialog}
    </div>
  )
}
