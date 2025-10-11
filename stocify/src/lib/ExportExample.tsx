import React from 'react'
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import { useCSVExport } from './useCSVExport'
import { useExcelExport } from './useExcelExport'
import { usePDFExport } from './usePDFExport'

// Example data structure
interface ExampleData {
  id: number
  name: string
  email: string
  amount: number
  date: string
  status: string
}

// Sample data for demonstration
const sampleData: ExampleData[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    amount: 1500.50,
    date: '2024-01-15',
    status: 'active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    amount: 2300.75,
    date: '2024-01-16',
    status: 'inactive'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    amount: 800.25,
    date: '2024-01-17',
    status: 'pending'
  }
]

export const ExportExample: React.FC = () => {
  const { exportToCSV, formatCurrency, formatDate, formatStatus } = useCSVExport()
  const { exportToExcel, formatCurrency: formatCurrencyExcel, formatDate: formatDateExcel, formatStatus: formatStatusExcel } = useExcelExport()
  const { exportToPDF, formatCurrency: formatCurrencyPDF, formatDate: formatDatePDF, formatStatus: formatStatusPDF } = usePDFExport()

  // Define columns for all export types
  const csvColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'amount', label: 'Amount', formatter: formatCurrency },
    { key: 'date', label: 'Date', formatter: formatDate },
    { key: 'status', label: 'Status', formatter: formatStatus }
  ]

  const excelColumns = [
    { key: 'id', label: 'ID', width: 10 },
    { key: 'name', label: 'Name', width: 20 },
    { key: 'email', label: 'Email', width: 25 },
    { key: 'amount', label: 'Amount', formatter: formatCurrencyExcel, width: 15 },
    { key: 'date', label: 'Date', formatter: formatDateExcel, width: 15 },
    { key: 'status', label: 'Status', formatter: formatStatusExcel, width: 15 }
  ]

  const pdfColumns = [
    { key: 'id', label: 'ID', width: 20, align: 'center' as const },
    { key: 'name', label: 'Name', width: 40, align: 'left' as const },
    { key: 'email', label: 'Email', width: 50, align: 'left' as const },
    { key: 'amount', label: 'Amount', formatter: formatCurrencyPDF, width: 30, align: 'right' as const },
    { key: 'date', label: 'Date', formatter: formatDatePDF, width: 30, align: 'center' as const },
    { key: 'status', label: 'Status', formatter: formatStatusPDF, width: 25, align: 'center' as const }
  ]

  const handleExportCSV = () => {
    exportToCSV(sampleData, 'example-data.csv', csvColumns)
  }

  const handleExportExcel = () => {
    exportToExcel(sampleData, 'example-data.xlsx', excelColumns, {
      sheetName: 'Sample Data',
      filename: 'example-data.xlsx'
    })
  }

  const handleExportPDF = () => {
    exportToPDF(sampleData, 'example-data.pdf', pdfColumns, {
      title: 'Sample Data Report',
      orientation: 'landscape',
      pageSize: 'A4',
      filename: 'example-data.pdf'
    })
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Export Example</h2>
      <p className="text-gray-600">This component demonstrates how to use the export hooks for CSV, Excel, and PDF formats.</p>
      
      <div className="flex gap-4">
        <Button 
          onClick={handleExportCSV}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </Button>

        <Button 
          onClick={handleExportExcel}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Excel
        </Button>

        <Button 
          onClick={handleExportPDF}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
      </div>

      {/* Sample data table for reference */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Sample Data:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Date</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row) => (
                <tr key={row.id}>
                  <td className="border border-gray-300 px-4 py-2">{row.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{row.email}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">₹{row.amount.toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{new Date(row.date).toLocaleDateString('en-IN')}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      row.status === 'active' ? 'bg-green-100 text-green-800' :
                      row.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ExportExample
