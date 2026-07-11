import type { ProfileCompatibility } from '../types/compatibility'
import type { CVProfile } from '../types/cvProfile'
import type {
  AnalyzeJobResponse,
  TailoredCvResult,
} from '../types/tailoredCv'
import type { JobDescriptionAnalysis } from '../types/jobDescription'

export const DEV_MOCK_JOB_DESCRIPTION = `About The Role

SafeRide Health is seeking a Senior Full-Stack Engineer to help design, build, and scale critical applications and platform services that support our mission of improving access to healthcare transportation nationwide. This role will partner closely with Engineering, Product, and Quality teams to deliver secure, scalable, and high-performing applications that directly impact healthcare operations and member experiences.

This is an opportunity to work in a fast-paced, mission-driven environment where engineers are empowered to innovate, solve complex technical challenges, and contribute to meaningful healthcare technology solutions.

Job Responsibilities

 Deliver new features and build new applications for the SafeRide platform
 Contribute high-quality, maintainable code utilizing best practices including RESTful API patterns, SOLID principles, and event-driven architectures
 Collaborate directly with Engineering, Product, and QA teams in an agile development environment
 Design, build, and maintain scalable production web services and APIs
 Support cloud-native application development and infrastructure within AWS environments
 Help improve system reliability, security, performance, and scalability across applications and services
 Participate in code reviews, testing, debugging, and continuous improvement initiatives
 Innovate within a complex, regulated healthcare environment while maintaining security and compliance standards

Required Qualifications

 5+ years of experience delivering secure, scalable web applications
 5+ years of experience with one or more of the following technologies: Node.js (JavaScript), React, or PHP
 4+ years of experience building and supporting production-level web or API applications
 3+ years of experience with modern build tooling such as Webpack and Babel
 Demonstrated experience building and maintaining production web services at scale, particularly using asynchronous patterns
 Experience designing and integrating RESTful APIs
 Experience with SQL and/or NoSQL databases including MySQL, PostgreSQL, or MongoDB
 Experience working with Docker containers and containerized application deployments
 Experience working within AWS cloud environments including services such as ECS/Fargate, Lambda, CloudFront, Redshift, and queuing technologies
 Experience working in agile development environments using tools such as Jira, GitHub, and collaboration platforms
 Experience with unit and integration testing
 Strong debugging, troubleshooting, and optimization skills
 Experience working in healthcare and/or highly secure, regulated environments Preferred Qualifications
 Experience working within microservice architectures
 Experience with event-driven systems and WebSocket services
 Passion for learning new tools, technologies, workflows, and engineering philosophies
 Experience contributing to scalable distributed systems

Benefits

We offer a remote-first work environment, competitive compensation, and comprehensive benefits including:

Career growth and development opportunities in a mission-driven organization

Competitive salary and annual bonus opportunities

Remote with flexible hours

Comprehensive medical, dental, and vision insurance

401(k) with company match

Generous PTO, paid company holidays, and paid parental leave

About Us

SafeRide Health is a technology and services company dedicated to reducing barriers to care by improving the delivery of non-emergency medical transportation to people across America. SafeRide employs proprietary technology, paired with a nationwide network of vetted transportation providers. This enables payers and health systems to deliver cost-effective, on-demand transportation intelligently, enhancing the patient experience in the process. SafeRide serves the largest Medicare Advantage, Medicaid, and provider programs in the country. Learn more at www.saferidehealth.com.`

export const DEV_MOCK_SOURCE_PROFILE: CVProfile = {
  skills: [
    'LLMs (OpenAI, Claude)',
    'LangChain',
    'LlamaIndex',
    'RAG Architecture',
    'Prompt Engineering',
    'N8N',
    'Vector Search',
    'Agentic Workflows',
    'Semantic Caching',
    'Python',
    'Node.js (Nest.js, Express)',
    'PostgreSQL',
    'Supabase',
    'Microservices',
    'REST APIs',
    'GraphQL',
    'Docker',
    'AWS',
    'GCP',
    'Vercel',
    'Git',
    'TypeScript',
    'JavaScript',
    'Next.js',
    'React',
    'React Native',
    'TailwindCSS',
    'Zustand',
    'Agile/Scrum',
    'GA4',
    'GTM',
    'New Relic',
  ],
  summary:
    'AI Software Engineer with 7+ years of experience building scalable, production-grade applications and integrating advanced Artificial Intelligence solutions. Expert in orchestrating Large Language Models (LLMs), developing Retrieval-Augmented Generation (RAG) pipelines, and building intelligent agents. Strong full-stack foundation (Next.js, Python, Node.js) combined with deep expertise in AI, LLMs.',
  education: [],
  languages: [],
  experience: [
    {
      role: 'AI & Full Stack Senior Engineer (Remote)',
      bullets: [
        'Build and maintain scalable UI/UX functionalities for Sears utilizing Next.js, managing complex state efficiently with the Context API and Redux.',
        'Optimize prompt strategies, vector database retrieval, and context-window management to improve AI response accuracy by 15% and reduce API token consumption by 20%.',
        'Migrated the web infrastructure from Next.js pages router to app router, optimizing performance to meet Core Web Vitals resulting in a 30% increase in page load speeds.',
        'Implement advanced data tracking and analytical layers using Google Tag Manager (GTM) and GA4 to monitor user-AI interactions and system behavior.',
      ],
      company: 'Mission.dev',
      endDate: 'Present',
      startDate: 'Nov 2024',
    },
    {
      role: 'Full Stack Senior Engineer (Remote)',
      bullets: [
        'Engineered a highly dynamic real estate auction platform leveraging Next.js and a microservices backend, implementing good practices to handle real-time concurrent bidding.',
        'Developed and optimized high-performance data pipelines and secure backend integrations with multiple third-party SaaS and transactional APIs.',
        'Designed and implemented a custom, enterprise-grade cryptographic authentication mechanism utilizing PKCS12 certificates to ensure high-security user access.',
        'Mentored cross-functional team members on modern engineering practices and agile workflows to accelerate sprint delivery cycles.',
      ],
      company: 'Roraima Devs',
      endDate: 'Aug 2024',
      startDate: 'Feb 2024',
    },
    {
      role: 'AI & Full Stack Developer (Remote)',
      bullets: [
        'Built intelligent Conversational AI Interfaces utilizing Next.js, capable of accurately processing and responding to customer inquiries using natural language.',
        'Architected and deployed microservices to handle complex client requirements within a highly scalable and secure infrastructure.',
      ],
      company: 'Akaven',
      endDate: 'Dec 2023',
      startDate: 'Sep 2023',
    },
    {
      role: 'Full Stack Developer (Remote)',
      bullets: [
        'Developed a highly responsive, low-latency UI for a global capital investment firm using React.js, optimizing frontend performance for real-time financial market updates.',
        'Built reusable, platform-agnostic UI components for an enterprise design system deployed across a Swiss multinational medical care platform called Novartis.',
      ],
      company: 'Altimetrik',
      endDate: 'May 2022',
      startDate: 'Sep 2021',
    },
  ],
  personalInfo: {
    name: 'Anthony Gonzalez',
    email: 'robwert1997@gmail.com',
    phone: '+584243617235',
    website: 'https://anthondev.com/',
    linkedin: 'www.linkedin.com/in/anthondev/',
    location: 'Apure, Venezuela',
  },
  certifications: ['EFSET English Certificate C1 Proficient (EFSET)'],
}

export const DEV_MOCK_ANALYSIS: JobDescriptionAnalysis = {
  roleTitle: 'Senior Full-Stack Engineer',
  seniority: 'senior',
  keywords: [
    'Full-Stack Engineer',
    'Node.js',
    'JavaScript',
    'React',
    'PHP',
    'RESTful API',
    'SOLID principles',
    'event-driven architectures',
    'agile',
    'AWS',
    'Amazon Web Services',
    'Webpack',
    'Babel',
    'SQL',
    'NoSQL',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Docker',
    'ECS',
    'Fargate',
    'Lambda',
    'CloudFront',
    'Redshift',
    'Jira',
    'GitHub',
    'microservice architectures',
    'WebSocket',
    'distributed systems',
    'healthcare technology',
  ],
  requiredSkills: [
    '5+ years of experience delivering secure, scalable web applications',
    '5+ years of experience with Node.js, JavaScript, React, or PHP',
    '4+ years of experience building and supporting production-level web or API applications',
    '3+ years of experience with Webpack and Babel',
    'Experience building and maintaining production web services at scale',
    'Experience designing and integrating RESTful APIs',
    'Experience with SQL and NoSQL databases including MySQL, PostgreSQL, or MongoDB',
    'Experience working with Docker containers',
    'Experience working within AWS cloud environments',
    'Experience working in agile development environments',
    'Experience with unit and integration testing',
    'Strong debugging, troubleshooting, and optimization skills',
    'Experience working in healthcare or highly secure, regulated environments',
  ],
  preferredSkills: [
    'Experience working within microservice architectures',
    'Experience with event-driven systems and WebSocket services',
    'Experience contributing to scalable distributed systems',
  ],
  responsibilities: [
    'Deliver new features and build new applications for the SafeRide platform',
    'Contribute high-quality, maintainable code utilizing best practices',
    'Collaborate directly with Engineering, Product, and QA teams',
    'Design, build, and maintain scalable production web services and APIs',
    'Support cloud-native application development and infrastructure within AWS',
    'Improve system reliability, security, performance, and scalability',
    'Participate in code reviews, testing, debugging, and continuous improvement',
    'Innovate within a complex, regulated healthcare environment',
  ],
}

export const DEV_MOCK_COMPATIBILITY: ProfileCompatibility = {
  score: 78,
  skillsScore: 82,
  summary:
    'Strong overlap on Node.js, React, REST APIs, AWS, Docker, PostgreSQL, and microservices. Gaps in PHP, Webpack/Babel toolchain, and some AWS-specific services.',
  strengths: [
    '7+ years building scalable web applications with Node.js and React',
    'Production REST APIs, microservices, and Docker deployments',
    'AWS and PostgreSQL experience',
    'Agile delivery and regulated healthcare exposure (Novartis)',
  ],
  gaps: [
    'PHP not listed in source profile',
    'Webpack and Babel not explicitly mentioned',
    'Limited direct healthcare transportation domain experience',
  ],
  location: {
    candidateLocation: 'Apure, Venezuela',
    jobLocation: 'Remote (US)',
    remotePolicy: 'Remote-first',
    eligibility: 'likely_eligible',
    verdict:
      'Remote-first role; strong technical fit. Verify work authorization requirements for a US healthcare company.',
    restrictions: ['Work authorization may be required'],
  },
}

export const DEV_MOCK_ANALYZE_RESPONSE: AnalyzeJobResponse = {
  analysis: DEV_MOCK_ANALYSIS,
  compatibility: DEV_MOCK_COMPATIBILITY,
}

export const DEV_MOCK_TAILOR_RESULT: TailoredCvResult = {
  profile: {
    ...DEV_MOCK_SOURCE_PROFILE,
    summary:
      'Senior Full-Stack Engineer with 7+ years delivering secure, scalable web applications using Node.js, React, TypeScript, and RESTful APIs. Proven track record building production microservices, Dockerized deployments, and AWS-backed platforms in agile, cross-functional teams — including regulated healthcare environments.',
    experience: [
      {
        ...DEV_MOCK_SOURCE_PROFILE.experience[0],
        bullets: [
          'Build and maintain scalable full-stack features for Sears using Next.js and React, delivering RESTful integrations and performance optimizations that improved Core Web Vitals by 30%.',
          'Design maintainable service boundaries and API contracts while collaborating with product and QA in an agile delivery cadence.',
          'Optimize backend-adjacent workflows and monitoring layers (GTM, GA4) to improve reliability and observability of production web services.',
          'Participate in code reviews, debugging, and iterative performance tuning across the application stack.',
        ],
      },
      {
        ...DEV_MOCK_SOURCE_PROFILE.experience[1],
        bullets: [
          'Engineered a real-time auction platform with a Next.js frontend and Node.js microservices backend, applying SOLID principles and secure REST API patterns.',
          'Built high-performance data pipelines and third-party API integrations deployed with Docker in cloud environments.',
          'Implemented enterprise-grade authentication and mentored engineers on testing, troubleshooting, and agile best practices.',
        ],
      },
      {
        ...DEV_MOCK_SOURCE_PROFILE.experience[2],
        bullets: [
          'Developed conversational web interfaces with React/Next.js backed by scalable microservices and production REST APIs.',
          'Supported containerized deployments and integration testing for client-facing platform features.',
        ],
      },
      {
        ...DEV_MOCK_SOURCE_PROFILE.experience[3],
        bullets: [
          'Delivered low-latency React UIs for a global investment firm with a focus on debugging, optimization, and maintainable component architecture.',
          'Contributed to an enterprise design system used on a regulated healthcare platform (Novartis), aligning with secure, compliance-sensitive delivery practices.',
        ],
      },
    ],
  },
  meta: {
    roleTitle: 'Senior Full-Stack Engineer',
    matchedKeywords: [
      'Full-Stack Engineer',
      'Node.js',
      'JavaScript',
      'React',
      'RESTful API',
      'AWS',
      'Docker',
      'PostgreSQL',
      'Microservices',
      'agile',
      'healthcare technology',
    ],
    matchedSkills: [
      'Node.js (Nest.js, Express)',
      'React',
      'TypeScript',
      'JavaScript',
      'REST APIs',
      'PostgreSQL',
      'Docker',
      'AWS',
      'Microservices',
      'Agile/Scrum',
      'Git',
    ],
    missingFromCv: [
      'PHP',
      'Webpack',
      'Babel',
      'MySQL',
      'MongoDB',
      'ECS/Fargate',
      'Lambda',
      'WebSocket',
    ],
    adaptationNotes: [
      'Reframed summary toward full-stack delivery, REST APIs, and AWS/Docker production experience.',
      'Highlighted Novartis healthcare platform work to align with regulated environment requirements.',
      'Rewrote bullets to emphasize Node.js, React, microservices, and agile collaboration without inventing new roles.',
    ],
  },
}

const DEV_MOCK_DELAY_MS = 700

export function devMockDelay(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, DEV_MOCK_DELAY_MS)
  })
}
