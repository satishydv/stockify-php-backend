"use client"

import * as React from "react"
import { useEffect, useState } from 'react'
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"

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

export const description = "A donut chart showing sales by category"

interface CategorySalesData {
  category: string
  sales: number
  orders: number
  fill: string
}

const chartConfig = {
  sales: {
    label: "Sales",
  },
  electronics: {
    label: "Electronics",
    color: "var(--chart-1)",
  },
  clothing: {
    label: "Clothing",
    color: "var(--chart-2)",
  },
  books: {
    label: "Books",
    color: "var(--chart-3)",
  },
  home: {
    label: "Home",
    color: "var(--chart-4)",
  },
  sports: {
    label: "Sports",
    color: "var(--chart-5)",
  },
  other: {
    label: "Other",
    color: "var(--chart-6)",
  },
} satisfies ChartConfig

export function ChartPieDonutText() {
  const [chartData, setChartData] = useState<CategorySalesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategorySales = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getCategorySales()
        if (response.success) {
          setChartData(response.data)
        } else {
          setError('Failed to fetch category sales data')
        }
      } catch (err) {
        console.error('Error fetching category sales:', err)
        setError('Error loading category sales data')
      } finally {
        setLoading(false)
      }
    }

    fetchCategorySales()
  }, [])

  const totalSales = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.sales, 0)
  }, [chartData])

  const totalOrders = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.orders, 0)
  }, [chartData])

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>Loading category data...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[300px]">
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
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-red-500">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Sales by Category</CardTitle>
        <CardDescription>Distribution of sales across categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                formatter={(value, name) => [
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(Number(value)),
                  name
                ]}
              />}
            />
            <Pie
              data={chartData}
              dataKey="sales"
              nameKey="category"
              innerRadius={70}
              strokeWidth={50}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(totalSales)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-sm"
                        >
                          Total Sales
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total orders: {totalOrders.toLocaleString()} <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing sales distribution across {chartData.length} categories
        </div>
      </CardFooter>
    </Card>
  )
}
