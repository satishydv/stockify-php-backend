"use client"

import { create } from "zustand"
import { User } from "@/lib/user-data"
import { apiClient } from "@/lib/api"

interface UserStore {
  users: User[]
  isLoading: boolean
  addUser: (user: { name: string; email: string; password: string; address: string; role_id: number }) => Promise<void>
  deleteUser: (id: string) => void
  updateUser: (id: string, updates: Partial<User>) => void
  fetchUsers: () => Promise<void>
  setUsers: (users: User[]) => void
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  isLoading: false,
  
  addUser: async (newUser) => {
    set({ isLoading: true })
    try {
      await apiClient.createUser(newUser)
      // We only get userId back; refetch full list to sync
      await get().fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      set({ isLoading: false })
      throw error
    }
  },
  
  deleteUser: (id) => set((state) => ({
    users: state.users.filter((user) => user.id !== id)
  })),
  
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((user) =>
      user.id === id
        ? { ...user, ...updates }
        : user
    )
  })),
  
  fetchUsers: async () => {
    set({ isLoading: true })
    try {
      const result = await apiClient.getUsers()
      set({ users: result.users, isLoading: false })
    } catch (error) {
      console.error('Error fetching users:', error)
      set({ isLoading: false })
    }
  },

  setUsers: (users) => set({ users })
}))
