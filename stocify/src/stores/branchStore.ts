import { create } from 'zustand'
import { Branch } from '@/lib/branch-data'
import { apiClient } from '@/lib/api'

interface BranchStore {
  branches: Branch[]
  loading: boolean
  error: string | null
  fetchBranches: () => Promise<void>
  addBranch: (branch: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateBranch: (id: number, branch: Partial<Branch>) => Promise<void>
  deleteBranch: (id: number) => Promise<void>
  getBranch: (id: number) => Branch | undefined
}

export const useBranchStore = create<BranchStore>((set, get) => ({
  branches: [],
  loading: false,
  error: null,
  
  fetchBranches: async () => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.getBranches()
      set({ branches: response.branches || [], loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch branches', loading: false })
      console.error('Error fetching branches:', error)
    }
  },
  
  addBranch: async (newBranch) => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.createBranch(newBranch)
      set((state) => ({
        branches: [...state.branches, response.branch],
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to create branch', loading: false })
      console.error('Error creating branch:', error)
      throw error
    }
  },
  
  updateBranch: async (id, updatedBranch) => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.updateBranch(id, updatedBranch)
      set((state) => ({
        branches: state.branches.map(branch => 
          branch.id === id ? response.branch : branch
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to update branch', loading: false })
      console.error('Error updating branch:', error)
      throw error
    }
  },
  
  deleteBranch: async (id) => {
    set({ loading: true, error: null })
    try {
      await apiClient.deleteBranch(id)
      set((state) => ({
        branches: state.branches.filter(branch => branch.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to delete branch', loading: false })
      console.error('Error deleting branch:', error)
      throw error
    }
  },
  
  getBranch: (id) => {
    return get().branches.find(branch => branch.id === id)
  }
}))
