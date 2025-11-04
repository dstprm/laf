import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface GeneratePDFOptions {
  filename?: string;
  quality?: number;
  scale?: number;
}

/**
 * Convert any modern color format to RGB using canvas rendering
 * Works for oklch, oklab, color(), etc.
 * More reliable than trying to use getComputedStyle
 */
function oklchToRgb(colorString: string): string {
  // Create a temporary canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.warn('Could not get canvas context for color conversion:', colorString);
    return colorString;
  }

  try {
    // Try to use the color - if browser supports it, it will render
    ctx.fillStyle = colorString;
    ctx.fillRect(0, 0, 1, 1);

    // Get the rendered color data
    const imageData = ctx.getImageData(0, 0, 1, 1);
    const [r, g, b, a] = imageData.data;

    if (a === 0) {
      // Color wasn't supported or is transparent
      console.warn('Color conversion failed (transparent):', colorString);
      return colorString;
    }

    const rgbColor = a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
    // console.log('Converted:', colorString, '→', rgbColor); // Disable verbose logging
    return rgbColor;
  } catch (e) {
    console.warn('Error converting color:', colorString, e);
    return colorString;
  }
}

/**
 * Converts modern color formats (oklch, oklab, etc.) to rgb
 */
function convertColorsToRgb(styleValue: string): string {
  if (!styleValue) {
    return styleValue;
  }

  // Check if it contains any modern color functions
  if (!styleValue.includes('oklch') && !styleValue.includes('oklab') && !styleValue.includes('color(')) {
    return styleValue;
  }

  // Match all modern color patterns and replace them
  let result = styleValue;

  // Replace oklch colors
  result = result.replace(/oklch\([^)]+\)/g, (match) => oklchToRgb(match));

  // Replace oklab colors
  result = result.replace(/oklab\([^)]+\)/g, (match) => oklchToRgb(match));

  // Replace color() function
  result = result.replace(/color\([^)]+\)/g, (match) => oklchToRgb(match));

  return result;
}

/**
 * Waits for all images and fonts to load
 */
async function waitForResources(element: HTMLElement): Promise<void> {
  // Wait for images
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Resolve even on error to not block
      });
    }),
  );

  // Wait for fonts (give them a moment to load)
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Small delay to ensure everything is rendered
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Inlines all computed styles to override any CSS rules
 */
function inlineAllStyles(element: HTMLElement, computedStyle: CSSStyleDeclaration): void {
  // Copy ALL computed styles to ensure nothing is missed
  for (let i = 0; i < computedStyle.length; i++) {
    const prop = computedStyle[i];
    const value = computedStyle.getPropertyValue(prop);

    if (value && value !== '' && value !== 'none' && value !== 'auto') {
      // Convert any oklch colors to rgb
      const fixedValue = convertColorsToRgb(value);

      try {
        element.style.setProperty(prop, fixedValue, 'important');
      } catch {
        // Some properties can't be set, ignore them
      }
    }
  }
}

/**
 * Captures and applies computed RGB styles from original to clone
 */
function cloneAndFixColors(originalElement: HTMLElement): HTMLElement {
  // First, get all original elements and their computed styles
  const originalElements = [originalElement, ...Array.from(originalElement.querySelectorAll('*'))];
  const computedStylesMap = new Map<Element, CSSStyleDeclaration>();

  // Capture computed styles from originals while they're in the DOM
  originalElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      computedStylesMap.set(el, window.getComputedStyle(el));
    }
  });

  // Now clone the element
  const clone = originalElement.cloneNode(true) as HTMLElement;

  // Set isPDF attribute to force desktop rendering in React components
  clone.setAttribute('data-is-pdf', 'true');

  // Preserve the original element's dimensions
  const originalRect = originalElement.getBoundingClientRect();
  clone.style.width = `${originalRect.width}px`;
  clone.style.boxSizing = 'border-box';

  // Get all cloned elements
  const clonedElements = [clone, ...Array.from(clone.querySelectorAll('*'))];

  // Apply the captured styles to cloned elements
  clonedElements.forEach((clonedEl, index) => {
    if (!(clonedEl instanceof HTMLElement)) return;

    const originalEl = originalElements[index];
    const computedStyle = computedStylesMap.get(originalEl);

    if (!computedStyle) return;

    // Inline all critical styles
    inlineAllStyles(clonedEl, computedStyle);
  });

  return clone;
}

/**
 * Generates a PDF from a given HTML element
 * @param element - The HTML element to convert to PDF
 * @param options - Options for PDF generation
 */
/**
 * Captures a single element as a canvas with transparent background
 */
async function captureElementAsCanvas(element: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  // Get the actual content width (use scrollWidth to get real width)
  const actualWidth = Math.max(element.offsetWidth, element.scrollWidth);

  return await html2canvas(element, {
    scale: scale,
    useCORS: true,
    logging: false,
    backgroundColor: null, // Transparent background
    windowWidth: actualWidth,
    windowHeight: element.offsetHeight,
    width: actualWidth,
    height: element.offsetHeight,
    x: 0,
    y: 0,
    foreignObjectRendering: false,
    imageTimeout: 0,
  });
}

/**
 * Adds header with logo to the PDF page
 */
async function addHeader(pdf: jsPDF, container: HTMLElement, scale: number, pageWidth: number): Promise<void> {
  // Add dark blue header banner (full width)
  const headerHeight = 22; // mm - increased for more space
  pdf.setFillColor(5, 38, 89); // blue-700 - dark blue
  pdf.rect(0, 0, pageWidth, headerHeight, 'F');

  const margins = 20; // mm - increased margins for more breathing room

  // Add title on the left side in white
  pdf.setTextColor(255, 255, 255); // White color
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Informe de Valorización', margins, headerHeight / 2 + 2); // Vertically centered

  // Create a temporary img element for the white logo
  const logoImg = document.createElement('img');
  logoImg.src = '/logo-white.svg';
  logoImg.style.height = '48px'; // Set a fixed height
  logoImg.style.width = 'auto';

  // Wait for logo to load
  await new Promise<void>((resolve) => {
    logoImg.onload = () => resolve();
    logoImg.onerror = () => {
      console.error('Failed to load white logo');
      resolve(); // Continue even if logo fails
    };
    // Add to container to trigger load
    container.appendChild(logoImg);
  });

  // Small delay to ensure render
  await new Promise((resolve) => setTimeout(resolve, 50));

  try {
    const canvas = await captureElementAsCanvas(logoImg, scale);
    const imgData = canvas.toDataURL('image/png', 0.95);

    // Calculate logo dimensions
    const logoHeight = 8; // 8mm height
    const logoWidth = (canvas.width * logoHeight) / canvas.height;

    // Calculate total height of logo + tagline combo for vertical centering
    const taglineSpacing = 3; // spacing between logo and tagline
    const taglineTextHeight = 2; // approximate text height
    const totalComboHeight = logoHeight + taglineSpacing + taglineTextHeight;

    // Center the combo vertically in the header
    const comboStartY = (headerHeight - totalComboHeight) / 2;

    // Position logo on the right side
    const logoX = pageWidth - margins - logoWidth;
    const logoY = comboStartY;

    // Add logo on the right
    pdf.addImage(imgData, 'PNG', logoX, logoY, logoWidth, logoHeight);

    // Add tagline below logo (bold, professional font)
    pdf.setFontSize(8);
    pdf.setFont('times', 'bold'); // Times is more professional and elegant
    pdf.setTextColor(255, 255, 255); // White color
    const tagline = 'Regional M&A Advisory';
    const taglineWidth = pdf.getTextWidth(tagline);
    const taglineX = pageWidth - margins - taglineWidth;
    const taglineY = logoY + logoHeight + taglineSpacing;
    pdf.text(tagline, taglineX, taglineY);
  } catch (error) {
    console.error('Error capturing white logo:', error);
  } finally {
    // Clean up
    container.removeChild(logoImg);
  }
}

/**
 * Adds footer with promotional text and page number to the PDF page
 */
function addFooter(
  pdf: jsPDF,
  pageNumber: number,
  totalPages: number,
  pageWidth: number,
  pageHeight: number,
  margins: number,
): void {
  const footerY = pageHeight - margins + 2;

  // Add line above footer
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.1);
  pdf.line(margins, pageHeight - margins - 5, pageWidth - margins, pageHeight - margins - 5);

  // Add promotional text
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  const promoText = 'Crea una valorización gratuita en https://valupro.lat';
  const textWidth = pdf.getTextWidth(promoText);
  const textX = (pageWidth - textWidth) / 2;
  pdf.text(promoText, textX, footerY);

  // Add page number
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  const pageText = `Página ${pageNumber} de ${totalPages}`;
  const pageTextWidth = pdf.getTextWidth(pageText);
  pdf.text(pageText, pageWidth - margins - pageTextWidth, footerY);
}

export async function generateReportPDF(element: HTMLElement, options: GeneratePDFOptions = {}): Promise<void> {
  const { filename = 'valuation-report.pdf', quality = 0.95, scale = 2 } = options;

  let container: HTMLElement | null = null;

  try {
    // Wait for all resources to load first
    await waitForResources(element);

    // PDF dimensions
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margins = 15; // 15mm margins
    const headerHeight = 15; // Space reserved for header
    const footerHeight = 10; // Space reserved for footer
    const contentWidth = pageWidth - margins * 2;
    const contentTop = margins + headerHeight;
    const contentBottom = pageHeight - margins - footerHeight;

    // Get all major sections (excluding logo and footer)
    const allSections = Array.from(
      element.querySelectorAll('#valuation-report > *:not(script):not(style)'),
    ) as HTMLElement[];

    const sections = allSections.filter((section) => {
      // Exclude logo section
      if (section.classList.contains('justify-center') && section.querySelector('img[alt="ValuPro"]')) {
        return false;
      }
      // Exclude promotional footer section
      if (section.classList.contains('border-t-2') && section.textContent?.includes('valupro.lat')) {
        return false;
      }
      return true;
    });

    console.log(`Found ${sections.length} content sections to process`);

    // Create container for rendering elements
    // Don't constrain width - let each section determine its natural width
    container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.zIndex = '-9999';
    container.style.pointerEvents = 'none';
    container.style.backgroundColor = 'transparent';
    document.body.appendChild(container);

    // First pass: capture all sections to calculate total pages
    const sectionData: Array<{ imgData: string; width: number; height: number }> = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      const clonedSection = cloneAndFixColors(section);
      container.appendChild(clonedSection);
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Capture with automatic width detection and transparent background
      const canvas = await captureElementAsCanvas(clonedSection, scale);
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png', quality);

      sectionData.push({ imgData, width: imgWidth, height: imgHeight });
      container.removeChild(clonedSection);

      console.log(
        `Captured section ${i + 1}/${sections.length}, width: ${canvas.width}px, height: ${imgHeight.toFixed(2)}mm`,
      );
    }

    // Calculate total pages needed
    let totalPages = 1;
    let testY = contentTop;
    for (const data of sectionData) {
      if (testY + data.height > contentBottom) {
        totalPages++;
        testY = contentTop;
      }
      testY += data.height + 5;
    }

    console.log(`PDF will have ${totalPages} pages`);

    // Create PDF with headers and footers
    const pdf = new jsPDF('p', 'mm', 'a4');
    let currentPage = 1;
    let currentY = contentTop;

    // Add subtle blueish background to first page
    pdf.setFillColor(235, 240, 248); // Darker blue-gray background
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Add header and footer to first page
    await addHeader(pdf, container, scale, pageWidth);
    addFooter(pdf, currentPage, totalPages, pageWidth, pageHeight, margins);

    // Add all sections
    for (let i = 0; i < sectionData.length; i++) {
      const data = sectionData[i];

      // Check if we need a new page
      if (currentY + data.height > contentBottom) {
        // New page
        pdf.addPage();
        currentPage++;
        currentY = contentTop;

        // Add subtle blueish background to new page
        pdf.setFillColor(235, 240, 248); // Darker blue-gray background
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Add header and footer to new page
        await addHeader(pdf, container, scale, pageWidth);
        addFooter(pdf, currentPage, totalPages, pageWidth, pageHeight, margins);
      }

      // Add the image to PDF (PNG for transparency support)
      pdf.addImage(data.imgData, 'PNG', margins, currentY, data.width, data.height);

      // Update position for next element
      currentY += data.height + 5; // 5mm spacing between sections

      console.log(`Added section ${i + 1}/${sectionData.length} to page ${currentPage}`);
    }

    // Clean up
    document.body.removeChild(container);
    container = null;

    // Save the PDF
    pdf.save(filename);
    console.log('PDF generated successfully!');
  } catch (error) {
    // Clean up if needed
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }

    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

/**
 * Sanitizes a filename by removing invalid characters
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}
