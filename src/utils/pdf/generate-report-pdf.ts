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
    })
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
      } catch (e) {
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
 * Captures a single element as a canvas
 */
async function captureElementAsCanvas(element: HTMLElement, scale: number, width: number): Promise<HTMLCanvasElement> {
  return await html2canvas(element, {
    scale: scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: width,
    windowHeight: element.offsetHeight,
    width: width,
    height: element.offsetHeight,
    x: 0,
    y: 0,
    foreignObjectRendering: false,
    imageTimeout: 0,
  });
}

export async function generateReportPDF(
  element: HTMLElement,
  options: GeneratePDFOptions = {}
): Promise<void> {
  const { filename = 'valuation-report.pdf', quality = 0.95, scale = 2 } = options;

  let container: HTMLElement | null = null;
  
  try {
    // Wait for all resources to load first
    await waitForResources(element);
    
    // PDF dimensions
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margins = 10; // 10mm margins
    const contentWidth = pageWidth - (margins * 2);
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let currentY = margins;
    let isFirstElement = true;
    
    // Get all major sections that should be kept together
    const sections = element.querySelectorAll(
      '#valuation-report > *:not(script):not(style)'
    );
    
    console.log(`Found ${sections.length} sections to process`);
    
    // Create container for rendering elements
    container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.zIndex = '-9999';
    container.style.pointerEvents = 'none';
    container.style.width = `${element.offsetWidth}px`;
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Process each section separately
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;
      
      // Clone and fix colors for this section
      const clonedSection = cloneAndFixColors(section);
      container.appendChild(clonedSection);
      
      // Small delay for rendering
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      // Capture this section as canvas
      const canvas = await captureElementAsCanvas(clonedSection, scale, element.offsetWidth);
      
      // Calculate dimensions in mm
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need a new page
      if (!isFirstElement && currentY + imgHeight > pageHeight - margins) {
        pdf.addPage();
        currentY = margins;
      }
      
      // Add the image to PDF
      const imgData = canvas.toDataURL('image/jpeg', quality);
      pdf.addImage(imgData, 'JPEG', margins, currentY, imgWidth, imgHeight);
      
      // Update position for next element
      currentY += imgHeight + 5; // 5mm spacing between sections
      isFirstElement = false;
      
      // Clean up this section
      container.removeChild(clonedSection);
      
      console.log(`Processed section ${i + 1}/${sections.length}, height: ${imgHeight.toFixed(2)}mm`);
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
