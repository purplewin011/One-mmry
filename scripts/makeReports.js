import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const reportsDir = join(process.cwd(), 'reports')

function looksLikeUtf16(buffer) {
  // crude check: presence of many 0x00 bytes in the first 200 bytes
  let zeros = 0
  const len = Math.min(buffer.length, 200)
  for (let i = 0; i < len; i++) if (buffer[i] === 0) zeros++
  return zeros > len * 0.2
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function main() {
  const files = await readdir(reportsDir)
  const txts = files.filter(f => f.endsWith('.txt'))
  for (const name of txts) {
    const path = join(reportsDir, name)
    const buf = await readFile(path)
    const encoding = looksLikeUtf16(buf) ? 'utf16le' : 'utf8'
    const text = buf.toString(encoding)
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Test report - ${name}</title>
  <style>body{font-family:system-ui,Segoe UI,Arial;background:#fff;color:#111;padding:20px}pre{white-space:pre-wrap;background:#f7f7f9;border:1px solid #e1e1e8;padding:16px;border-radius:6px}</style>
</head>
<body>
  <h1>Test report: ${name}</h1>
  <pre>${escapeHtml(text)}</pre>
</body>
</html>`

    const outName = name.replace(/\.txt$/, '.html')
    await writeFile(join(reportsDir, outName), html, 'utf8')
    console.log('wrote', outName)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
