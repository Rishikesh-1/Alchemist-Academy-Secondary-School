// Default curated media assets for Alchemist Academy

export const DEFAULT_MEDIA_ASSETS = [
  {
    id: 'media-hero-cultural',
    title: 'Annual Cultural Showcase & Dance Program',
    url: './hero-cultural.webp',
    category: 'Campus & Events',
    dateAdded: '2026-10-14',
    description: 'Students performing traditional dance at the grand campus auditorium.',
    isDefault: true,
  },
  {
    id: 'media-campus-nursery',
    title: 'School Campus & Classroom Learning',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
    category: 'Campus & Events',
    dateAdded: '2026-10-14',
    description: 'Nurturing classroom environment for elementary and secondary students.',
    isDefault: true,
  },
  {
    id: 'media-headmaster',
    title: 'Headmaster Karmendra Vimal Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    category: 'Leadership & Staff',
    dateAdded: '2026-10-14',
    description: 'Official leadership portrait for school messages and announcements.',
    isDefault: true,
  },
  {
    id: 'media-cs-lab',
    title: 'Computer Science & Robotics Lab',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    category: 'Academics & STEM',
    dateAdded: '2026-10-14',
    description: 'Coding workstations and logic building curriculum equipment.',
    isDefault: true,
  },
  {
    id: 'media-science-lab',
    title: 'Natural Sciences Laboratory',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    category: 'Academics & STEM',
    dateAdded: '2026-10-14',
    description: 'Apparatus and microscopy stations for physics, chemistry, and biology.',
    isDefault: true,
  },
  {
    id: 'media-fine-arts',
    title: 'Fine Arts & Studio Painting',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    category: 'Arts & Culture',
    dateAdded: '2026-10-14',
    description: 'Easel painting, color theory, and sketching creative studio.',
    isDefault: true,
  },
  {
    id: 'media-music-conservatory',
    title: 'Music & Acoustics Studio',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    category: 'Arts & Culture',
    dateAdded: '2026-10-14',
    description: 'Acoustic instruments, harmonium, guitar, and vocal training arena.',
    isDefault: true,
  },
  {
    id: 'media-dance-studio',
    title: 'Classical & Contemporary Dance Recital',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    category: 'Arts & Culture',
    dateAdded: '2026-10-14',
    description: 'Choreography studio with mirrored practice floors for expressive dance.',
    isDefault: true,
  },
  {
    id: 'media-sports-field',
    title: 'Athletics Ground & Football Field',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    category: 'Sports & Athletics',
    dateAdded: '2026-10-14',
    description: 'Outdoor green sports turf for football, running track, and team matches.',
    isDefault: true,
  },
  {
    id: 'media-school-library',
    title: 'In-house Library & Literary Archives',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    category: 'Campus & Events',
    dateAdded: '2026-10-14',
    description: 'Extensive book collection, reading journals, and quiet research carrels.',
    isDefault: true,
  },
  {
    id: 'media-drama-stage',
    title: 'Performing Arts Stage Showcase',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    category: 'Arts & Culture',
    dateAdded: '2026-10-14',
    description: 'Lighting, costumes, and drama theatre presentation by students.',
    isDefault: true,
  },
];

export const MEDIA_STORAGE_KEY = '_aa_media_library_v2';

export const loadStoredMedia = () => {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load media library:', e);
  }
  return DEFAULT_MEDIA_ASSETS;
};

export const saveStoredMedia = (items) => {
  try {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save media library:', e);
  }
};
