"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductTable } from '@/components/ProductTable'
import ProductDialog from '@/components/ProductDialog'
import { useProductStore } from '@/stores/productStore'

const page = () => {
  const { products } = useProductStore()
  
  return (
    <Card className="mt-1 flex flex-col shadow-none poppins border-none">
      <CardHeader className="flex justify-between p-2">
        <div className="flex justify-between items-center">
          <div className="">
            <CardTitle className="font-bold text-[23px]">Products</CardTitle>
            <p className="text-sm text-slate-600">{products.length} products</p>
          </div>
        </div>
        <ProductDialog />
      </CardHeader>
      <CardContent>
        <ProductTable />
      </CardContent>
    </Card>
  )
}

export default page