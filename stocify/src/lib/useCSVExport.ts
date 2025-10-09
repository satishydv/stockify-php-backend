import { useCallback } from 'react'

interface CSVExportOptions {
  filename?: string
  headers?: string[]
  delimiter?: string
  includeHeaders?: boolean
}

interface CSVColumn {
  key: string
  label: string
  formatter?: (value: any) => string
}

export const useCSVExport = () => {
  const convertToCSV = useCallback((
    data: any[],
    columns?: CSVColumn[],
    options: CSVExportOptions = {}
  ): string => {
    const {
      delimiter = ',',
      includeHeaders = true
    } = options

    if (!data || data.length === 0) {
      return ''
    }

    // If columns are provided, use them; otherwise use all keys from first object
    const csvColumns = columns || Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    }))

    let csv = ''

    // Add headers if requested
    if (includeHeaders) {
      const headers = csvColumns.map(col => `"${col.label}"`).join(delimiter)
      csv += headers + '\n'
    }

    // Add data rows
    data.forEach(row => {
      const values = csvColumns.map(col => {
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
        } else if (typeof value === 'string' && value.includes(',')) {
          // Escape commas in strings
          value = `"${value.replace(/"/g, '""')}"`
        } else if (typeof value === 'string') {
          value = `"${value.replace(/"/g, '""')}"`
        }
        
        return value
      })
      
      csv += values.join(delimiter) + '\n'
    })

    return csv
  }, [])

  const downloadCSV = useCallback((
    data: any[],
    filename: string = 'export.csv',
    columns?: CSVColumn[],
    options?: CSVExportOptions
  ) => {
    try {
      const csv = convertToCSV(data, columns, options)
      
      if (!csv) {
        console.warn('No data to export')
        return
      }

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }, [convertToCSV])

  const exportToCSV = useCallback((
    data: any[],
    filename: string = 'export.csv',
    columns?: CSVColumn[],
    options?: CSVExportOptions
  ) => {
    downloadCSV(data, filename, columns, options)
  }, [downloadCSV])

  // Helper function to format currency for CSV
  const formatCurrency = useCallback((amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return isNaN(num) ? '0' : num.toFixed(2)
  }, [])

  // Helper function to format dates for CSV
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

  // Helper function to format status for CSV
  const formatStatus = useCallback((status: string): string => {
    return status.replace('_', ' ').toUpperCase()
  }, [])

  return {
    exportToCSV,
    convertToCSV,
    downloadCSV,
    formatCurrency,
    formatDate,
    formatStatus
  }
}

export type { CSVExportOptions, CSVColumn }
