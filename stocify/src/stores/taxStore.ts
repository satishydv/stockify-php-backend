import { create } from 'zustand'

export interface Tax {
  id: number
  name: string
  code: string
  rate: number
  status: 'enable' | 'disable'
  created_at: string
  updated_at: string
}

interface TaxStore {
  taxes: Tax[]
  loading: boolean
  error: string | null
  fetchTaxes: () => Promise<void>
  createTax: (tax: Omit<Tax, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  updateTax: (id: number, tax: Partial<Omit<Tax, 'id' | 'created_at' | 'updated_at'>>) => Promise<boolean>
  deleteTax: (id: number) => Promise<boolean>
  toggleTaxStatus: (id: number, status: 'enable' | 'disable') => Promise<boolean>
  bulkUpdateStatus: (status: 'enable' | 'disable') => Promise<boolean>
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/index.php/api/taxes`

export const useTaxStore = create<TaxStore>((set, get) => ({
  taxes: [],
  loading: false,
  error: null,

  fetchTaxes: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(API_BASE_URL)
      const data = await response.json()
      
      if (data.success) {
        set({ taxes: data.data, loading: false })
      } else {
        set({ error: data.message, loading: false })
      }
    } catch (error) {
      set({ error: 'Failed to fetch taxes', loading: false })
    }
  },

  createTax: async (tax) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tax),
      })
      
      const data = await response.json()
      
      if (data.success) {
        set((state) => ({
          taxes: [...state.taxes, data.data],
          loading: false
        }))
        return true
      } else {
        set({ error: data.message, loading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Failed to create tax', loading: false })
      return false
    }
  },

  updateTax: async (id, tax) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tax),
      })
      
      const data = await response.json()
      
      if (data.success) {
        set((state) => ({
          taxes: state.taxes.map(t => t.id === id ? data.data : t),
          loading: false
        }))
        return true
      } else {
        set({ error: data.message, loading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Failed to update tax', loading: false })
      return false
    }
  },

  deleteTax: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        set((state) => ({
          taxes: state.taxes.filter(t => t.id !== id),
          loading: false
        }))
        return true
      } else {
        set({ error: data.message, loading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Failed to delete tax', loading: false })
      return false
    }
  },

  toggleTaxStatus: async (id, status) => {
    return get().updateTax(id, { status })
  },

  bulkUpdateStatus: async (status) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/bulk-update-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update all taxes in the store with the new status
        set((state) => ({
          taxes: state.taxes.map(tax => ({ ...tax, status })),
          loading: false
        }))
        return true
      } else {
        set({ error: data.message, loading: false })
        return false
      }
    } catch (error) {
      set({ error: 'Failed to update tax statuses', loading: false })
      return false
    }
  },
}))
