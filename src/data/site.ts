/**
 * Everything editable in one place.
 *
 * TODO(muse): replace the placeholder Discord invite, socials and email below
 * with the club's real links before launch.
 */

export const SITE = {
  short: "MuSE",
  full: "Music and Sound Engineering",
  org: "New York University",
  city: "New York",
  country: "USA",
  coords: "40.7295° N, 73.9965° W",
  established: "2024",

  // --- Replace these ---------------------------------------------------
  discord: "https://discord.gg/your-invite-code",
  instagram: "https://instagram.com/muse.nyu",
  email: "muse@nyu.edu",
  // ---------------------------------------------------------------------
};

export const NAV = [
  { id: "index", label: "Index" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "join", label: "Join" },
];

export const PILLARS = [
  {
    id: "01",
    title: "Production",
    body: "Writing, tracking, mixing, mastering. Sessions run in the studio and on laptops in Bobst — whatever gets the record finished.",
  },
  {
    id: "02",
    title: "DSP & Code",
    body: "Plugins, synths and audio tooling in C++, JUCE, Max and Python. Half of it starts with somebody trying to rebuild a plugin they can't afford.",
  },
  {
    id: "03",
    title: "Live Sound",
    body: "FOH, monitors, patching and load-ins for campus shows. You learn a room by ringing it out at 4pm and finding out what it does at 9.",
  },
  {
    id: "04",
    title: "Research & Listening",
    body: "Psychoacoustics, spatial audio and room treatment, plus critical-listening sessions that reliably overrun by an hour.",
  },
];

/**
 * Practical info, as a spec table rather than a row of vanity metrics.
 * TODO(muse): confirm the meeting time and room before launch.
 */
export const PRACTICALS = [
  { label: "Meetings", value: "Thursdays, 7:00 PM" },
  { label: "Where", value: "Announced each week in Discord" },
  { label: "Dues", value: "None" },
  { label: "Gear", value: "Provided — bring nothing" },
  { label: "Open to", value: "Any NYU student, any school, any year" },
];

/** TODO(muse): swap in the club's real project roster. */
export const PROJECTS = [
  {
    index: "01",
    title: "Spectral",
    tag: "DSP / C++",
    year: "2025",
    status: "Active",
    body: "A real-time spectrum analyser and phase scope built in JUCE. Open source, maintained by the DSP group, used across every mix session we run.",
  },
  {
    index: "02",
    title: "Room 404",
    tag: "Spatial Audio",
    year: "2025",
    status: "Active",
    body: "An eight-channel ambisonic installation mapping the acoustics of campus spaces nobody thinks about — stairwells, tunnels, the Kimmel loading dock.",
  },
  {
    index: "03",
    title: "MuSE Tape Vol.01",
    tag: "Release",
    year: "2025",
    status: "Mixing",
    body: "A member compilation. Everything written, engineered and mastered in-house, from bedroom ambient to whatever the modular group is doing.",
  },
  {
    index: "04",
    title: "Patchbay",
    tag: "Hardware",
    year: "2024",
    status: "Ongoing",
    body: "A semester-long Eurorack build workshop. Members leave with a working module they soldered themselves and a healthy fear of power rails.",
  },
  {
    index: "05",
    title: "Front of House",
    tag: "Live",
    year: "2024",
    status: "Recurring",
    body: "We run sound for student shows across NYU. Mixing, monitors, stage patching and the visuals rig that runs behind the band.",
  },
  {
    index: "06",
    title: "Listening Room",
    tag: "Research",
    year: "Ongoing",
    status: "Open",
    body: "Biweekly critical-listening sessions. One record, one system, no phones. We take notes and then we take sides.",
  },
];

export const STEPS = [
  {
    index: "01",
    title: "Join the Discord",
    body: "That's the front door. Announcements, project channels, feedback threads and the stem-swap channel all live there.",
  },
  {
    index: "02",
    title: "Show up",
    body: "Meetings, workshops and listening sessions run weekly during the semester. Drop into whichever one sounds like you.",
  },
  {
    index: "03",
    title: "Make something",
    body: "Pick a project or start one. Everything we ship came from somebody posting a half-finished idea and asking for help.",
  },
];

export const MARQUEE = [
  "Mixing",
  "Mastering",
  "Synthesis",
  "DSP",
  "Live Sound",
  "Modular",
  "Field Recording",
  "Spatial Audio",
  "Sound Design",
  "Plugin Dev",
];
