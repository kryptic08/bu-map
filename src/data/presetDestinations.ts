import destinationAdminImage from "../assets/destination-admin.svg";
import destinationComputerStudiesImage from "../assets/destination-computer-studies.svg";
import destinationComputerStudiesSecondFloorImage from "../assets/destination-computer-studies-2nd.svg";
import destinationGymImage from "../assets/destination-gym.svg";
import type { Point, PresetDestination } from "../types/navigation";

export const GUARD_HOUSE: Point = { lat: 13.29540325, lon: 123.486557525 };

export const PRESET_DESTINATIONS: PresetDestination[] = [
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
    floorPlans: [
      { label: "1st Floor", image: destinationComputerStudiesImage },
      {
        label: "2nd Floor",
        image: destinationComputerStudiesSecondFloorImage,
      },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          {
            label: "Center for Computer and Engineering Studies Office",
            marker: [87, 77],
          },
          { label: "Technology Department Office", marker: [88, 66] },
          { label: "ENGR Department", marker: [24, 14] },
          { label: "ECB 12", marker: [86, 55] },
          { label: "ECB 13", marker: [86, 44] },
          { label: "ECB 14", marker: [69, 14] },
          { label: "ECB 16", marker: [11, 54] },
          { label: "ECB 17", marker: [11, 69] },
          { label: "ECB 18", marker: [11, 43] },
          { label: "ECB 19 Lab 1", marker: [35, 36] },
          { label: "ECB 18 Lab 2", marker: [53, 37] },
          { label: "CR", marker: [90, 20] },
          { label: "Stair Access", marker: [50, 35] },
        ],
      },
      {
        floorLabel: "2nd Floor",
        items: [
          { label: "Computer Laboratory", marker: [66, 28] },
          { label: "Programming Laboratory", marker: [36, 31] },
          { label: "Faculty Office", marker: [82, 64] },
          { label: "Department Office", marker: [24, 16] },
          { label: "Classroom Cluster", marker: [17, 49] },
          { label: "CR", marker: [84, 19] },
          { label: "Stair Access", marker: [50, 34] },
        ],
      },
    ],
    summary:
      "Academic building for computer studies classes, labs, and department offices.",
    details: [
      "Hosts computer and IT-related lecture rooms",
      "Contains labs for practical sessions",
      "Department office and student consultation area",
    ],
    keywords: [
      "computer",
      "engineering",
      "engeneering",
      "it",
      "ccs",
      "center for computer and engineering studies",
      "center for computer engineering studies",
      "salceda",
      "salceda building",
      "department",
    ],
  },
  {
    label: "BUP Canteen",
    lat: 13.29635,
    lon: 123.48479,
    image: destinationAdminImage,
    summary:
      "Campus food area where students and staff usually eat and take short breaks.",
    details: [
      "Common stop between classes for meals and snacks",
      "Located near major campus walkways and nearby departments",
      "Useful destination for quick food and refreshment breaks",
    ],
    keywords: ["canteen", "food", "cafeteria", "eat"],
  },
  {
    label: "Registrar",
    lat: 13.29525,
    lon: 123.48498,
    image: destinationAdminImage,
    summary:
      "Registrar office for enrollment, records requests, and student document processing.",
    details: [
      "Handles enrollment and records-related transactions",
      "Common destination for official student documents",
      "Near the administrative service area",
    ],
    keywords: ["registrar", "records", "enrollment", "documents"],
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
