import { create } from 'zustand'
import { Order } from '@/lib/order-data'
import { apiClient } from '@/lib/api'

interface OrderStore {
  orders: Order[]
  loading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  addOrder: (order: Omit<Order, 'id'>) => Promise<void>
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>
  deleteOrder: (id: string) => Promise<void>
  getOrder: (id: string) => Order | undefined
}

// No initial dummy data - all data comes from API/database

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  loading: false,
  error: null,
  
  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const data = await apiClient.getOrders()
      set({ orders: data.orders, loading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },
  
  addOrder: async (newOrder) => {
    set({ loading: true, error: null })
    try {
      const data = await apiClient.createOrder(newOrder)
      set((state) => ({
        orders: [...state.orders, data.order],
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },
  
  updateOrder: async (id, updatedOrder) => {
    set({ loading: true, error: null })
    try {
      const data = await apiClient.updateOrder(id, updatedOrder)
      set((state) => ({
        orders: state.orders.map(order => 
          order.id === id ? data.order : order
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },
  
  deleteOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      await apiClient.deleteOrder(id)
      set((state) => ({
        orders: state.orders.filter(order => order.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false })
    }
  },
  
  getOrder: (id) => {
    return get().orders.find(order => order.id === id)
  }
}))
