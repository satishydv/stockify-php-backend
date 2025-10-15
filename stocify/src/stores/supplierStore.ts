"use client"

import { create } from "zustand"
import { Supplier } from "@/lib/supplier-data"
import { apiClient } from "@/lib/api"

interface SupplierStore {
  suppliers: Supplier[]
  isLoading: boolean
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => Promise<void>
  deleteSupplier: (id: string) => void
  updateSupplier: (id: string, updates: Partial<Supplier>) => void
  fetchSuppliers: () => Promise<void>
  setSuppliers: (suppliers: Supplier[]) => void
}

export const useSupplierStore = create<SupplierStore>((set, get) => ({
  suppliers: [],
  isLoading: false,
  
  addSupplier: async (newSupplier) => {
    set({ isLoading: true })
    try {
      const result = await apiClient.createSupplier({
        name: newSupplier.name,
        email: newSupplier.email,
        phone: newSupplier.phone,
        companyLocation: newSupplier.companyLocation,
        gstin: newSupplier.gstin,
        category: newSupplier.category,
        website: newSupplier.website,
        status: newSupplier.status
      })
      set((state) => ({
        suppliers: [...state.suppliers, result.supplier],
        isLoading: false
      }))
    } catch (error) {
      console.error('Error creating supplier:', error)
      try { await get().fetchSuppliers() } catch {}
      set({ isLoading: false })
      throw error
    }
  },
  
  deleteSupplier: (id) => set((state) => ({
    suppliers: state.suppliers.filter((supplier) => supplier.id !== id)
  })),
  
  updateSupplier: (id, updates) => set((state) => ({
    suppliers: state.suppliers.map((supplier) =>
      supplier.id === id
        ? { ...supplier, ...updates, updatedAt: new Date().toISOString().split('T')[0] }
        : supplier
    )
  })),
  
  fetchSuppliers: async () => {
    set({ isLoading: true })
    try {
      const result = await apiClient.getSuppliers()
      set({ suppliers: result.suppliers, isLoading: false })
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      set({ isLoading: false })
    }
  },

  setSuppliers: (suppliers) => set({ suppliers })
}))
