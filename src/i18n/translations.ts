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
              'Paste the full posting from LinkedIn, Indeed, InfoJobs, or a company careers page. We will extract keywords and required skills next.',
            label: 'Job description',
            placeholder:
              'Paste the job title, responsibilities, requirements, and skills from the posting here...',
            hint: 'Include the full text for better keyword and skill extraction.',
            clear: 'Clear',
            characterCountLabel: 'Characters',
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
              'Pega el anuncio completo de LinkedIn, Indeed, InfoJobs o la página de careers de una empresa. A continuación extraeremos palabras clave y skills requeridas.',
            label: 'Descripción del puesto',
            placeholder:
              'Pega aquí el título, responsabilidades, requisitos y skills del anuncio...',
            hint: 'Incluye el texto completo para una mejor extracción de keywords y skills.',
            clear: 'Limpiar',
            characterCountLabel: 'Caracteres',
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
