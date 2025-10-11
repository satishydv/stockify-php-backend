# Export Components Documentation

This directory contains three export hooks that allow you to export table data to different formats: CSV, Excel, and PDF.

## Components Overview

### 1. `useCSVExport.ts`
- **Purpose**: Export data to CSV format
- **Dependencies**: None (uses native browser APIs)
- **File Size**: Lightweight

### 2. `useExcelExport.ts`
- **Purpose**: Export data to Excel (.xlsx) format
- **Dependencies**: `xlsx` library
- **File Size**: Medium

### 3. `usePDFExport.ts`
- **Purpose**: Export data to PDF format with tables
- **Dependencies**: `jspdf` and `jspdf-autotable`
- **File Size**: Larger

## Installation

The required dependencies are already installed:

```bash
npm install xlsx jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

## Usage Examples

### Basic Usage

```tsx
import { useCSVExport } from '@/lib/useCSVExport'
import { useExcelExport } from '@/lib/useExcelExport'
import { usePDFExport } from '@/lib/usePDFExport'

const MyComponent = () => {
  const { exportToCSV, formatCurrency, formatDate } = useCSVExport()
  const { exportToExcel } = useExcelExport()
  const { exportToPDF } = usePDFExport()

  const data = [
    { id: 1, name: 'John', amount: 1000, date: '2024-01-01' },
    // ... more data
  ]

  const handleExportCSV = () => {
    exportToCSV(data, 'my-data.csv')
  }

  const handleExportExcel = () => {
    exportToExcel(data, 'my-data.xlsx')
  }

  const handleExportPDF = () => {
    exportToPDF(data, 'my-data.pdf')
  }

  return (
    <div>
      <button onClick={handleExportCSV}>Export CSV</button>
      <button onClick={handleExportExcel}>Export Excel</button>
      <button onClick={handleExportPDF}>Export PDF</button>
    </div>
  )
}
```

### Advanced Usage with Custom Columns

```tsx
const { exportToCSV, formatCurrency, formatDate, formatStatus } = useCSVExport()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Customer Name' },
  { key: 'amount', label: 'Amount', formatter: formatCurrency },
  { key: 'date', label: 'Date', formatter: formatDate },
  { key: 'status', label: 'Status', formatter: formatStatus }
]

const handleExport = () => {
  exportToCSV(data, 'custom-export.csv', columns)
}
```

## API Reference

### Common Interface

All three hooks share similar interfaces:

```tsx
interface Column {
  key: string
  label: string
  formatter?: (value: any) => string | number
  width?: number // Excel and PDF only
  align?: 'left' | 'center' | 'right' // PDF only
}

interface ExportOptions {
  filename?: string
  includeHeaders?: boolean
  // ... format-specific options
}
```

### CSV Export

```tsx
const { exportToCSV, convertToCSV, downloadCSV, formatCurrency, formatDate, formatStatus } = useCSVExport()

// Basic export
exportToCSV(data, 'filename.csv')

// With custom columns
exportToCSV(data, 'filename.csv', columns)

// With options
exportToCSV(data, 'filename.csv', columns, {
  delimiter: ',',
  includeHeaders: true
})
```

### Excel Export

```tsx
const { exportToExcel, convertToExcel, downloadExcel, formatCurrency, formatDate, formatStatus, formatNumber, formatBoolean } = useExcelExport()

// Basic export
exportToExcel(data, 'filename.xlsx')

// With custom columns and options
exportToExcel(data, 'filename.xlsx', columns, {
  sheetName: 'My Sheet',
  filename: 'custom-name.xlsx'
})
```

### PDF Export

```tsx
const { exportToPDF, convertToPDF, downloadPDF, formatCurrency, formatDate, formatStatus, formatNumber, formatBoolean, formatText } = usePDFExport()

// Basic export
exportToPDF(data, 'filename.pdf')

// With custom columns and options
exportToPDF(data, 'filename.pdf', columns, {
  title: 'My Report',
  orientation: 'landscape',
  pageSize: 'A4',
  fontSize: 8,
  headerFontSize: 10
})
```

## Helper Functions

All hooks provide helper functions for common formatting:

- `formatCurrency(value)`: Format numbers as currency (₹)
- `formatDate(dateString)`: Format dates in Indian format (DD/MM/YYYY)
- `formatStatus(status)`: Format status strings (uppercase, replace underscores)
- `formatNumber(value)`: Convert strings to numbers
- `formatBoolean(value)`: Convert boolean values to "Yes"/"No"
- `formatText(text, maxLength)`: Truncate long text (PDF only)

## Integration with Existing Tables

To integrate with your existing table components (like in the orders page), simply:

1. Import the desired export hook
2. Define your columns with appropriate formatters
3. Add export buttons to your UI
4. Call the export function with your filtered/sorted data

Example from orders page:

```tsx
const { exportToCSV, formatCurrency, formatDate, formatStatus } = useCSVExport()

const csvColumns = [
  { key: 'order_number', label: 'Order #' },
  { key: 'customer_name', label: 'Customer Name' },
  { key: 'order_date', label: 'Order Date', formatter: formatDate },
  { key: 'status', label: 'Status', formatter: formatStatus },
  { key: 'total_amount', label: 'Total Amount', formatter: formatCurrency }
]

const handleExportCSV = () => {
  exportToCSV(sortedOrders, 'orders.csv', csvColumns)
}
```

## File Size Considerations

- **CSV**: Smallest file size, fastest export
- **Excel**: Medium file size, good for complex data
- **PDF**: Largest file size, best for reports and printing

## Browser Compatibility

- **CSV**: All modern browsers
- **Excel**: All modern browsers (uses xlsx library)
- **PDF**: All modern browsers (uses jsPDF library)

## Performance Tips

1. For large datasets (>1000 rows), consider pagination or filtering before export
2. PDF exports are slower for large datasets - consider using CSV or Excel for bulk exports
3. Use appropriate column widths in Excel/PDF to avoid layout issues
4. Test exports with your actual data to ensure proper formatting

## Troubleshooting

### Common Issues

1. **Large files**: For datasets >10MB, consider server-side export
2. **Special characters**: All hooks handle special characters automatically
3. **Date formatting**: Use the provided `formatDate` helper for consistent formatting
4. **Currency formatting**: Use the provided `formatCurrency` helper for proper currency display

### Error Handling

All hooks include error handling and will log errors to the console. Check the browser console if exports fail.

## Example Component

See `ExportExample.tsx` for a complete working example that demonstrates all three export formats with sample data.
