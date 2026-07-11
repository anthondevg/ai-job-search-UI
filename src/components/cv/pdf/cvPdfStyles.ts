import { StyleSheet } from '@react-pdf/renderer'

export const cvPdfStyles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.45,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 14,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
  },
  contactRow: {
    fontSize: 9,
    color: '#444444',
    marginBottom: 2,
  },
  link: {
    color: '#1a1a1a',
    textDecoration: 'none',
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 10,
    textAlign: 'justify',
  },
  skillsLine: {
    fontSize: 10,
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  role: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  company: {
    fontSize: 10,
    color: '#333333',
  },
  dates: {
    fontSize: 9,
    color: '#555555',
    textAlign: 'right',
    minWidth: 100,
  },
  bulletList: {
    marginTop: 3,
    paddingLeft: 10,
  },
  bullet: {
    fontSize: 10,
    marginBottom: 2,
  },
  educationItem: {
    marginBottom: 6,
  },
  mutedLine: {
    fontSize: 10,
    marginBottom: 2,
  },
})
