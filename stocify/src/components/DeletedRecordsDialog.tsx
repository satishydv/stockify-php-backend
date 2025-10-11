"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import { IoTrash, IoRefresh, IoEye } from "react-icons/io5"
import { format } from "date-fns"

interface DeletedRecord {
  id: string
  name: string
  [key: string]: any
}

interface DeletedRecordsDialogProps {
  table: string
  tableName: string
  children: React.ReactNode
}

export default function DeletedRecordsDialog({ table, tableName, children }: DeletedRecordsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deletedRecords, setDeletedRecords] = useState<DeletedRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState<string | null>(null)

  const fetchDeletedRecords = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getDeletedRecords(table)
      setDeletedRecords(response.deleted_records || [])
    } catch (error) {
      console.error('Error fetching deleted records:', error)
      toast.error('Failed to fetch deleted records')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id: string, name: string) => {
    setRestoring(id)
    try {
      await apiClient.restore(table, id)
      setDeletedRecords(prev => prev.filter(record => record.id !== id))
      toast.success(`${tableName} "${name}" restored successfully`)
    } catch (error) {
      console.error('Error restoring record:', error)
      toast.error('Failed to restore record')
    } finally {
      setRestoring(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  const getRecordDisplayName = (record: DeletedRecord) => {
    // Try different common name fields
    return record.name || record.title || record.product_name || record.supplier_name || record.category_name || record.id
  }

  useEffect(() => {
    if (isOpen) {
      fetchDeletedRecords()
    }
  }, [isOpen, table])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IoTrash className="h-5 w-5 text-red-500" />
            Deleted {tableName}s
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : deletedRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <IoTrash className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No deleted {tableName.toLowerCase()}s found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deletedRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-lg">{getRecordDisplayName(record)}</h3>
                        <Badge variant="destructive" className="text-xs">
                          Deleted
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {record.sku && (
                          <div>
                            <span className="font-medium">SKU:</span> {record.sku}
                          </div>
                        )}
                        {record.email && (
                          <div>
                            <span className="font-medium">Email:</span> {record.email}
                          </div>
                        )}
                        {record.category && (
                          <div>
                            <span className="font-medium">Category:</span> {record.category}
                          </div>
                        )}
                        {record.supplier && (
                          <div>
                            <span className="font-medium">Supplier:</span> {record.supplier}
                          </div>
                        )}
                        {record.updatedAt && (
                          <div>
                            <span className="font-medium">Deleted:</span> {formatDate(record.updatedAt)}
                          </div>
                        )}
                        {record.createdAt && (
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(record.createdAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(record.id, getRecordDisplayName(record))}
                        disabled={restoring === record.id}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        {restoring === record.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <IoRefresh className="h-4 w-4" />
                        )}
                        Restore
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
