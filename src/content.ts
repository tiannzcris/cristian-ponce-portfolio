export type Project = {
  id: string
  number: string
  title: string
  subtitle: string
  category: string
  description: string
  tags: string[]
  url: string
  image?: string
  imageAlt?: string
  features?: string[]
}

export type Certificate = {
  id: string
  title: string
  category: 'Award' | 'Code camp completion' | 'Seminar participation' | 'Assessment result'
  detail: string
  date: string
  dateLabel: string
  image: string
  thumbnail: string
  alt: string
}

export type Technology = { name: string; icon?: string }

export type SkillGroup = {
  number: string
  title: string
  description?: string
  items: string[]
}

export const profile = {
  name: 'Cristian N. Ponce',
  title: 'Aspiring Software Developer',
  headline: 'Building ideas into practical digital experiences.',
  introduction:
    'I’m Cristian, a BSIT student developing web, mobile, and desktop applications, with learning interests in networking and cybersecurity.',
  about: [
    'I’m Cristian N. Ponce, a fourth-year BS Information Technology student. I enjoy turning ideas into practical applications and expanding my skills across different technologies.',
    'My web development experience spans the Laravel framework, the .NET platform with C# and ASP.NET MVC, and the MERN stack. I also develop mobile applications with Flutter and Dart, and desktop applications with PHP, Laravel, and NativePHP.',
    'I aim to build a freelance career in application development while deepening my knowledge of networking and cybersecurity. I’m also interested in opportunities in the maritime industry, where I hope to apply and expand my technical skills.',
  ],
  education: 'Infotech Development Systems Colleges, Inc.',
  degree: 'BS Information Technology · Fourth year',
  contactHeading: 'Let’s build something useful.',
  contactCopy:
    'Interested in collaborating or discussing a project? Connect with me on LinkedIn or explore my work on GitHub.',
  socials: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/cristian-ponce-8485ab426/' },
    { label: 'GitHub', url: 'https://github.com/tiannzcris' },
  ],
}

export const navigation = ['About', 'Skills', 'Projects', 'Achievements', 'Contact']

export const technologies: Technology[] = [
  { name: 'PHP', icon: 'php' },
  { name: 'Laravel', icon: 'laravel' },
  { name: 'MySQL', icon: 'mysql' },
  { name: 'HTML', icon: 'html5' },
  { name: 'CSS', icon: 'css3' },
  { name: 'JavaScript', icon: 'javascript' },
  { name: 'C#', icon: 'csharp' },
  { name: '.NET', icon: 'dotnetcore' },
  { name: 'ASP.NET MVC' },
  { name: 'Microsoft SQL Server', icon: 'microsoftsqlserver' },
  { name: 'MongoDB', icon: 'mongodb' },
  { name: 'Express', icon: 'express' },
  { name: 'React', icon: 'react' },
  { name: 'Node.js', icon: 'nodejs' },
  { name: 'Flutter', icon: 'flutter' },
  { name: 'Dart', icon: 'dart' },
  { name: 'NativePHP' },
  { name: 'Git', icon: 'git' },
  { name: 'GitHub', icon: 'github' },
]

export const skills: SkillGroup[] = [
  {
    number: '01',
    title: 'Web — Laravel stack',
    description: 'Web applications built with the Laravel PHP framework.',
    items: ['PHP', 'Laravel', 'MySQL', 'HTML', 'CSS', 'JavaScript'],
  },
  {
    number: '02',
    title: 'Web — .NET stack',
    description: 'Web development on the .NET platform using ASP.NET MVC.',
    items: ['C#', 'ASP.NET MVC', 'Microsoft SQL Server'],
  },
  {
    number: '03',
    title: 'Web — MERN stack',
    items: ['MongoDB', 'Express', 'React', 'Node.js'],
  },
  { number: '04', title: 'Mobile', items: ['Flutter', 'Dart'] },
  {
    number: '05',
    title: 'Desktop',
    description: 'Desktop applications using the Laravel framework with NativePHP.',
    items: ['PHP', 'Laravel', 'NativePHP'],
  },
  { number: '06', title: 'Tools', items: ['Git', 'GitHub'] },
]

export const learningInterests = {
  title: 'Learning interests',
  items: ['Networking', 'Cybersecurity'],
}

export const projects: Project[] = [
  {
    id: 'e-likas',
    number: '01',
    title: 'E-LIKAS',
    subtitle: 'Electronic Ligao Kaligtasan Sistema',
    category: 'Featured capstone',
    description:
      'A capstone disaster evacuation system designed for Ligao City, Albay, supporting public access to evacuation information and helping CSWDO and barangay personnel coordinate evacuation operations.',
    tags: ['Laravel', 'PHP', 'MySQL', 'PHP-ML Linear Regression'],
    url: 'https://e-likasligao.online/',
    image: '/images/projects/e-likas.webp',
    imageAlt:
      'Supplied E-LIKAS showcase showing the evacuation management dashboard on a laptop and resident information on two phones.',
    features: [
      'Evacuation center information & monitoring',
      'Family & evacuee registration',
      'Hazard maps & advisories',
      'Relief distribution records',
      'Predictive analytics',
      'Offline support',
    ],
  },
  {
    id: 'windows-dictionary',
    number: '02',
    title: 'Windows Server Dictionary',
    subtitle: 'A reference for the systems behind the software.',
    category: 'Learning tool',
    description:
      'A searchable reference for Windows Server terms, abbreviations, and definitions, organized into topics such as networking, identity, storage, and security.',
    tags: ['Windows Server', 'Searchable reference', 'Learning'],
    url: 'https://windows-server-dictionary.vercel.app/',
    image: '/images/projects/windows-server.webp',
    imageAlt:
      'Windows Server Dictionary interface with a search field, topic categories, and cards explaining server terminology.',
  },
  {
    id: 'sui-code-camp',
    number: '03',
    title: 'DEVCON Sui Move',
    subtitle: 'Code Camp 2026 Project',
    category: 'Code camp project',
    description:
      'A proof-of-learning portfolio created during the DEVCON Sui Move Code Camp 2026, introducing Sui Move smart contracts and linking to the code camp’s on-chain learning record.',
    tags: ['DEVCON', 'Sui Move code camp', '2026'],
    url: 'https://devconsui-move-code-camp2026-level1-sable-nu.vercel.app/',
    image: '/images/projects/sui-code-camp.webp',
    imageAlt:
      'Public DEVCON Sui Move code camp portfolio showing Cristian’s introduction and the Smart Contracts Code Camp Portfolio heading.',
  },
]

export const certificates: Certificate[] = [
  {
    id: 'web-champion',
    title: 'Web Development Champion',
    category: 'Award',
    detail: 'Champion — Web Development Competition, IT Days 2025',
    date: '2025-04-23',
    dateLabel: 'April 23, 2025',
    image: '/images/certificates/web-development-champion.webp',
    thumbnail: '/images/certificates/web-development-champion-thumb.webp',
    alt: 'Certificate of Recognition awarded to Cristian N. Ponce as Champion of the Web Development Competition at IT Days 2025, April 23, 2025.',
  },
  {
    id: 'image-editing',
    title: 'Image Editing Competition',
    category: 'Award',
    detail: '3rd Place · IT Days 2026',
    date: '2026-04-06',
    dateLabel: 'April 6, 2026',
    image: '/images/certificates/image-editing-third-place.webp',
    thumbnail: '/images/certificates/image-editing-third-place-thumb.webp',
    alt: 'Certificate of Recognition awarded to Cristian Ponce as 3rd Placer in the Image Editing Competition at IT Days 2026, April 6, 2026.',
  },
  {
    id: 'devcon',
    title: 'DEVCON Legazpi × Sui',
    category: 'Code camp completion',
    detail: 'Code Camp 2026 · Certificate of Completion',
    date: '2026-07-30',
    dateLabel: 'July 30, 2026',
    image: '/images/certificates/devcon-sui-completion.webp',
    thumbnail: '/images/certificates/devcon-sui-completion-thumb.webp',
    alt: 'Certificate of Completion for Cristian Ponce, DEVCON Legazpi × Sui Code Camp 2026, presented July 30, 2026.',
  },
  {
    id: 'topcit',
    title: 'TOPCIT · Level 2',
    category: 'Assessment result',
    detail: 'Test of Practical Competency in ICT',
    date: '2026-07-23',
    dateLabel: 'July 23, 2026',
    image: '/images/certificates/topcit-level-2-redacted.webp',
    thumbnail: '/images/certificates/topcit-level-2-redacted-thumb.webp',
    alt: 'TOPCIT assessment result for Cristian Nero Ponce, Level 2, test date July 23, 2026. Date of birth, certificate number, and verification codes are redacted.',
  },
  {
    id: 'cloud',
    title: 'Cloud Computing',
    category: 'Seminar participation',
    detail: 'Emerging trends & the future of web services',
    date: '2024-11-13',
    dateLabel: 'November 13, 2024',
    image: '/images/certificates/cloud-computing-participation.webp',
    thumbnail: '/images/certificates/cloud-computing-participation-thumb.webp',
    alt: 'Certificate of Participation for Cristian N. Ponce in the Cloud Computing seminar at Infotech Development Systems Colleges, Inc., November 13, 2024.',
  },
  {
    id: 'animation',
    title: 'Animation & Application Development',
    category: 'Seminar participation',
    detail: 'Character animation & motion capture',
    date: '2024-11-13',
    dateLabel: 'November 13, 2024',
    image: '/images/certificates/animation-participation.webp',
    thumbnail: '/images/certificates/animation-participation-thumb.webp',
    alt: 'Certificate of Participation for Cristian N. Ponce in Animation & Application Development and Character Animation and Motion Capture, November 13, 2024.',
  },
]
