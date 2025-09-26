import { create } from 'zustand'
import { Product } from '@/lib/product-data'
import { apiClient } from '@/lib/api'

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  getProduct: (id: string) => Product | undefined
}

// Initial products data (moved from product-data.tsx)
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Screwdriver",
    sku: "SD123",
    price: 12.99,
    category: "Others",
    status: "draft",
    quantityInStock: 50,
    supplier: "ToolSupplier Inc.",
    icon: "🔧"
  },
  {
    id: "2",
    name: "Hammer",
    sku: "HM456",
    price: 15.50,
    category: "Others",
    status: "published",
    quantityInStock: 30,
    supplier: "ToolSupplier Inc.",
    icon: "🔨"
  },
  {
    id: "3",
    name: "Smartphone",
    sku: "SP789",
    price: 499.99,
    category: "Electronics",
    status: "published",
    quantityInStock: 100,
    supplier: "TechWorld",
    icon: "📱"
  },
  {
    id: "4",
    name: "Laptop",
    sku: "LT101",
    price: 899.99,
    category: "Electronics",
    status: "inactive",
    quantityInStock: 25,
    supplier: "TechWorld",
    icon: "💻"
  },
  {
    id: "5",
    name: "Microwave Oven",
    sku: "MO202",
    price: 120.00,
    category: "Furniture",
    status: "draft",
    quantityInStock: 15,
    supplier: "HomeGoods Co.",
    icon: "📺"
  },
  {
    id: "6",
    name: "Washing Machine",
    sku: "WM303",
    price: 450.00,
    category: "Home Decor",
    status: "published",
    quantityInStock: 10,
    supplier: "HomeGoods Co.",
    icon: "🏠"
  },
  {
    id: "7",
    name: "Refrigerator",
    sku: "RF404",
    price: 799.99,
    category: "Home Appliances",
    status: "inactive",
    quantityInStock: 8,
    supplier: "HomeGoods Co.",
    icon: "❄️"
  },
  {
    id: "8",
    name: "Tablet",
    sku: "TB505",
    price: 199.99,
    category: "Electronics",
    status: "draft",
    quantityInStock: 60,
    supplier: "TechWorld",
    icon: "📱"
  }
]

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  
  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.getProducts()
      set({ products: response.products || [], loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch products', loading: false })
      console.error('Error fetching products:', error)
    }
  },
  
  addProduct: async (newProduct) => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.createProduct(newProduct)
      set((state) => ({
        products: [...state.products, response.product],
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to create product', loading: false })
      console.error('Error creating product:', error)
      throw error
    }
  },
  
  updateProduct: async (id, updatedProduct) => {
    set({ loading: true, error: null })
    try {
      const response = await apiClient.updateProduct(id, updatedProduct)
      set((state) => ({
        products: state.products.map(product => 
          product.id === id ? response.product : product
        ),
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to update product', loading: false })
      console.error('Error updating product:', error)
      throw error
    }
  },
  
  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      await apiClient.deleteProduct(id)
      set((state) => ({
        products: state.products.filter(product => product.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: 'Failed to delete product', loading: false })
      console.error('Error deleting product:', error)
      throw error
    }
  },
  
  getProduct: (id) => {
    return get().products.find(product => product.id === id)
  }
}))
