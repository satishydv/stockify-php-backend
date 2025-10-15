"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { 
  ShoppingCart, 
  Truck, 
  Package, 
  UserPlus, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { ChartPieDonutText } from "@/components/Pie"
import { ChartBarLabel } from "@/components/Bar"
import { ChartRadialLabel } from "@/components/Area"

interface DashboardStats {
  totalSalesToday: {
    value: number
    change: number
    label: string
  }
  totalSuppliers: {
    value: number
    change: number
    label: string
  }
  totalProducts: {
    value: number
    change: number
    label: string
  }
  newCustomersToday: {
    value: number
    change: number
    label: string
  }
  totalCustomers: {
    value: number
    change: number
    label: string
  }
  totalPurchaseToday: {
    value: number
    change: number
    label: string
  }
}

interface StatCardProps {
  title: string
  value: number | string
  change: number
  icon: React.ReactNode
  isCurrency?: boolean
  cardColor?: 'blue' | 'green' | 'orange' | 'purple' | 'teal' | 'indigo'
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, isCurrency = false, cardColor = 'blue' }) => {
  const formatValue = (val: number | string) => {
    if (isCurrency) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(Number(val))
    }
    return new Intl.NumberFormat('en-IN').format(Number(val))
  }

  const isPositive = change >= 0
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600'
  const changeIcon = isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />

  // Define card colors and text colors
  const getCardStyles = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          iconBg: 'bg-blue-400',
          changeText: 'text-blue-100',
          chartColor: 'bg-blue-300'
        }
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          iconBg: 'bg-green-400',
          changeText: 'text-green-100',
          chartColor: 'bg-green-300'
        }
      case 'orange':
        return {
          bg: 'bg-orange-500',
          text: 'text-white',
          iconBg: 'bg-orange-400',
          changeText: 'text-orange-100',
          chartColor: 'bg-orange-300'
        }
      case 'purple':
        return {
          bg: 'bg-purple-500',
          text: 'text-white',
          iconBg: 'bg-purple-400',
          changeText: 'text-purple-100',
          chartColor: 'bg-purple-300'
        }
      case 'teal':
        return {
          bg: 'bg-teal-500',
          text: 'text-white',
          iconBg: 'bg-teal-400',
          changeText: 'text-teal-100',
          chartColor: 'bg-teal-300'
        }
      case 'indigo':
        return {
          bg: 'bg-indigo-500',
          text: 'text-white',
          iconBg: 'bg-indigo-400',
          changeText: 'text-indigo-100',
          chartColor: 'bg-indigo-300'
        }
      default: // blue fallback
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          iconBg: 'bg-blue-400',
          changeText: 'text-blue-100',
          chartColor: 'bg-blue-300'
        }
    }
  }

  const styles = getCardStyles(cardColor)

  return (
    <Card className={`relative overflow-hidden border-0 ${styles.bg} ${styles.text}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-white/90">
          {title}
        </CardTitle>
        <div className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full ${styles.iconBg} flex items-center justify-center`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-xl sm:text-2xl font-bold ${styles.text} mb-1`}>
          {formatValue(value)}
        </div>
        <div className="flex items-center text-[10px] sm:text-xs">
          <span className="flex items-center gap-1 text-white/80">
            {changeIcon}
            {Math.abs(change)}%
          </span>
          <span className={`ml-2 ${styles.changeText}`}>from last month</span>
        </div>
        {/* Mini chart placeholder (hide on very small screens) */}
        <div className="hidden sm:flex absolute bottom-2 right-2 items-end gap-1 h-8">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-t ${
                i === 6 ? 'bg-white/60' : styles.chartColor
              }`}
              style={{ height: `${Math.random() * 20 + 8}px` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getDashboardStatistics()
        if (response.success) {
          setStats(response.statistics)
        } else {
          setError('Failed to fetch dashboard statistics')
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
        setError('Error loading dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-3 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-orange-400">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-blue-400">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <StatCard
          title="Total Sales Today"
          value={stats.totalSalesToday.value}
          change={stats.totalSalesToday.change}
          icon={<ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
          isCurrency={true}
          cardColor="blue"
        />
        
        <StatCard
          title="Total Suppliers"
          value={stats.totalSuppliers.value}
          change={stats.totalSuppliers.change}
          icon={<Truck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
          cardColor="green"
        />
        
        <StatCard
          title="Total Products"
          value={stats.totalProducts.value}
          change={stats.totalProducts.change}
          icon={<Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
          cardColor="purple"
        />
        
        <StatCard
          title="New Customers Today"
          value={stats.newCustomersToday.value}
          change={stats.newCustomersToday.change}
          icon={<UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
          cardColor="orange"
        />
        
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers.value}
          change={stats.totalCustomers.change}
          icon={<Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
          cardColor="teal"
        />
        
        <StatCard
          title="Total Purchase Today"
          value={stats.totalPurchaseToday.value}
          change={stats.totalPurchaseToday.change}
          icon={<DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
          isCurrency={true}
          cardColor="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
        {/* Bar chart: allow horizontal scroll on small screens so full content is visible */}
        <div className="w-full overflow-x-auto sm:overflow-visible max-w-full -mx-3 sm:mx-0 px-3">
          <div className="min-w-[560px] sm:min-w-0">
            <ChartBarLabel/>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="w-full overflow-hidden sm:overflow-visible max-w-full">
            <ChartRadialLabel/>
          </div>
          <div className="w-full overflow-hidden sm:overflow-visible max-w-full">
            <ChartPieDonutText/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage