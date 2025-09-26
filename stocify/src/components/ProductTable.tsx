"use client"

import React, { useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { IoClose } from "react-icons/io5"
import { StatusDropdown } from "@/components/StatusDropdown"
import { CategoryDropdown } from "@/components/CategoryDropdown"
import { DataTable } from "@/components/DataTable"
import { useProductColumns } from "@/lib/product-columns"
import { useFilteredProducts } from "@/hooks/useFilteredProducts"
import { useFilterStore } from "@/stores/filterStore"
import { useProductStore } from "@/stores/productStore"

function FilterArea() {
  return (
    <div className="flex gap-3">
      {/* status */}
      <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
        <span className="text-gray-600">Status</span>
        <Separator orientation="vertical" />
        <div className="flex gap-2 items-center">
          <Badge variant={"secondary"}>item 1</Badge>
          <Badge variant={"secondary"}>item 1</Badge>
        </div>
      </div>
      {/* category */}
      <div className="border-dashed border rounded-sm p-1 flex gap-2 items-center px-2 text-sm">
        <span className="text-gray-600">Category</span>
        <Separator orientation="vertical" />
        <div className="flex gap-2 items-center">
          <Badge variant={"secondary"}>item 1</Badge>
          <Badge variant={"secondary"}>item 1</Badge>
        </div>
      </div>
      <Button variant={"ghost"} className="p-1 px-2">
        <span>Reset</span>
        <IoClose />
      </Button>
    </div>
  )
}

export function ProductTable() {
  const { products, loading, error, fetchProducts } = useProductStore()
  const filteredProducts = useFilteredProducts()
  const { searchQuery, setSearchQuery } = useFilterStore()
  const { columns: productColumns, editDialog } = useProductColumns()

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading products...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">Error: {error}</div>
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-8 mt-6">
        <div className="flex items-center justify-between">
          <Input 
            placeholder="Search by name..." 
            className="max-w-sm h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <StatusDropdown />
            <CategoryDropdown />
          </div>
        </div>
        {/* filter area */}
        <FilterArea />
      </div>
      {/* Products table */}
      <DataTable columns={productColumns} data={filteredProducts} />
      
      {/* Edit Dialog */}
      {editDialog}
    </div>
  )
}
