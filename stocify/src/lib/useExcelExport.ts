import { useCallback } from 'react'
import * as XLSX from 'xlsx'

interface ExcelExportOptions {
  filename?: string
  sheetName?: string
  headers?: string[]
  includeHeaders?: boolean
}

interface ExcelColumn {
  key: string
  label: string
  formatter?: (value: any) => string | number
  width?: number
}

export const useExcelExport = () => {
  const convertToExcel = useCallback((
    data: any[],
    columns?: ExcelColumn[],
    options: ExcelExportOptions = {}
  ): XLSX.WorkBook => {
    const {
      sheetName = 'Sheet1',
      includeHeaders = true
    } = options

    if (!data || data.length === 0) {
      return XLSX.utils.book_new()
    }

    // If columns are provided, use them; otherwise use all keys from first object
    const excelColumns = columns || Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      width: 15
    }))

    // Prepare data for Excel
    const excelData: any[][] = []

    // Add headers if requested
    if (includeHeaders) {
      const headers = excelColumns.map(col => col.label)
      excelData.push(headers)
    }

    // Add data rows
    data.forEach(row => {
      const values = excelColumns.map(col => {
        let value = row[col.key]
        
        // Apply custom formatter if provided
        if (col.formatter) {
          value = col.formatter(value)
        }
        
        // Handle different data types
        if (value === null || value === undefined) {
          value = ''
        } else if (typeof value === 'object') {
          value = JSON.stringify(value)
        }
        
        return value
      })
      
      excelData.push(values)
    })

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(excelData)

    // Set column widths if provided
    if (excelColumns.some(col => col.width)) {
      const colWidths = excelColumns.map(col => ({ wch: col.width || 15 }))
      worksheet['!cols'] = colWidths
    }

    // Create workbook and add worksheet
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    return workbook
  }, [])

  const downloadExcel = useCallback((
    data: any[],
    filename: string = 'export.xlsx',
    columns?: ExcelColumn[],
    options?: ExcelExportOptions
  ) => {
    try {
      const workbook = convertToExcel(data, columns, options)
      
      if (!workbook.SheetNames.length) {
        console.warn('No data to export')
        return
      }

      // Write and download file
      XLSX.writeFile(workbook, filename)
    } catch (error) {
      console.error('Error exporting Excel:', error)
    }
  }, [convertToExcel])

  const exportToExcel = useCallback((
    data: any[],
    filename: string = 'export.xlsx',
    columns?: ExcelColumn[],
    options?: ExcelExportOptions
  ) => {
    downloadExcel(data, filename, columns, options)
  }, [downloadExcel])

  // Helper function to format currency for Excel
  const formatCurrency = useCallback((amount: number | string): number => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return isNaN(num) ? 0 : num
  }, [])

  // Helper function to format dates for Excel
  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return dateString
    }
  }, [])

  // Helper function to format status for Excel
  const formatStatus = useCallback((status: string): string => {
    return status.replace('_', ' ').toUpperCase()
  }, [])

  // Helper function to format numbers for Excel
  const formatNumber = useCallback((value: number | string): number => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(num) ? 0 : num
  }, [])

  // Helper function to format boolean for Excel
  const formatBoolean = useCallback((value: boolean | string): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return value === '1' || value === 'true' || value === 'yes' ? 'Yes' : 'No'
  }, [])

  return {
    exportToExcel,
    convertToExcel,
    downloadExcel,
    formatCurrency,
    formatDate,
    formatStatus,
    formatNumber,
    formatBoolean
  }
}

export type { ExcelExportOptions, ExcelColumn }
