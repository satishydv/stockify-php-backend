"use client"

import { create } from "zustand"
import { apiClient } from "@/lib/api"
import { Product } from "@/lib/product-data"
import { Stock } from "@/lib/stock-data"

interface StockStore {
  stocks: Stock[]
  productsFromStock: Product[]
  loading: boolean
  error: string | null
  fetchStocks: () => Promise<void>
  fetchStocksAsProducts: () => Promise<void>
  addStock: (stock: Omit<Stock, 'id' | 'lastUpdated' | 'createdAt'>) => Promise<void>
  updateStock: (id: number, stock: Partial<Stock>) => Promise<void>
  deleteStock: (id: number) => Promise<void>
  getStock: (id: number) => Stock | undefined
}

export const useStockStore = create<StockStore>((set, get) => ({
  stocks: [],
  productsFromStock: [],
  loading: false,
  error: null,

  fetchStocks: async () => {
    set({ loading: true, error: null })
    try {
      const data = await apiClient.getStocks()
      set({ stocks: data.stocks || data.stock || [], loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  fetchStocksAsProducts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.getStocks()
      const mapped: Product[] = (response.stocks || response.stock || []).map((s: any) => ({
        id: String(s.id),
        name: s.productName,
        sku: s.sku,
        purchase_price: Number(s.purchase_price) || 0,
        sell_price: Number(s.sell_price ?? 0) || 0,
        category: s.category,
        status: s.status,
        quantityInStock: Number(s.quantityAvailable) || 0,
        supplier: s.supplier || "",
        icon: "📦",
      }))
      set({ productsFromStock: mapped, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch stocks', loading: false })
    }
  },

  addStock: async (newStock) => {
    set({ loading: true, error: null })
    try {
      const data = await apiClient.createStock(newStock)
      set((state) => ({
        stocks: [...state.stocks, data.stock || data.data],
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  updateStock: async (id, updatedStock) => {
    set({ loading: true, error: null })
    try {
      const data = await apiClient.updateStock(id, updatedStock)
      set((state) => ({
        stocks: state.stocks.map(stock => stock.id === id ? (data.stock || data.data) : stock),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  deleteStock: async (id) => {
    set({ loading: true, error: null })
    try {
      await apiClient.deleteStock(id)
      set((state) => ({
        stocks: state.stocks.filter(stock => stock.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },

  getStock: (id) => {
    return get().stocks.find(stock => stock.id === id)
  }
}))
