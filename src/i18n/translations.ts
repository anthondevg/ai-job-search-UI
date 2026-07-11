import type { Language, Translations } from './types'

export const translations: Record<Language, Translations> = {
  en: {
    app: {
      name: 'Job Search',
      version: 'AI Job Search UI v0.1',
    },
    nav: {
      cv: 'CV',
      jobScraperMarket: 'Job Scraper Market',
    },
    sidebar: {
      expand: 'Expand sidebar',
      collapse: 'Collapse sidebar',
      closeMenu: 'Close menu',
    },
    layout: {
      openMenu: 'Open menu',
    },
    language: {
      label: 'Language',
      en: 'English',
      es: 'Spanish',
    },
    pages: {
      cv: {
        title: 'CV',
        description:
          'Import, manage, and generate tailored CVs from your real experience.',
        tabs: {
          label: 'CV sections',
          import: 'Import',
          generate: 'Generate',
        },
        upload: {
          title: 'Import your CV',
          description:
            'Drop a PDF here to extract your experience, skills, and summary without inventing data.',
          dropzone: 'Drag & drop your PDF here, or click to browse',
          hint: 'PDF only · Max 10 MB',
          parsing: 'Parsing your CV with Gemini...',
          replace: 'Upload a different CV',
          errors: {
            invalidType: 'Only PDF files are supported.',
            tooLarge: 'The PDF must be 10 MB or smaller.',
            empty: 'The selected file is empty.',
            parseFailed: 'Failed to parse the CV. Please try again.',
          },
        },
        library: {
          title: 'Saved CVs',
          description: 'Your parsed CVs are stored and available after reload.',
          loading: 'Loading saved CVs...',
          empty: 'No saved CVs yet. Upload your first PDF in the Import tab.',
          active: 'Active',
          delete: 'Delete CV',
          errors: {
            loadFailed: 'Failed to load saved CVs.',
            deleteFailed: 'Failed to delete the CV.',
          },
        },
        preview: {
          title: 'Extracted CV profile',
          sourceOfTruth: 'Source of truth',
          personalInfo: 'Personal info',
          name: 'Name',
          email: 'Email',
          location: 'Location',
          summary: 'Summary',
          skills: 'Skills',
          experience: 'Experience',
          empty: 'Not found in the PDF',
        },
        generate: {
          activeCv: 'Active CV',
          noActiveCv: 'No active CV. Import one in the Import tab first.',
          jobDescription: {
            title: 'Job description',
            description:
              'Paste the full posting from LinkedIn, Indeed, InfoJobs, or a company careers page.',
            label: 'Job description',
            placeholder:
              'Paste the job title, responsibilities, requirements, and skills from the posting here...',
            hint: 'Include the full text for better keyword and skill extraction.',
            clear: 'Clear',
            characterCountLabel: 'Characters',
          },
          outputLanguage: {
            label: 'CV output language',
            hint: 'Summary and experience bullets will be written in this language. Skills and tech names stay as in your source CV.',
            en: 'English',
            es: 'Spanish',
          },
          compatibility: {
            title: 'Profile fit',
            match: 'Match',
            skillsScore: 'Skills match',
            strengths: 'Strengths',
            gaps: 'Gaps',
            level: {
              strong: 'Strong fit for this role',
              good: 'Good fit with some gaps',
              partial: 'Partial fit — consider tailoring your CV',
              weak: 'Weak fit — major requirements missing',
            },
            location: {
              title: 'Location & remote eligibility',
              candidate: 'Your location',
              job: 'Job location',
              remotePolicy: 'Remote / work policy',
              eligibility: {
                eligible: 'You can likely apply from your location',
                likely_eligible: 'Good chance — verify remote policy',
                unclear: 'Location requirements unclear — check before applying',
                unlikely: 'Low chance — geo or work-auth restrictions apply',
                ineligible: 'Very unlikely — location or authorization blocks you',
              },
            },
          },
          analysis: {
            title: 'Job analysis',
            description: 'Keywords and skills extracted from the posting.',
            roleTitle: 'Role',
            seniority: 'Seniority',
            keywords: 'ATS keywords',
            requiredSkills: 'Required skills',
            preferredSkills: 'Preferred skills',
          },
          actions: {
            analyze: 'Analyze job description',
            analyzing: 'Analyzing...',
            generate: 'Generate tailored CV',
            generating: 'Generating...',
          },
          tailored: {
            badge: 'Tailored CV',
            matchedSkills: 'Matched job skills',
            matchedKeywords: 'Matched ATS keywords',
            adaptationNotes: 'What changed',
            missingFromCv: 'Skills in the job but not in your CV',
            missingFromCvHint:
              'These were not added to your CV — only real experience from your source profile is used.',
          },
          pdf: {
            previewTitle: 'CV document',
            previewDescription:
              'ATS-friendly PDF preview. Download and submit to job portals.',
            download: 'Download PDF',
            downloading: 'Preparing PDF...',
            downloadFailed: 'Failed to generate the PDF. Please try again.',
            loadingPreview: 'Loading PDF preview...',
            summary: 'Professional Summary',
            skills: 'Skills',
            experience: 'Experience',
            education: 'Education',
            languages: 'Languages',
            certifications: 'Certifications',
          },
          errors: {
            jobDescriptionTooShort:
              'Paste a longer job description before continuing (at least 50 characters).',
            analyzeFailed: 'Failed to analyze the job description. Please try again.',
            analysisRequired: 'Analyze the job description before generating a tailored CV.',
            generateFailed: 'Failed to generate the tailored CV. Please try again.',
          },
        },
      },
      jobScraperMarket: {
        title: 'Job Scraper Market',
        description: 'Browse and manage job scraping sources and market data.',
        placeholderTitle: 'Job Scraper Market',
        placeholderDescription: 'Content for this page will go here.',
      },
    },
  },
  es: {
    app: {
      name: 'Búsqueda de Empleo',
      version: 'AI Job Search UI v0.1',
    },
    nav: {
      cv: 'CV',
      jobScraperMarket: 'Mercado Job Scraper',
    },
    sidebar: {
      expand: 'Expandir barra lateral',
      collapse: 'Contraer barra lateral',
      closeMenu: 'Cerrar menú',
    },
    layout: {
      openMenu: 'Abrir menú',
    },
    language: {
      label: 'Idioma',
      en: 'Inglés',
      es: 'Español',
    },
    pages: {
      cv: {
        title: 'CV',
        description:
          'Importa, gestiona y genera CVs adaptados a partir de tu experiencia real.',
        tabs: {
          label: 'Secciones de CV',
          import: 'Importar',
          generate: 'Generar',
        },
        upload: {
          title: 'Importar tu CV',
          description:
            'Arrastra un PDF aquí para extraer experiencia, skills y resumen sin inventar datos.',
          dropzone: 'Arrastra y suelta tu PDF aquí, o haz clic para buscar',
          hint: 'Solo PDF · Máx. 10 MB',
          parsing: 'Analizando tu CV con Gemini...',
          replace: 'Subir otro CV',
          errors: {
            invalidType: 'Solo se admiten archivos PDF.',
            tooLarge: 'El PDF debe pesar 10 MB o menos.',
            empty: 'El archivo seleccionado está vacío.',
            parseFailed: 'No se pudo analizar el CV. Inténtalo de nuevo.',
          },
        },
        library: {
          title: 'CVs guardados',
          description: 'Tus CVs parseados se guardan y siguen disponibles al recargar.',
          loading: 'Cargando CVs guardados...',
          empty: 'Aún no hay CVs guardados. Sube tu primer PDF en la pestaña Importar.',
          active: 'Activo',
          delete: 'Eliminar CV',
          errors: {
            loadFailed: 'No se pudieron cargar los CVs guardados.',
            deleteFailed: 'No se pudo eliminar el CV.',
          },
        },
        preview: {
          title: 'Perfil extraído del CV',
          sourceOfTruth: 'Fuente de verdad',
          personalInfo: 'Información personal',
          name: 'Nombre',
          email: 'Correo',
          location: 'Ubicación',
          summary: 'Resumen',
          skills: 'Skills',
          experience: 'Experiencia',
          empty: 'No encontrado en el PDF',
        },
        generate: {
          activeCv: 'CV activo',
          noActiveCv: 'No hay CV activo. Importa uno en la pestaña Importar primero.',
          jobDescription: {
            title: 'Descripción del puesto',
            description:
              'Pega el anuncio completo de LinkedIn, Indeed, InfoJobs o la página de careers de una empresa.',
            label: 'Descripción del puesto',
            placeholder:
              'Pega aquí el título, responsabilidades, requisitos y skills del anuncio...',
            hint: 'Incluye el texto completo para una mejor extracción de keywords y skills.',
            clear: 'Limpiar',
            characterCountLabel: 'Caracteres',
          },
          outputLanguage: {
            label: 'Idioma del CV generado',
            hint: 'El resumen y los bullets de experiencia se escribirán en este idioma. Skills y tecnologías se mantienen como en tu CV fuente.',
            en: 'Inglés',
            es: 'Español',
          },
          compatibility: {
            title: 'Compatibilidad con el puesto',
            match: 'Match',
            skillsScore: 'Match de skills',
            strengths: 'Fortalezas',
            gaps: 'Brechas',
            level: {
              strong: 'Encaje fuerte para este rol',
              good: 'Buen encaje con algunas brechas',
              partial: 'Encaje parcial — conviene adaptar el CV',
              weak: 'Encaje débil — faltan requisitos importantes',
            },
            location: {
              title: 'Ubicación y elegibilidad remota',
              candidate: 'Tu ubicación',
              job: 'Ubicación del empleo',
              remotePolicy: 'Política remota / trabajo',
              eligibility: {
                eligible: 'Puedes aplicar desde tu ubicación',
                likely_eligible: 'Buenas chances — confirma la política remota',
                unclear: 'Requisitos de ubicación poco claros — verifica antes de aplicar',
                unlikely: 'Pocas chances — hay restricciones geo o de autorización',
                ineligible: 'Muy improbable — ubicación o autorización te bloquea',
              },
            },
          },
          analysis: {
            title: 'Análisis del puesto',
            description: 'Keywords y skills extraídas del anuncio.',
            roleTitle: 'Rol',
            seniority: 'Seniority',
            keywords: 'Keywords ATS',
            requiredSkills: 'Skills requeridas',
            preferredSkills: 'Skills deseables',
          },
          actions: {
            analyze: 'Analizar descripción',
            analyzing: 'Analizando...',
            generate: 'Generar CV adaptado',
            generating: 'Generando...',
          },
          tailored: {
            badge: 'CV adaptado',
            matchedSkills: 'Skills del puesto matcheadas',
            matchedKeywords: 'Keywords ATS matcheadas',
            adaptationNotes: 'Qué cambió',
            missingFromCv: 'Skills del puesto que no están en tu CV',
            missingFromCvHint:
              'No se añadieron a tu CV — solo se usa experiencia real de tu perfil fuente.',
          },
          pdf: {
            previewTitle: 'Documento CV',
            previewDescription:
              'Vista previa PDF optimizada para ATS. Descárgalo y envíalo a portales de empleo.',
            download: 'Descargar PDF',
            downloading: 'Preparando PDF...',
            downloadFailed: 'No se pudo generar el PDF. Inténtalo de nuevo.',
            loadingPreview: 'Cargando vista previa del PDF...',
            summary: 'Resumen profesional',
            skills: 'Skills',
            experience: 'Experiencia',
            education: 'Educación',
            languages: 'Idiomas',
            certifications: 'Certificaciones',
          },
          errors: {
            jobDescriptionTooShort:
              'Pega una descripción más larga antes de continuar (mínimo 50 caracteres).',
            analyzeFailed:
              'No se pudo analizar la descripción del puesto. Inténtalo de nuevo.',
            analysisRequired:
              'Analiza la descripción del puesto antes de generar el CV adaptado.',
            generateFailed:
              'No se pudo generar el CV adaptado. Inténtalo de nuevo.',
          },
        },
      },
      jobScraperMarket: {
        title: 'Mercado Job Scraper',
        description:
          'Explora y gestiona fuentes de scraping y datos del mercado laboral.',
        placeholderTitle: 'Mercado Job Scraper',
        placeholderDescription: 'El contenido de esta página irá aquí.',
      },
    },
  },
}

export const LANGUAGE_STORAGE_KEY = 'ai-job-search-language'

export function getDefaultLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (stored === 'en' || stored === 'es') return stored

  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
}
