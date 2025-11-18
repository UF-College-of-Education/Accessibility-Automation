// app/components/DataService.ts

export interface Site {
  id: string;
  baseUrl: string;
  title: string;
  pages: Page[];
  isLive: boolean;
}

export interface Page {
  path: string;
  title: string;
  url: string;
}

export const mockSites: Site[] = [
  {
    id: '1',
    baseUrl: 'https://education.ufl.edu',
    title: 'College of Education',
    pages: [
      { path: '/about/', title: 'About', url: 'https://education.ufl.edu/about/' },
      { path: '/programs/', title: 'Programs', url: 'https://education.ufl.edu/programs/' },
      { path: '/admissions/', title: 'Admissions', url: 'https://education.ufl.edu/admissions/' },
    ],
    isLive: true,
  },
  {
    id: '2',
    baseUrl: 'https://engineering.ufl.edu',
    title: 'College of Engineering',
    pages: [
      { path: '/about/', title: 'About', url: 'https://engineering.ufl.edu/about/' },
      { path: '/departments/', title: 'Departments', url: 'https://engineering.ufl.edu/departments/' },
    ],
    isLive: true,
  },
];

export async function fetchSites(): Promise<Site[]> {
  try {
    return mockSites;
  } catch (error) {
    console.error('Error fetching sites:', error);
    return mockSites;
  }
}