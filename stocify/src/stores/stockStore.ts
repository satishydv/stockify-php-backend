import { create } from 'zustand'
import { Stock } from '@/lib/stock-data'
import { apiClient } from '@/lib/api'

interface StockStore {
  stocks: Stock[]
  loading: boolean
  error: string | null
  fetchStocks: () => Promise<void>
  addStock: (stock: Omit<Stock, 'id' | 'lastUpdated' | 'createdAt'>) => Promise<void>
  updateStock: (id: number, stock: Partial<Stock>) => Promise<void>
  deleteStock: (id: number) => Promise<void>
  getStock: (id: number) => Stock | undefined
}

export const useStockStore = create<StockStore>((set, get) => ({
  stocks: [],
  loading: false,
  error: null,
  
  fetchStocks: async () => {
    set({ loading: true, error: null })
    try {
      const data = await apiClient.getStocks()
      set({ stocks: data.stock, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },
  
  addStock: async (newStock) => {
    set({ loading: true, error: null })
    try {
      const data = await apiClient.createStock(newStock)
      set((state) => ({
        stocks: [...state.stocks, data.stock],
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
        stocks: state.stocks.map(stock => 
          stock.id === id ? data.stock : stock
        ),
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
