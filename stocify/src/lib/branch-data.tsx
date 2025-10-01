export interface Branch {
  id: number
  name: string
  address: string
  phone: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export const getStatusBadge = (status: Branch['status']) => {
  const statusConfig = {
    active: {
      label: 'Active',
      className: 'bg-green-100 text-green-800 border-green-200'
    },
    inactive: {
      label: 'Inactive', 
      className: 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const config = statusConfig[status]
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}
