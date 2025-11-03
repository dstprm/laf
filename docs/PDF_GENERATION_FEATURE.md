# PDF Generation Feature

## Overview

Users can now generate and download PDF versions of their valuation reports directly from the report page. This feature converts the entire HTML report into a professional PDF document.

## Implementation

### Core Components

#### 1. PDF Generation Utility
**File**: `src/utils/pdf/generate-report-pdf.ts`

Provides the core functionality for converting HTML elements to PDF:

- `generateReportPDF(element, options)`: Main function that converts an HTML element to PDF
- `sanitizeFilename(name)`: Helper function to create safe filenames

**Technology Stack**:
- `html2canvas`: Captures the HTML element as a canvas
- `jspdf`: Generates the PDF from the canvas image

**Features**:
- Multi-page support (automatically splits content across pages)
- High-quality output (configurable DPI/scale)
- A4 page format
- Automatic filename generation with date stamp

#### 2. Download PDF Button Component
**File**: `src/components/dashboard/valuations/download-pdf-button.tsx`

A reusable React component that provides the PDF download functionality:

**Props**:
- `reportElementId`: ID of the HTML element to convert
- `companyName`: Optional company name for filename
- `reportName`: Optional report name for filename
- `variant`: Button style variant
- `size`: Button size
- `className`: Additional CSS classes

**Features**:
- Loading state during PDF generation
- Toast notifications for success/error
- Automatic filename generation based on company/report name
- Error handling with user feedback

#### 3. Updated ValuationReport Component
**File**: `src/components/dashboard/valuations/valuation-report.tsx`

Added an `id` prop to enable PDF generation:
- Default ID: `"valuation-report"`
- Can be customized per instance

#### 4. Updated Report Page
**File**: `src/app/reports/[shareToken]/page.tsx`

Integrated the Download PDF button into the report page header:
- Positioned in the top-right corner
- Accessible to all users viewing the report
- Uses company/report name for filename

## Usage

### For End Users

1. Navigate to any published valuation report
2. Click the "Download PDF" button in the top-right corner
3. Wait for the PDF to generate (a loading spinner will appear)
4. The PDF will automatically download with a filename like: `company-name-2025-11-03.pdf`

### For Developers

To add PDF download functionality to other pages:

```tsx
import { DownloadPDFButton } from '@/components/dashboard/valuations/download-pdf-button';

// In your component:
<div id="my-report" className="...">
  {/* Your report content */}
</div>

<DownloadPDFButton
  reportElementId="my-report"
  companyName="Example Corp"
  reportName="Q4 2023 Report"
/>
```

## Technical Details

### PDF Generation Process

1. User clicks "Download PDF" button
2. Component finds the HTML element by ID
3. Element is cloned and OKLCH colors are converted to RGB (for html2canvas compatibility)
4. Cloned element is temporarily added to the DOM (hidden off-screen)
5. `html2canvas` captures the element as a high-resolution canvas
6. Temporary clone is removed from the DOM
7. Canvas is converted to JPEG image data
8. `jspdf` creates a PDF document in A4 format
9. Content is automatically split across multiple pages if needed
10. PDF is saved with a sanitized filename

**Note**: The process includes automatic conversion of modern OKLCH color values (used by Tailwind CSS 4) to RGB format, as html2canvas doesn't natively support OKLCH colors.

### Configuration Options

The `generateReportPDF` function accepts optional configuration:

```typescript
{
  filename?: string;      // Custom filename (default: 'valuation-report.pdf')
  quality?: number;       // JPEG quality 0-1 (default: 0.95)
  scale?: number;         // Canvas scale/DPI (default: 2)
}
```

### Error Handling

- Missing element: Shows error toast
- Canvas generation failure: Shows error toast with message
- PDF generation failure: Shows error toast with message
- All errors are logged to console for debugging

## Dependencies

Added packages:
- `jspdf`: ^2.x (PDF generation)
- `html2canvas`: ^1.x (HTML to canvas conversion)

## Known Issues & Solutions

### OKLCH Color Support

**Issue**: html2canvas doesn't support modern OKLCH color format used by Tailwind CSS 4.

**Solution**: The utility automatically:
1. Clones the report element
2. Converts all OKLCH colors to RGB equivalents
3. Generates PDF from the color-corrected clone
4. Cleans up the temporary clone

This ensures compatibility while maintaining visual fidelity.

## Future Enhancements

Potential improvements:
1. Custom PDF layouts optimized for print
2. Add page numbers and headers/footers
3. Table of contents generation
4. Selectable content for PDF generation
5. Email PDF directly from the app
6. Server-side PDF generation for better quality
7. PDF templates with custom branding

## Browser Compatibility

Works in all modern browsers that support:
- HTML5 Canvas API
- Blob API
- Download attribute on anchor elements

Tested in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Large reports may take 3-10 seconds to generate
- Memory usage scales with report size
- Generation happens client-side (no server load)
- Canvas rendering respects print media queries

