export const defaultSiteData = {
  // General & Branding
  branding: {
    name: "ALCHEMIST ACADEMY",
    tagline: "Excellence in Education",
    logoIcon: "GraduationCap", // GraduationCap, Sparkles, BookOpen, Award
    logoImage: "", // Custom Brand Logo image URL or base64 upload
    logoType: "icon", // 'icon' or 'image'
    logoColor: "#e67300",
    favicon: "", // Custom browser tab favicon URL or upload
    headerApplyButtonText: "Apply Now",
    headerApplyButtonLink: "#contact",
  },

  // Social Links
  socials: {
    twitter: "https://twitter.com",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
  },

  // Hero Section
  hero: {
    badge: "A Legacy of Academic Brilliance",
    titlePart1: "Cultivating a",
    titleHighlight: "Nurturing Environment",
    subheading: "“Empowering Minds, Shaping Futures!”",
    bgImage: "./hero-cultural.webp",
    bgOverlayOpacity: 50, // 0 - 100 percentage
    primaryBtnText: "Our Academics",
    primaryBtnLink: "#academics",
    secondaryBtnText: "Discover More",
    secondaryBtnLink: "#about",
    features: [
      { text: "Government Recognized Excellence", icon: "Award" },
      { text: "Nursery to 10th Grade Stream", icon: "Sparkles" },
      { text: "Holistic Student Development", icon: "BookOpen" },
    ],
  },

  // About Section
  about: {
    badge: "About Our Institution",
    title: "Learning Begins With Us",
    titleHighlight: "With Us",
    description1: "Situated in the culturally rich and scenic backdrop of Jorpati, Kathmandu, Alchemist Academy is committed to delivering transformative education from Nursery up to the 10th Grade.",
    description2: "We go beyond conventional academics. Our methodology is anchored in holistic development—fostering analytical thinking, emotional resilience, collaborative leadership, and moral rectitude so that each child flourishes into a responsible global citizen.",
    image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
    locationBadgeTitle: "Located in Kathmandu",
    locationBadgeDesc: "Jorpati Oralo, Gokarneshwor-05 — a safe and serene campus for growth.",
    gradePill: "Nursery to 10th Grade",
    buttonText: "Know More About Us",
    values: [
      "Holistic Curriculum Approach",
      "Dedicated & Caring Mentors",
      "Strong Ethical Foundations",
      "Co-curricular Excellence",
    ],
  },

  // Stats Grid
  stats: [
    { id: 1, value: "400+", label: "Current Enrollments", description: "Active young minds thriving across classes" },
    { id: 2, value: "10+", label: "Years of Excellence", description: "Shaping standards in quality education" },
    { id: 3, value: "10+", label: "Clubs & Activities", description: "Diverse avenues for passion and discovery" },
    { id: 4, value: "20+", label: "Teachers", description: "Qualified, empathetic academic mentors" },
  ],

  // Headmaster's Quote
  headmaster: {
    badge: "Leadership Message",
    quote: "“We aim at inspiring our students to dream more, learn more, do more, and become more in their respective journeys of life.”",
    name: "Karmendra Vimal",
    role: "Headmaster",
    location: "Alchemist Academy, Kathmandu",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },

  // Curriculum Overview Grid
  curriculum: [
    {
      id: 1,
      title: "Fine Arts",
      badge: "Creativity",
      description: "Cultivating imagination and visual literacy through painting, sketching, and expressive design techniques.",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
      icon: "Palette",
    },
    {
      id: 2,
      title: "Music",
      badge: "Aesthetics",
      description: "Developing acoustic sensitivity, rhythm, vocal mastery, and classical as well as contemporary instruments.",
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
      icon: "Music",
    },
    {
      id: 3,
      title: "Computer Science",
      badge: "Technology",
      description: "Empowering future-ready innovators with coding fundamentals, digital ethics, logic building, and computational tools.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
      icon: "Laptop",
    },
    {
      id: 4,
      title: "Science",
      badge: "Inquiry",
      description: "Hands-on laboratory investigations cultivating curiosity, analytical research, physics, chemistry, and biology.",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
      icon: "Microscope",
    },
    {
      id: 5,
      title: "Sports",
      badge: "Fitness",
      description: "Promoting athletic agility, team camaraderie, competitive spirit, discipline, and healthy physical lifestyles.",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80",
      icon: "Trophy",
    },
    {
      id: 6,
      title: "Dance",
      badge: "Expression",
      description: "Graceful movement training that integrates classical heritage, modern choreography, coordination, and poise.",
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80",
      icon: "Activity",
    },
  ],

  // Co-curricular Activities
  coCurricular: [
    {
      id: 1,
      title: "Athletics & Sports Meet",
      subtitle: "Building physical endurance, teamwork & character",
      tag: "Physical Health",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
      highlights: [
        "Inter-school track and field tournaments",
        "Football, basketball, and badminton training",
        "Annual Sports Day & team spirit rallies",
        "Physical fitness and yoga sessions",
      ],
    },
    {
      id: 2,
      title: "In-house Publications",
      subtitle: "Fostering literary expression and journalistic flair",
      tag: "Literary & Media",
      image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80",
      highlights: [
        "Student-curated annual school magazine",
        "Creative writing, poetry, and essay contests",
        "Wall magazines and editorial board clubs",
        "Debate, elocution, and storytelling forums",
      ],
    },
    {
      id: 3,
      title: "Performing Arts & Music",
      subtitle: "Igniting creative resonance through stage performance",
      tag: "Creative Arts",
      image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
      highlights: [
        "Classical & contemporary musical bands",
        "Theatrical productions and annual drama showcase",
        "Traditional Nepalese & international dance forms",
        "Cultural festivities and assembly showcases",
      ],
    },
  ],

  // Blog / News Section
  blogs: [
    {
      id: 1,
      title: "Annual Sports Day 2026: Celebrating Athleticism and Sportsmanship",
      category: "Campus Events",
      date: "October 10, 2026",
      author: "Sports Department",
      readTime: "3 min read",
      summary: "Students demonstrated extraordinary vigor and spirit in track and field, football finals, and team relay challenges.",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
      content: "Our annual sports meet brought together over 400 students across Nursery to Grade 10. The events were marked with high enthusiasm, remarkable athletic feats, and wonderful camaraderie.",
    },
    {
      id: 2,
      title: "Innovative STEM Workshops: Fostering Curiosity in Robotics & AI",
      category: "Academics",
      date: "September 28, 2026",
      author: "Science & Tech Club",
      readTime: "4 min read",
      summary: "Hands-on robotics kits and logic design workshops ignited young minds to create interactive real-world automated prototypes.",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
      content: "Students engaged in direct experimentation with microcontrollers, algorithmic thinking, and collaborative problem-solving, building skills for the future.",
    },
    {
      id: 3,
      title: "Cultural & Heritage Day: Honoring Traditions Through Performing Arts",
      category: "Culture & Arts",
      date: "September 15, 2026",
      author: "Arts Council",
      readTime: "3 min read",
      summary: "A vibrant day of traditional Nepali music, festive costumes, classical dance recitals, and student-curated art displays.",
      image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
      content: "Emphasizing our rich cultural roots, students performed traditional instruments and dance styles, reinforcing our commitment to holistic community values.",
    },
  ],

  // Admissions CTA
  admissions: {
    badge: "Admissions Open for Academic Year",
    title: "Wish to know more about admissions and updates?",
    description: "Join the Alchemist Academy family. Secure a bright future for your child with well-rounded, ethical, and modern education in Kathmandu.",
    phone: "01-4912267",
    email: "alchemistacademy2052@gmail.com",
    btnText: "Enroll Now",
  },

  // Footer & Contact
  footer: {
    address: "Nepal Telecom Road, Gokarneshwor Municipality – 05, Jorpati Oralo, Kathmandu",
    phone: "01-4912267",
    email: "alchemistacademy2052@gmail.com",
    hours: "Sun – Fri, 9:00 AM – 4:30 PM",
    googleMapsUrl: "https://maps.google.com/?q=Alchemist+Academy+Jorpati+Kathmandu",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.621946894589!2d85.3735!3d27.7285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1bbf4391b9b1%3A0x6b1d491f86bb3ff4!2sAlchemist%20Academy!5e0!3m2!1sen!2snp!4v1700000000000!5m2!1sen!2snp",
    tagline: "Empowering minds and shaping bright futures from Nursery to Grade 10. Committed to building academic excellence and moral leadership in Jorpati, Kathmandu.",
    copyrightYear: "2026",
  },
};

