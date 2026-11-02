// ─────────────────────────────────────────────────────────────
//  EDIT EVERYTHING HERE. All copy, links and portfolio items live
//  in this one file. Empty strings show tasteful placeholders.
// ─────────────────────────────────────────────────────────────
export const MODEL_URL = '/models/camera.glb'

export const site = {
  name: 'Your Name',
  role: 'Mobile Photographer',
  headline: ['EVERY FRAME', 'TELLS A STORY'],
  about: {
    title: 'The person behind the lens',
    // Replace with your own words:
    body: [
      'Write a short introduction here: who you are, how you started, and what you love to capture.',
      'A second paragraph can describe your approach, your style, and what clients can expect.',
    ],
    portrait: '', // e.g. '/images/portrait.jpg' (put the file in /public/images)
  },
  services: [
    { title: 'Photoshoots', text: 'Describe your photoshoot offer here.' },
    { title: 'Weddings', text: 'Describe your wedding coverage here.' },
    { title: 'Events', text: 'Describe your event coverage here.' },
    { title: 'Commercial Content', text: 'Describe your commercial work here.' },
    { title: 'Video Shooting', text: 'Describe your video / reels offer here.' },
  ],
  // Contact: leave '' to show a placeholder. Use full values, e.g. 'https://instagram.com/you'
  contact: {
    instagram: '',
    telegram: '',
    whatsapp: '',
    email: '',
  },
}

export type Category = 'Portraits' | 'Weddings' | 'Events' | 'Reels'
export type Work = { src?: string; kind?: 'image' | 'video'; alt?: string }
// Add your files to /public/work and list them here. Empty {} = placeholder frame.
export const portfolio: Record<Category, Work[]> = {
  Portraits: [{}, {}, {}, {}, {}, {}],
  Weddings: [{}, {}, {}, {}, {}, {}],
  Events: [{}, {}, {}, {}, {}, {}],
  Reels: [{}, {}, {}, {}],
}
