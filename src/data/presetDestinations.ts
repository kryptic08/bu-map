import destinationAdminImage from "../assets/destination-admin.svg";

// New floor plan images
import fpAdmin1st from "../assets/Floor Plan/AdminBuilding_1stFloor.png";
import fpAdmin2nd from "../assets/Floor Plan/AdminBuilding_2ndFloor.png";
import fpCanteen from "../assets/Floor Plan/Canteen.png";
import fpClinic from "../assets/Floor Plan/Clinic.png";
import fpComEng1st from "../assets/Floor Plan/CenterForComEngStudies_1stFloor.png";
import fpComEng2nd from "../assets/Floor Plan/CenterForComEngStudies_2ndFloor.png";
import fpGym1st from "../assets/Floor Plan/Gym_1stFloor.png";
import fpGym2nd from "../assets/Floor Plan/Gym_2ndFloor.png";
import fpNursing from "../assets/Floor Plan/Nursing.png";
import fpRegistrar from "../assets/Floor Plan/Registrar.png";
import fpSalceda1st from "../assets/Floor Plan/SalcedaBuilding_1stFloor.png";
import fpSalceda2nd from "../assets/Floor Plan/SalcedaBuilding_2ndFloor.png";

// Thumbnails
import thumbAdmin from "../assets/Thumbnails/AdminBuildingThumb.jpg";
import thumbComEng from "../assets/Thumbnails/CenterforcomputingandengineeringstudiesThumb.jpg";
import thumbStudentServices from "../assets/Thumbnails/CenterforstudentsservicesThumb.jpg";
import thumbClinic from "../assets/Thumbnails/ClinicThumb.jpg";
import thumbDormstel from "../assets/Thumbnails/DormstelThumb.jpg";
import thumbElectronic from "../assets/Thumbnails/ElectronicThumb.jpg";
import thumbGym from "../assets/Thumbnails/GymThumb.jpg";
import thumbNursing from "../assets/Thumbnails/NursingThumb.jpg";
import thumbRegistrar from "../assets/Thumbnails/RegistrarThumb.jpg";
import thumbSalceda from "../assets/Thumbnails/SalcedaBuildingThumb.jpg";

import type { Point, PresetDestination } from "../types/navigation";

export const GUARD_HOUSE: Point = { lat: 13.29540325, lon: 123.486557525 };

export const PRESET_DESTINATIONS: PresetDestination[] = [
  {
    label: "BUP GYM",
    lat: 13.2959792,
    lon: 123.4844938,
    image: fpGym1st,
    thumbnail: thumbGym,
    floorPlans: [
      { label: "1st Floor", image: fpGym1st },
      { label: "2nd Floor", image: fpGym2nd },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          { label: "Men's CR", marker: [10, 6] },
          { label: "Women's CR", marker: [90, 6] },
          { label: "Sports Club", marker: [30, 92] },
          { label: "Alumni Office", marker: [74, 93] },
        ],
      },
      {
        floorLabel: "2nd Floor",
        items: [
          { label: "Gym Area", marker: [50, 50] },
          { label: "PCO/DRRM Office", marker: [92, 50] },
        ],
      },
    ],
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
    image: fpComEng2nd,
    thumbnail: thumbComEng,
    floorPlans: [
      { label: "1st Floor", image: fpComEng2nd },
      { label: "2nd Floor", image: fpComEng1st },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          { label: "ENGINEERING DEPT", marker: [25, 20] },
          { label: "CR (Left)", marker: [10, 18] },
          { label: "ECB 15", marker: [10, 36] },
          { label: "ECB 16", marker: [10, 58] },
          { label: "ECB 17", marker: [10, 80] },
          { label: "ECB 19 (LAB 1)", marker: [28, 42] },
          { label: "ECB 18 (LAB 2)", marker: [72, 42] },
          { label: "ECB 14", marker: [73, 20] },
          { label: "CR (Right)", marker: [90, 18] },
          { label: "ECB 13", marker: [90, 36] },
          { label: "ECB 12", marker: [90, 58] },
          { label: "TECHNOLOGY DEPT", marker: [90, 80] },
        ],
      },
      {
        floorLabel: "2nd Floor",
        items: [
          { label: "ELECTRICAL ROOM", marker: [10, 22] },
          { label: "COMP LAB 5", marker: [10, 38] },
          { label: "COMP LAB 6", marker: [10, 58] },
          { label: "ECB 204", marker: [10, 82] },
          { label: "COMP LAB 4", marker: [35, 20] },
          { label: "CS DEPT", marker: [50, 15] },
          { label: "COMP LAB 1", marker: [65, 20] },
          { label: "CR (Right)", marker: [85, 18] },
          { label: "COMP LAB 3", marker: [35, 45] },
          { label: "COMP LAB 2", marker: [65, 45] },
          { label: "ECB 203", marker: [90, 38] },
          { label: "ECB 202", marker: [90, 58] },
          { label: "ECB 201", marker: [90, 82] },
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
    image: fpCanteen,
    floorPlans: [
      { label: "1st Floor", image: fpCanteen },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          { label: "BUP Canteen", marker: [50, 50] },
        ],
      }
    ],
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
    image: fpRegistrar,
    thumbnail: thumbRegistrar,
    floorPlans: [
      { label: "1st Floor", image: fpRegistrar },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          { label: "REGISTRAR OFFICE", marker: [50, 50] },
        ],
      }
    ],
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
    image: fpAdmin1st,
    thumbnail: thumbAdmin,
    floorPlans: [
      { label: "1st Floor", image: fpAdmin1st },
      { label: "2nd Floor", image: fpAdmin2nd },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          { label: "AB 11", marker: [15, 45] },
          { label: "AB 12", marker: [30, 45] },
          { label: "AB 13", marker: [45, 45] },
          { label: "AB 14", marker: [60, 45] },
          { label: "CASHIER", marker: [73, 45] },
          { label: "CR", marker: [85, 45] },
        ],
      },
      {
        floorLabel: "2nd Floor",
        items: [
          { label: "ICTMO", marker: [15, 45] },
          { label: "ADMIN OFFICE", marker: [30, 45] },
          { label: "ACCOUNTING OFFICE", marker: [45, 45] },
          { label: "DEAN'S OFFICE", marker: [60, 45] },
          { label: "ASSOCIATE DEAN'S OFFICE", marker: [85, 45] },
        ],
      },
    ],
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
    image: fpNursing,
    thumbnail: thumbNursing,
    floorPlans: [
      { label: "1st Floor", image: fpNursing },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          { label: "COORDINATING OFFICE", marker: [27, 13] },
          { label: "RESEARCH ROOM", marker: [43, 13] },
          { label: "ORTHOPEDIC ROOM", marker: [65, 13] },
          { label: "CR (Top Left)", marker: [13, 13] },
          { label: "SKILLS LABORATORY", marker: [15, 38] },
          { label: "AUDIO VISUAL ROOM", marker: [15, 60] },
          { label: "CR (Bottom Left)", marker: [15, 90] },
          { label: "DEPARTMENT CHAIRPERSON", marker: [35, 90] },
          { label: "PART-TIME LOUNGE", marker: [55, 90] },
          { label: "STUDENT LOUNGE", marker: [65, 90] },
          { label: "NURSING FACULTY ROOM", marker: [80, 90] },
          { label: "ANAPHY ROOM", marker: [82, 30] },
          { label: "MATERIAL & CHILD ROOM", marker: [82, 45] },
          { label: "MED-SURG ROOM", marker: [82, 55] },
          { label: "SIMULATION ROOM", marker: [85, 65] },
        ],
      }
    ],
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
    image: fpSalceda1st,
    thumbnail: thumbSalceda,
    floorPlans: [
      { label: "1st Floor", image: fpSalceda1st },
      { label: "2nd Floor", image: fpSalceda2nd },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          { label: "LABORATORY (SB 13)", marker: [10, 15] },
          { label: "LABORATORY (SB 12)", marker: [10, 25] },
          { label: "LABORATORY (SB 11)", marker: [10, 35] },
          { label: "STOCKROOM FOR PHYSICAL SCIENCES", marker: [10, 45] },
          { label: "CR (Left Wing)", marker: [10, 55] },
          { label: "QUALITY ASSURANCE OFFICE", marker: [10, 65] },
          { label: "DOCUMENT CUSTODIAN OFFICE", marker: [10, 75] },
          { label: "CSAC", marker: [10, 85] },
          { label: "CR (Left Lower)", marker: [15, 89] },
          { label: "SB 1", marker: [35, 85] },
          { label: "SB 2", marker: [50, 85] },
          { label: "SB 3", marker: [65, 85] },
          { label: "SB 4", marker: [90, 85] },
          { label: "SB 5", marker: [90, 75] },
          { label: "SB 6", marker: [90, 65] },
          { label: "EDUCATION DEPARTMENT", marker: [90, 45] },
          { label: "DEPARTMENT HEAD", marker: [90, 35] },
          { label: "DEFENSE ROOM", marker: [90, 25] },
          { label: "ICT LABORATORY", marker: [90, 15] },
          { label: "CR (Right Wing)", marker: [90, 55] },
        ],
      },
      {
        floorLabel: "2nd Floor",
        items: [
          { label: "SB 14", marker: [10, 8] },
          { label: "PHYSICAL LABORATORY (SB 15)", marker: [10, 25] },
          { label: "MICROBIOLOGY LABORATORY (SB 16)", marker: [10, 35] },
          { label: "STOCKROOM", marker: [10, 45] },
          { label: "CR (Left Upper)", marker: [10, 55] },
          { label: "SB 17", marker: [10, 65] },
          { label: "TECHNICAL ROOM", marker: [10, 80] },
          { label: "OFFICE OF THE LIBRARIAN", marker: [10, 90] },
          { label: "CR (Left Lower)", marker: [10, 95] },
          { label: "LIBRARY: CIRCULATION & READING SECTION", marker: [50, 93] },
          { label: "LIBRARY: GENERAL REFERENCE SECTION", marker: [85, 75] },
          { label: "CR (Right Lower)", marker: [90, 55] },
          { label: "WORSHIP ROOM", marker: [90, 45] },
          { label: "MUSIC ROOM", marker: [90, 35] },
          { label: "SB 22", marker: [90, 22] },
          { label: "SB 23", marker: [90, 8] },
        ],
      },
    ],
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
    image: fpComEng1st,
    thumbnail: thumbElectronic,
    floorPlans: [
      { label: "1st Floor", image: fpComEng1st },
      { label: "2nd Floor", image: fpComEng2nd },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          { label: "ENGINEERING DEPT", marker: [25, 20] },
          { label: "CR (Left)", marker: [10, 18] },
          { label: "ECB 15", marker: [10, 36] },
          { label: "ECB 16", marker: [10, 58] },
          { label: "ECB 17", marker: [10, 80] },
          { label: "ECB 19 (LAB 1)", marker: [28, 42] },
          { label: "ECB 18 (LAB 2)", marker: [72, 42] },
          { label: "ECB 14", marker: [73, 20] },
          { label: "CR (Right)", marker: [90, 18] },
          { label: "ECB 13", marker: [90, 36] },
          { label: "ECB 12", marker: [90, 58] },
          { label: "TECHNOLOGY DEPT", marker: [90, 80] },
        ],
      },
      {
        floorLabel: "2nd Floor",
        items: [
          { label: "ELECTRICAL ROOM", marker: [10, 22] },
          { label: "COMP LAB 5", marker: [10, 38] },
          { label: "COMP LAB 6", marker: [10, 58] },
          { label: "ECB 204", marker: [10, 82] },
          { label: "COMP LAB 4", marker: [35, 20] },
          { label: "CS DEPT", marker: [50, 15] },
          { label: "COMP LAB 1", marker: [65, 20] },
          { label: "CR (Right)", marker: [85, 18] },
          { label: "COMP LAB 3", marker: [35, 45] },
          { label: "COMP LAB 2", marker: [65, 45] },
          { label: "ECB 203", marker: [90, 38] },
          { label: "ECB 202", marker: [90, 58] },
          { label: "ECB 201", marker: [90, 82] },
        ],
      },
    ],
    summary:
      "Department area for technology-focused classes, labs, and student consultations.",
    details: [
      "Common stop for technology and applied technical subjects",
      "Near central campus walkways and neighboring academic buildings",
      "Useful destination for class navigation and department concerns",
    ],
    keywords: ["technological", "technology", "tech department", "etd"],
  },
  {
    label: "Dormstel Building",
    lat: 13.296839,
    lon: 123.484218,
    image: destinationAdminImage,
    thumbnail: thumbDormstel,
    summary: "Dormitory and hostel facility serving the university community.",
    details: [
      "Provides accommodation for students and guests",
      "Located at the campus edge for convenience",
    ],
    keywords: ["dorm", "dormitory", "hostel", "dormstel", "housing"],
  },
  {
    label: "Center for Student Services",
    lat: 13.29615,
    lon: 123.48502,
    image: destinationAdminImage,
    thumbnail: thumbStudentServices,
    summary: "Hub for various student support operations and organizations.",
    details: [
      "Houses offices for student welfare and activities",
      "Central location right next to the Canteen",
    ],
    keywords: ["services", "student", "css", "center for student services", "organizations"],
  },
  {
    label: "Clinic",
    lat: 13.2959415,
    lon: 123.4854642,
    image: fpClinic,
    thumbnail: thumbClinic,
    floorPlans: [
      { label: "1st Floor", image: fpClinic },
    ],
    floorDirectory: [
      {
        floorLabel: "1st Floor",
        items: [
          { label: "Clinic", marker: [50, 30] },
          { label: "AVR", marker: [50, 70] },
        ],
      }
    ],
    summary: "University health and medical clinic for immediate care.",
    details: [
      "Sandwiched between the Salceda building and Admin building",
      "Provides first aid and health checks for students",
    ],
    keywords: ["clinic", "health", "medical", "first aid", "nurse"],
  },
];
