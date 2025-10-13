"use client"

import React, { useEffect, useState } from 'react'
import { TrendingUp } from "lucide-react"
import { LabelList, RadialBar, RadialBarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { apiClient } from "@/lib/api"

export const description = "A radial chart showing payment methods distribution"

interface PaymentMethodData {
  method: string
  count: number
  total: number
  fill: string
}

const chartConfig = {
  count: {
    label: "Orders",
  },
  cash: {
    label: "Cash",
    color: "var(--chart-1)",
  },
  card: {
    label: "Card",
    color: "var(--chart-2)",
  },
  upi: {
    label: "UPI",
    color: "var(--chart-3)",
  },
  "bank transfer": {
    label: "Bank Transfer",
    color: "var(--chart-4)",
  },
  cheque: {
    label: "Cheque",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function ChartRadialLabel() {
  const [chartData, setChartData] = useState<PaymentMethodData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getPaymentMethods()
        if (response.success) {
          setChartData(response.data)
        } else {
          setError('Failed to fetch payment methods data')
        }
      } catch (err) {
        console.error('Error fetching payment methods:', err)
        setError('Error loading payment methods data')
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Loading payment data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-red-500">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalOrders = chartData.reduce((sum, item) => sum + item.count, 0)
  const totalAmount = chartData.reduce((sum, item) => sum + item.total, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Distribution of payment methods</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={120}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                nameKey="method"
                formatter={(value, name) => [
                  `${value} orders`,
                  name
                ]}
              />}
            />
            <RadialBar dataKey="count" background>
              <LabelList
                position="insideStart"
                dataKey="method"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={10}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total orders: {totalOrders.toLocaleString()} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total amount: {new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
          }).format(totalAmount)}
        </div>
      </CardFooter>
    </Card>
  )
}
