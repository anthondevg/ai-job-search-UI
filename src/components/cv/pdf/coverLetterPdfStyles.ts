import { StyleSheet } from '@react-pdf/renderer'

export const coverLetterPdfStyles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 28,
  },
  name: {
    fontSize: 18,
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
  metaLine: {
    marginTop: 10,
    fontSize: 10,
    color: '#555555',
  },
  body: {
    marginTop: 4,
  },
  paragraph: {
    fontSize: 11,
    marginBottom: 12,
    textAlign: 'left',
  },
})
