/**
 * Rasterizes public/field-o-logo.svg → public/og-image.png (1200×630).
 * WhatsApp / Facebook ignore SVG for og:image; PNG is required for previews.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svgPath = join(root, 'public/field-o-logo.svg')
const outPath = join(root, 'public/og-image.png')

const W = 1200
const H = 630
const bg = { r: 9, g: 9, b: 11, alpha: 1 }
const logoSize = 440

const svgBuffer = readFileSync(svgPath)
const logoPng = await sharp(svgBuffer, { density: 240 }).resize(logoSize, logoSize).png().toBuffer()

await sharp({
  create: { width: W, height: H, channels: 4, background: bg },
})
  .composite([{ input: logoPng, gravity: 'center' }])
  .png()
  .toFile(outPath)

console.log('og-image:', outPath)
