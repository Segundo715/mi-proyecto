import sharp from 'sharp'

// Convierte cualquier imagen a WebP (quality 82).
// SVG se devuelve sin modificar (es vector, no tiene sentido rasterizar).
export async function toWebp(
  buffer: Buffer,
  mimeType: string,
): Promise<{ data: Buffer; contentType: string; ext: string }> {
  if (mimeType === 'image/svg+xml') {
    return { data: buffer, contentType: 'image/svg+xml', ext: '.svg' }
  }

  const data = await sharp(buffer)
    .webp({ quality: 82, effort: 4 })
    .toBuffer()

  return { data, contentType: 'image/webp', ext: '.webp' }
}
