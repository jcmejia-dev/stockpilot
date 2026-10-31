import chunk0 from './chunk00.txt?raw'
import chunk1 from './chunk01.txt?raw'
import chunk2 from './chunk02.txt?raw'

const data = `${chunk0}${chunk1}${chunk2}`.replace(/\s+/g, '')
const mime = data.startsWith('iVBOR') ? 'image/png' : data.startsWith('UklGR') ? 'image/webp' : 'image/png'

export const exactAuthDataUrl = `url("data:${mime};base64,${data}")`
