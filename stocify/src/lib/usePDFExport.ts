import { useCallback } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface PDFExportOptions {
  filename?: string
  title?: string
  orientation?: 'portrait' | 'landscape'
  pageSize?: 'A4' | 'A3' | 'letter'
  includeHeaders?: boolean
  fontSize?: number
  headerFontSize?: number
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
}

interface PDFColumn {
  key: string
  label: string
  formatter?: (value: any) => string
  width?: number
  align?: 'left' | 'center' | 'right'
}

export const usePDFExport = () => {
  const convertToPDF = useCallback((
    data: any[],
    columns?: PDFColumn[],
    options: PDFExportOptions = {}
  ): jsPDF => {
    const {
      title = 'Export Report',
      orientation = 'landscape',
      pageSize = 'A4',
      includeHeaders = true,
      fontSize = 8,
      headerFontSize = 10,
      margin = { top: 20, right: 20, bottom: 20, left: 20 }
    } = options

    // Create new PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize
    })

    if (!data || data.length === 0) {
      // Add title and "No data" message
      doc.setFontSize(16)
      doc.text(title, margin.left, margin.top)
      doc.setFontSize(12)
      doc.text('No data available', margin.left, margin.top + 10)
      return doc
    }

    // If columns are provided, use them; otherwise use all keys from first object
    const pdfColumns = columns || Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      width: 30,
      align: 'left' as const
    }))

    // Prepare data for PDF
    const tableData: string[][] = []

    // Add data rows
    data.forEach(row => {
      const values = pdfColumns.map(col => {
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
        } else if (typeof value === 'string' && value.length > 50) {
          // Truncate long strings
          value = value.substring(0, 47) + '...'
        }
        
        return String(value)
      })
      
      tableData.push(values)
    })

    // Prepare headers
    const headers = includeHeaders ? pdfColumns.map(col => col.label) : []

    // Add title
    doc.setFontSize(16)
    doc.text(title, margin.left, margin.top)

    // Calculate table start position
    const tableStartY = margin.top + 15

    // Generate table using the new API
    autoTable(doc, {
      head: includeHeaders ? [headers] : [],
      body: tableData,
      startY: tableStartY,
      margin: margin,
      styles: {
        fontSize: fontSize,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left',
        valign: 'middle'
      },
      headStyles: {
        fontSize: headerFontSize,
        fillColor: [66, 139, 202], // Blue color
        textColor: [255, 255, 255], // White text
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245] // Light gray
      },
      columnStyles: pdfColumns.reduce((acc, col, index) => {
        acc[index] = {
          halign: col.align || 'left',
          cellWidth: col.width || 'auto'
        }
        return acc
      }, {} as any),
      didDrawPage: (data) => {
        // Add page numbers
        const pageCount = doc.getNumberOfPages()
        const currentPage = data.pageNumber
        
        doc.setFontSize(8)
        doc.text(
          `Page ${currentPage} of ${pageCount}`,
          doc.internal.pageSize.width - margin.right - 20,
          doc.internal.pageSize.height - margin.bottom + 10
        )
      }
    })

    return doc
  }, [])

  const downloadPDF = useCallback((
    data: any[],
    filename: string = 'export.pdf',
    columns?: PDFColumn[],
    options?: PDFExportOptions
  ) => {
    try {
      const doc = convertToPDF(data, columns, options)
      doc.save(filename)
    } catch (error) {
      console.error('Error exporting PDF:', error)
    }
  }, [convertToPDF])

  const exportToPDF = useCallback((
    data: any[],
    filename: string = 'export.pdf',
    columns?: PDFColumn[],
    options?: PDFExportOptions
  ) => {
    downloadPDF(data, filename, columns, options)
  }, [downloadPDF])

  // Helper function to format currency for PDF
  const formatCurrency = useCallback((amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`
  }, [])

  // Helper function to format dates for PDF
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

  // Helper function to format status for PDF
  const formatStatus = useCallback((status: string): string => {
    return status.replace('_', ' ').toUpperCase()
  }, [])

  // Helper function to format numbers for PDF
  const formatNumber = useCallback((value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(num) ? '0' : num.toString()
  }, [])

  // Helper function to format boolean for PDF
  const formatBoolean = useCallback((value: boolean | string): string => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No'
    }
    return value === '1' || value === 'true' || value === 'yes' ? 'Yes' : 'No'
  }, [])

  // Helper function to format text with line breaks for PDF
  const formatText = useCallback((text: string, maxLength: number = 30): string => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }, [])

  return {
    exportToPDF,
    convertToPDF,
    downloadPDF,
    formatCurrency,
    formatDate,
    formatStatus,
    formatNumber,
    formatBoolean,
    formatText
  }
}

export type { PDFExportOptions, PDFColumn }
