// Default curated media assets for Alchemist Academy with SEO Alt text & metadata

export const DEFAULT_MEDIA_ASSETS = [
  {
    id: 'media-hero-cultural',
    title: 'Annual Cultural Showcase & Dance Program',
    altText: 'Students of Alchemist Academy performing traditional Nepali cultural dance in Kathmandu auditorium',
    url: './hero-cultural.webp',
    category: 'Campus & Events',
    dateAdded: '2026-10-14',
    description: 'Students performing traditional dance at the grand campus auditorium.',
    tags: 'culture, dance, auditorium, events, nepali traditions',
    isDefault: true,
  },
  {
    id: 'media-campus-nursery',
    title: 'School Campus & Classroom Learning',
    altText: 'Elementary and secondary students engaged in interactive classroom learning at Alchemist Academy Jorpati',
    url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
    category: 'Campus & Events',
    dateAdded: '2026-10-14',
    description: 'Nurturing classroom environment for elementary and secondary students.',
    tags: 'classroom, campus, elementary, secondary, learning',
    isDefault: true,
  },
  {
    id: 'media-headmaster',
    title: 'Headmaster Karmendra Vimal Portrait',
    altText: 'Karmendra Vimal, Headmaster and educational leader at Alchemist Academy Secondary School Kathmandu',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    category: 'Leadership & Staff',
    dateAdded: '2026-10-14',
    description: 'Official leadership portrait for school messages and announcements.',
    tags: 'headmaster, leadership, faculty, administration',
    isDefault: true,
  },
  {
    id: 'media-cs-lab',
    title: 'Computer Science & Robotics Lab',
    altText: 'Computer science and coding workstation laboratory at Alchemist Academy Kathmandu',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    category: 'Academics & STEM',
    dateAdded: '2026-10-14',
    description: 'Coding workstations and logic building curriculum equipment.',
    tags: 'computer lab, coding, robotics, STEM, technology',
    isDefault: true,
  },
  {
    id: 'media-science-lab',
    title: 'Natural Sciences Laboratory',
    altText: 'Students conducting chemistry and physics laboratory experiments at Alchemist Academy science wing',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    category: 'Academics & STEM',
    dateAdded: '2026-10-14',
    description: 'Apparatus and microscopy stations for physics, chemistry, and biology.',
    tags: 'science, biology, chemistry, physics, laboratory',
    isDefault: true,
  },
  {
    id: 'media-fine-arts',
    title: 'Fine Arts & Studio Painting',
    altText: 'Visual art studio with students painting on easels and sketching at Alchemist Academy arts department',
    url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    category: 'Arts & Culture',
    dateAdded: '2026-10-14',
    description: 'Easel painting, color theory, and sketching creative studio.',
    tags: 'arts, painting, easel, creativity, sketching',
    isDefault: true,
  },
  {
    id: 'media-music-conservatory',
    title: 'Music & Acoustics Studio',
    altText: 'Students practicing classical instruments and vocal harmonics in Alchemist Academy music room',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    category: 'Arts & Culture',
    dateAdded: '2026-10-14',
    description: 'Acoustic instruments, harmonium, guitar, and vocal training arena.',
    tags: 'music, guitar, singing, performance, instruments',
    isDefault: true,
  },
  {
    id: 'media-dance-studio',
    title: 'Classical & Contemporary Dance Recital',
    altText: 'Traditional and contemporary choreographic dance training at Alchemist Academy studio',
    url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
    category: 'Arts & Culture',
    dateAdded: '2026-10-14',
    description: 'Choreography studio with mirrored practice floors for expressive dance.',
    tags: 'dance, choreography, movement, performance',
    isDefault: true,
  },
  {
    id: 'media-sports-field',
    title: 'Athletics Ground & Football Field',
    altText: 'Outdoor athletic grounds and green sports field for student football tournaments at Alchemist Academy',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    category: 'Sports & Athletics',
    dateAdded: '2026-10-14',
    description: 'Outdoor green sports turf for football, running track, and team matches.',
    tags: 'sports, football, soccer, fitness, athletics',
    isDefault: true,
  },
  {
    id: 'media-school-library',
    title: 'In-house Library & Literary Archives',
    altText: 'School library and research reading carrels with extensive books at Alchemist Academy Jorpati',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80',
    category: 'Campus & Events',
    dateAdded: '2026-10-14',
    description: 'Extensive book collection, reading journals, and quiet research carrels.',
    tags: 'library, books, reading, research, literature',
    isDefault: true,
  },
  {
    id: 'media-drama-stage',
    title: 'Performing Arts Stage Showcase',
    altText: 'Annual drama showcase and dramatic literature stage production at Alchemist Academy auditorium',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
    category: 'Arts & Culture',
    dateAdded: '2026-10-14',
    description: 'Lighting, costumes, and drama theatre presentation by students.',
    tags: 'drama, theatre, acting, stage, auditorium',
    isDefault: true,
  },
];

export const MEDIA_STORAGE_KEY = '_aa_media_library_v3';

export const loadStoredMedia = () => {
  try {
    const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure every item has altText populated
        return parsed.map((item) => ({
          ...item,
          altText: item.altText || item.title || 'Alchemist Academy Media Asset',
          tags: item.tags || '',
        }));
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
