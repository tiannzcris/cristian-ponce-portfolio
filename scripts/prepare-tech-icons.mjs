import { mkdir, writeFile } from 'node:fs/promises'
import plain from '@iconify-json/devicon-plain/icons.json' with { type: 'json' }
import original from '@iconify-json/devicon/icons.json' with { type: 'json' }

const names = [
  'php',
  'laravel',
  'html5',
  'css3',
  'javascript',
  'react',
  'csharp',
  'dotnetcore',
  'mysql',
  'microsoftsqlserver',
  'mongodb',
  'git',
  'github',
]
await mkdir('public/icons/technologies', { recursive: true })
for (const name of names) {
  const data = plain.icons[name] ? plain : original
  const icon = data.icons[name]
  if (!icon) throw new Error(`Missing icon ${name}`)
  // The logos are rendered through a CSS mask so a single local SVG works on either palette.
  await writeFile(
    `public/icons/technologies/${name}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.width ?? data.width} ${icon.height ?? data.height}">${icon.body}</svg>\n`,
  )
}
console.log(`Prepared ${names.length} local Devicon logos.`)
