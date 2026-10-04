export type Rect = { x: number; y: number; width: number; height: number }

export function drawRedactions(canvas: HTMLCanvasElement, rects: Rect[]) {
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  // Round outward so that export cannot expose the edges of selected content.
  rects.forEach(rect => ctx.fillRect(Math.floor(rect.x * canvas.width), Math.floor(rect.y * canvas.height), Math.ceil(rect.width * canvas.width) + 1, Math.ceil(rect.height * canvas.height) + 1))
}

export async function exportRasterPdf(pages: HTMLCanvasElement[]): Promise<Blob> {
  const { jsPDF } = await import('jspdf')
  const first = pages[0]
  const pdf = new jsPDF({ orientation: first.width > first.height ? 'landscape' : 'portrait', unit: 'px', format: [first.width, first.height], compress: true })
  pages.forEach((canvas, index) => {
    if (index) pdf.addPage([canvas.width, canvas.height], canvas.width > canvas.height ? 'landscape' : 'portrait')
    // Only the final raster is embedded: no text layer, original bytes or masks.
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height)
  })
  return pdf.output('blob')
}
