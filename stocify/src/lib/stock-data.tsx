"use client"

import { Badge } from "@/components/ui/badge"
import { IoCheckmark, IoClose as IoCloseIcon, IoTime, IoAlert } from "react-icons/io5"

export type Stock = {
  id: number
  sku: string
  productName: string
  category: string
  quantityAvailable: number
  minimumStockLevel: number
  maximumStockLevel: number
  status: "draft" | "published" | "inactive" | "active"
  purchase_price: number
  supplier: string
  lastUpdated: string
  createdAt: string
}

export const getStockStatusBadge = (status: Stock["status"]) => {
  switch (status) {
    case "published":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <IoCheckmark className="w-3 h-3 mr-1" />
          Published
        </Badge>
      )
    case "active":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <IoCheckmark className="w-3 h-3 mr-1" />
          Active
        </Badge>
      )
    case "inactive":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          <IoCloseIcon className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      )
    case "draft":
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
          <IoTime className="w-3 h-3 mr-1" />
          Draft
        </Badge>
      )
    default:
      return null
  }
}
