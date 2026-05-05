import { defineStore } from 'pinia'
import type { UniversityInfo, StudentInfo, StudentPhoto, IDCardStyle, Course, AdmissionLetter } from '@/types'

export const useStudentStore = defineStore('student', {
  state: () => ({
    universityInfo: {
      name: 'International University',
      address: '123 University Avenue, Boston, MA 02138',
      website: 'www.university.edu',
      phone: '(617) 555-1234',
      email: 'info@university.edu',
      logo: '',
      signature: 'S. Davis',
      backsideTitle: 'Student ID Card Information',
      termsOfUse: 'This card must be carried while on campus. Violation of university policies may result in card revocation.',
      lostCardInfo: 'If found, please return to the University Lost & Found Office or call the number below.',
      accessPrivileges: 'Library, Cafeteria, Dormitory, Computer Labs',
      backsideLogo: '',
      backsideLogoOpacity: 70
    } as UniversityInfo,
    
    studentInfo: {
      name: 'Emily Johnson',
      studentId: '2023001001',
      major: 'Bachelor of Computer Science',
      school: 'School of Computer Science',
      degree: 'Bachelor',
      enrollmentYear: '2023-09-01',
      enrollmentDate: '2020-09-01',
      expectedGraduation: '2025-06-30',
      expiryDate: '2029-12-25',
      academicYear: '2023-2024',
      term: 'Fall 2023'
    } as StudentInfo,
    
    studentPhoto: {
      url: '',
      sticker: '',
      logo: '',
      watermark: '',
      opacity: 50
    } as StudentPhoto,
    
    idCardStyle: {
      template: '基本样式',
      pattern: 'All Packers',
      color: '#4B6EF5',
      cornerPattern: 'Sector Pattern',
      stickers: [],
      cardOrientation: 'Landscape (Credit Card Size)',
      cardStyle: 'Modern',
      cardColor: '#7987b4',
      textColor: '#ffffff',
      barcodeType: 'Barcode',
      enableRealisticEffect: false,
      enableWatermark: true,
      watermarkText: 'AUTHENTIC',
      watermarkColor: '#000000',
      watermarkSize: 14,
      watermarkRotation: -30,
      watermarkFontFamily: 'Arial',
      watermarkOpacity: 4,
      enableBackside: true,
      backgroundOpacity: 30,
      backgroundImage: ''
    } as IDCardStyle,
    
    courses: [] as Course[],
    
    admissionLetter: {
      universityName: 'International University',
      studentName: 'Emily Johnson',
      program: 'Computer Science',
      major: 'Computer Science',
      department: 'School of Computer Science',
      degreeType: "Bachelor's Degree",
      admissionDate: '2025-12-25',
      startDate: '2023-09-01',
      duration: '4 years',
      scholarship: 'Merit Scholarship: $5,000 per year',
      dean: 'Dr. Robert Anderson',
      deanTitle: 'Dean of Admissions',
      signatureDate: '2025-12-25',
      sealType: 'All Packers',
      sealText: 'OFFICIAL SEAL',
      sealImage: '',
      letterTitle: 'Letter of Admission',
      greeting: 'Dear Emily Johnson,',
      bodyText: 'We are pleased to inform you that you have been accepted to the Computer Science program at International University for the Fall 2023 semester. Your academic achievements and personal qualities have impressed our admissions committee, and we believe you will make valuable contributions to our university community.\n\nYour admission is for the Bachelor\'s degree program in Computer Science, which is a 4-year program. Classes will begin on September 1, 2023.',
      congratulations: 'Congratulations on your acceptance! We look forward to welcoming you to our campus and supporting your academic journey.',
      nextSteps: 'To confirm your enrollment, please complete the following steps:\n1. Submit your enrollment confirmation by June 1, 2023\n2. Pay the enrollment deposit of $500\n3. Register for orientation (August 25-28, 2023)\n4. Complete housing application (if applicable)'
    } as AdmissionLetter,
    
    displaySettings: {
      showWatermark: true,
      watermarkText: 'CSUN',
      barcode: '#4025562',
      qrCode: true,
      logoUrl: '',
      useOfficialSeal: false,
      sealStyle: 'Serif'
    }
  }),
  
  actions: {
    updateUniversityInfo(info: Partial<UniversityInfo>) {
      this.universityInfo = { ...this.universityInfo, ...info }
    },
    
    updateStudentInfo(info: Partial<StudentInfo>) {
      this.studentInfo = { ...this.studentInfo, ...info }
    },
    
    updateStudentPhoto(photo: Partial<StudentPhoto>) {
      this.studentPhoto = { ...this.studentPhoto, ...photo }
    },
    
    updateIDCardStyle(style: Partial<IDCardStyle>) {
      this.idCardStyle = { ...this.idCardStyle, ...style }
    },
    
    addCourse(course: Course) {
      this.courses.push(course)
    },
    
    removeCourse(index: number) {
      this.courses.splice(index, 1)
    },
    
    updateCourse(index: number, course: Course) {
      this.courses[index] = course
    },
    
    updateAdmissionLetter(letter: Partial<AdmissionLetter>) {
      this.admissionLetter = { ...this.admissionLetter, ...letter }
    }
  }
})
