import destinationAdminImage from "../assets/destination-admin.svg";
import destinationComputerStudiesImage from "../assets/destination-computer-studies.svg";
import destinationFountainImage from "../assets/destination-fountain.svg";
import destinationGymImage from "../assets/destination-gym.svg";
import type { Point, PresetDestination } from "../types/navigation";

export const GUARD_HOUSE: Point = { lat: 13.29540325, lon: 123.486557525 };

export const PRESET_DESTINATIONS: PresetDestination[] = [
  {
    label: "BUPC Fountain",
    lat: 13.2961752,
    lon: 123.4847694,
    image: destinationFountainImage,
    summary:
      "Central campus landmark where students usually meet before heading to classes.",
    details: [
      "Open public area and common meetup point",
      "Best landmark reference for first-time visitors",
      "Near major campus pathways and nearby services",
    ],
    keywords: ["fountain", "plaza", "center"],
  },
  {
    label: "BUP GYM",
    lat: 13.2959792,
    lon: 123.4844938,
    image: destinationGymImage,
    summary:
      "Sports and activity center used for PE classes, practice sessions, and events.",
    details: [
      "Venue for sports events and student activities",
      "Often used for training and intramural schedules",
      "Good destination for fitness-related stops",
    ],
    keywords: ["gym", "sports", "fitness"],
  },
  {
    label: "Center for Computer and Engineering Studies / Salceda Building",
    lat: 13.2958673,
    lon: 123.4848151,
    image: destinationComputerStudiesImage,
    summary:
      "Academic building for computer studies classes, labs, and department offices.",
    details: [
      "Hosts computer and IT-related lecture rooms",
      "Contains labs for practical sessions",
      "Department office and student consultation area",
    ],
    keywords: ["computer", "it", "ccs", "department"],
  },
  {
    label: "Administrative Building",
    lat: 13.2957586,
    lon: 123.4851484,
    image: destinationAdminImage,
    summary:
      "Main administration area for registrar and essential student services.",
    details: [
      "Common stop for enrollment and records processing",
      "Includes several student-facing service windows",
      "Helpful destination for official campus transactions",
    ],
    keywords: ["admin", "administration", "office", "registrar"],
  },
  {
    label: "Nursing Department",
    lat: 13.296606,
    lon: 123.484725,
    image: destinationAdminImage,
    summary:
      "Academic area for nursing classes, department transactions, and student support.",
    details: [
      "Main location for nursing program classrooms and offices",
      "Department inquiries and student coordination happen here",
      "Accessible from the central campus roads and pathways",
    ],
    keywords: ["nursing", "department", "college of nursing", "cn"],
  },
  {
    label: "Salceda Building",
    lat: 13.296187,
    lon: 123.48553,
    image: destinationComputerStudiesImage,
    summary:
      "Campus building near the central inner roads and common walking routes.",
    details: [
      "Landmark destination close to the internal roundabout",
      "Frequently passed when moving between major facilities",
      "Useful waypoint for navigation within the campus core",
    ],
    keywords: ["salceda", "salceda building", "building", "sb"],
  },
  {
    label: "Electronical Technology Department",
    lat: 13.29567,
    lon: 123.48419,
    image: destinationComputerStudiesImage,
    summary:
      "Department area for technology-focused classes, labs, and student consultations.",
    details: [
      "Common stop for technology and applied technical subjects",
      "Near central campus walkways and neighboring academic buildings",
      "Useful destination for class navigation and department concerns",
    ],
    keywords: ["technological", "technology", "tech department", "etd"],
  },
];
