"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BranchTable } from '@/components/BranchTable'
import BranchDialog from '@/components/BranchDialog'
import { useBranchStore } from '@/stores/branchStore'

const page = () => {
  const { branches } = useBranchStore()
  
  return (
    <Card className="mt-1 flex flex-col shadow-none poppins border-none">
      <CardHeader className="flex justify-between p-2">
        <div className="flex justify-between items-center">
          <div className="">
            <CardTitle className="font-bold text-[23px]">Branches</CardTitle>
            <p className="text-sm text-slate-600">{branches.length} branches</p>
          </div>
        </div>
        <BranchDialog />
      </CardHeader>
      <CardContent>
        <BranchTable />
      </CardContent>
    </Card>
  )
}

export default page
