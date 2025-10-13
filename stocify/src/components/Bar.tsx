"use client"

import React, { useEffect, useState } from 'react'
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"

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

export const description = "A bar chart showing monthly sales data"

interface MonthlySalesData {
  month: string
  sales: number
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function ChartBarLabel() {
  const [chartData, setChartData] = useState<MonthlySalesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getMonthlySales()
        if (response.success) {
          setChartData(response.data)
        } else {
          setError('Failed to fetch monthly sales data')
        }
      } catch (err) {
        console.error('Error fetching monthly sales:', err)
        setError('Error loading monthly sales data')
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlySales()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>Loading sales data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-gray-500">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-red-500">{error}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0)
  const currentMonthSales = chartData[chartData.length - 1]?.sales || 0
  const previousMonthSales = chartData[chartData.length - 2]?.sales || 0
  const growthPercentage = previousMonthSales > 0 
    ? ((currentMonthSales - previousMonthSales) / previousMonthSales * 100).toFixed(1)
    : '0.0'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sales</CardTitle>
        <CardDescription>Total sales over the last 12 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                hideLabel 
                formatter={(value) => [
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(Number(value)),
                  'Sales'
                ]}
              />}
            />
            <Bar dataKey="sales" fill="var(--color-sales)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={(value) => 
                  new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(Number(value))
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {parseFloat(growthPercentage) >= 0 ? (
            <>
              Trending up by {growthPercentage}% this month <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Trending down by {Math.abs(parseFloat(growthPercentage))}% this month <TrendingUp className="h-4 w-4 rotate-180" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Total sales: {new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
          }).format(totalSales)}
        </div>
      </CardFooter>
    </Card>
  )
}
