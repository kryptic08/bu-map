/**
 * Bicol University Polangui Campus Directory
 * Comprehensive catalog of all buildings, floors, rooms, and facilities
 * This data is used by the AI assistant to provide detailed campus information
 */

export type RoomInfo = {
  code: string;
  name: string;
  floor: number;
  aliases?: string[];
};

export type BuildingInfo = {
  code: string;
  name: string;
  fullName?: string;
  rooms: RoomInfo[];
  aliases?: string[];
};

export const CAMPUS_BUILDINGS: BuildingInfo[] = [
  {
    code: "SB",
    name: "Salceda Building",
    aliases: ["salceda", "original salceda", "sb"],
    rooms: [
      // First Floor
      { code: "SB-1", name: "SB-1", floor: 1, aliases: ["sb1"] },
      { code: "SB-2", name: "SB-2", floor: 1, aliases: ["sb2"] },
      { code: "SB-3", name: "SB-3", floor: 1, aliases: ["sb3"] },
      { code: "SB-4", name: "SB-4", floor: 1, aliases: ["sb4"] },
      { code: "SB-5", name: "SB-5", floor: 1, aliases: ["sb5"] },
      { code: "SB-6", name: "SB-6", floor: 1, aliases: ["sb6"] },
      { code: "CSAC", name: "CSAC Office", floor: 1, aliases: ["csac office", "csac"] },
      { code: "DOC-CUST", name: "Document Custodian Office", floor: 1, aliases: ["document custodian", "custodian"] },
      { code: "QA", name: "Quality Assurance Office", floor: 1, aliases: ["quality assurance", "qa office", "qa"] },
      { code: "SR-PS", name: "Stock Room for Physical Science", floor: 1, aliases: ["physical science stock room", "stock room"] },
      { code: "SB-11", name: "General/Analytical Chemistry Laboratory (SB-11)", floor: 1, aliases: ["chem lab", "chemistry lab", "sb-11", "sb11", "general chemistry", "analytical chemistry"] },
      { code: "SB-12", name: "Biochemistry/Organic Chemistry Laboratory (Sb-12)", floor: 1, aliases: ["biochem lab", "organic chemistry", "sb-12", "sb12", "biochemistry lab"] },
      { code: "SB-13", name: "Educational Technology Laboratory (Sb-13)", floor: 1, aliases: ["edtech lab", "educational technology", "sb-13", "sb13", "edtech"] },
      { code: "TED", name: "Teacher Education Department", floor: 1, aliases: ["ted", "teacher ed", "education department", "teacher education"] },
      { code: "TED-HEAD", name: "Office of the Department Head", floor: 1, aliases: ["department head", "ted head"] },
      { code: "TED-DEPT", name: "Office of the Department", floor: 1, aliases: ["department office", "ted office"] },
      { code: "DEFENSE", name: "Defense Room", floor: 1, aliases: ["thesis defense", "defense room", "defense"] },
      { code: "ARCHIVES", name: "Archives", floor: 1, aliases: ["archive", "archives room"] },
      { code: "ICT-LAB", name: "ICT Laboratory", floor: 1, aliases: ["ict lab", "ict", "information technology lab"] },

      // Second Floor
      { code: "LIB-1", name: "Library (Room 1) Circulation and Reading Section", floor: 2, aliases: ["library room 1", "reading section", "circulation", "library", "lib"] },
      { code: "LIB-2", name: "Library (Room 2) General Reference Section", floor: 2, aliases: ["library room 2", "reference section", "general reference"] },
      { code: "LIBRARIAN", name: "Office of the Librarian", floor: 2, aliases: ["librarian office", "librarian"] },
      { code: "TECH-ROOM", name: "Technical room/Multimedia room", floor: 2, aliases: ["multimedia room", "tech room", "technical room"] },
      { code: "SB-17", name: "Digital Language and SpeechLab. (Sb17)", floor: 2, aliases: ["language lab", "speech lab", "sb-17", "sb17", "digital language lab"] },
      { code: "SR-BS", name: "Stock room for Biological Sciences", floor: 2, aliases: ["bio stock room", "biological sciences stock", "bio stock"] },
      { code: "SB-16", name: "Microbiology Laboratory (Sb16)", floor: 2, aliases: ["micro lab", "microbiology", "sb-16", "sb16", "microbiology lab"] },
      { code: "SB-15", name: "Physical Laboratory (Sb-15)", floor: 2, aliases: ["physics lab", "physical lab", "sb-15", "sb15"] },
      { code: "SB-14", name: "Sb-14", floor: 2, aliases: ["sb14", "sb-14"] },
      { code: "WORSHIP", name: "Multi-faith Worship Room", floor: 2, aliases: ["worship room", "prayer room", "chapel", "multi-faith", "worship"] },
      { code: "SB-21", name: "Sb-21 (Music room)", floor: 2, aliases: ["music room", "sb-21", "sb21", "music"] },
      { code: "SB-22", name: "Sb-22", floor: 2, aliases: ["sb22", "sb-22"] },
      { code: "SB-23", name: "Sb-23", floor: 2, aliases: ["sb23", "sb-23"] },
    ],
  },
  {
    code: "ECB",
    name: "Center for Computer & Engineering Studies",
    fullName: "Center for Computer and Engineering Studies / Salceda Building 2",
    aliases: ["cces", "computer and engineering studies", "computer studies", "engineering", "ecb", "salceda building 2", "salceda 2", "sb2"],
    rooms: [
      // First Floor
      { code: "LOBBY", name: "Lobby", floor: 1, aliases: ["entrance", "main lobby"] },
      { code: "ENG-FACULTY", name: "Engineering Department Faculty Room", floor: 1, aliases: ["engineering faculty", "faculty room", "engineering faculty room"] },
      { code: "ENG-CHAIR", name: "Office of the Department Chairperson", floor: 1, aliases: ["engineering chairperson", "chair office", "chairperson office", "engineering chair"] },
      { code: "ECB-14", name: "ECB 14", floor: 1, aliases: ["ecb14", "ecb-14"] },
      { code: "ECB-19", name: "ECB 19 (Engineering Laboratory 1)", floor: 1, aliases: ["eng lab 1", "engineering lab 1", "ecb19", "ecb-19", "engineering laboratory 1"] },
      { code: "ECB-18", name: "ECB 18 (Engineering Laboratory 2)", floor: 1, aliases: ["eng lab 2", "engineering lab 2", "ecb18", "ecb-18", "engineering laboratory 2"] },
      { code: "ECB-13", name: "ECB 13", floor: 1, aliases: ["ecb13", "ecb-13"] },
      { code: "ECB-12", name: "ECB 12", floor: 1, aliases: ["ecb12", "ecb-12"] },
      { code: "TECH-DEPT", name: "Technology Department Office", floor: 1, aliases: ["tech department", "technology office", "technology department"] },
      { code: "ECB-15", name: "ECB 15", floor: 1, aliases: ["ecb15", "ecb-15"] },
      { code: "ECB-16", name: "ECB 16", floor: 1, aliases: ["ecb16", "ecb-16"] },
      { code: "ECB-17", name: "ECB 17", floor: 1, aliases: ["ecb17", "ecb-17"] },

      // Second Floor
      { code: "CS-CHAIR", name: "Computer Studies Department Office of the Department Chairperson", floor: 2, aliases: ["cs chair", "computer studies chair", "department chairperson", "cs chairperson", "computer studies chairperson"] },
      { code: "CS-FACULTY", name: "Faculty Room", floor: 2, aliases: ["cs faculty", "computer faculty", "faculty room", "computer studies faculty"] },
      { code: "CL1", name: "Computer Laboratory 1 (CL1)", floor: 2, aliases: ["comp lab 1", "cl1", "computer lab 1", "lab 1"] },
      { code: "CL2", name: "Computer Laboratory 2 (CL2)", floor: 2, aliases: ["comp lab 2", "cl2", "computer lab 2", "lab 2"] },
      { code: "CL3", name: "Computer Laboratory 3 (CL3)", floor: 2, aliases: ["comp lab 3", "cl3", "computer lab 3", "lab 3"] },
      { code: "CL4", name: "Computer Laboratory 4 (CL4)", floor: 2, aliases: ["comp lab 4", "cl4", "computer lab 4", "lab 4"] },
      { code: "CL5", name: "Computer Laboratory 5 (CL5)", floor: 2, aliases: ["comp lab 5", "cl5", "computer lab 5", "lab 5"] },
      { code: "CL6", name: "Computer Laboratory 6 (CL6)", floor: 2, aliases: ["comp lab 6", "cl6", "computer lab 6", "lab 6"] },
      { code: "ELEC-ROOM", name: "Electrical Room", floor: 2, aliases: ["electrical"] },
      { code: "ECB-201", name: "ECB 201", floor: 2, aliases: ["ecb201", "ecb-201"] },
      { code: "ECB-202", name: "ECB 202", floor: 2, aliases: ["ecb202", "ecb-202"] },
      { code: "ECB-203", name: "ECB 203", floor: 2, aliases: ["ecb203", "ecb-203"] },
      { code: "ECB-204", name: "ECB 204", floor: 2, aliases: ["ecb204", "ecb-204", "salceda building 2", "salceda 2", "sb2"] },
    ],
  },
  {
    code: "NURS",
    name: "Nursing Department",
    aliases: ["nursing", "nursing building", "college of nursing", "cn", "nursing dept"],
    rooms: [
      { code: "NURS-CHAIR", name: "Office of the Department Chairperson", floor: 1, aliases: ["nursing chair", "chairperson", "nursing chairperson"] },
      { code: "PT-LOUNGE", name: "Part time Faculty Lounge", floor: 1, aliases: ["part time lounge", "faculty lounge", "part-time faculty"] },
      { code: "STUD-LOUNGE", name: "Student Lounge", floor: 1, aliases: ["nursing student lounge", "student lounge"] },
      { code: "NURS-FACULTY", name: "Nursing Faculty Room", floor: 1, aliases: ["nursing faculty", "faculty room"] },
      { code: "SIM-ROOM", name: "Simulation Room", floor: 1, aliases: ["simulation", "sim room"] },
      { code: "MIDSURG", name: "Midsurg Room", floor: 1, aliases: ["midsurg", "med-surg", "medical surgical"] },
      { code: "MAT-CHILD", name: "Material and Childroom", floor: 1, aliases: ["maternal child", "maternity", "material and child", "childroom"] },
      { code: "ANAPY", name: "Anapy Room", floor: 1, aliases: ["anapy", "anatomy", "physiology", "anatomy and physiology"] },
      { code: "ORTHO", name: "Orthopedic Room", floor: 1, aliases: ["orthopedic", "ortho room", "ortho"] },
      { code: "RESEARCH", name: "Research Room", floor: 1, aliases: ["nursing research", "research"] },
      { code: "COORD", name: "Coordinates Office", floor: 1, aliases: ["coordinator", "coord office", "coordinates"] },
      { code: "SKILLS-LAB", name: "Skills Laboratory", floor: 1, aliases: ["skills lab", "nursing lab", "skills laboratory"] },
      { code: "AV-ROOM", name: "Audio Visual Room", floor: 1, aliases: ["av room", "audio visual", "audiovisual"] },
    ],
  },
  {
    code: "ETD",
    name: "Electronical Technology Department",
    aliases: ["electronics", "electronic tech", "etd", "technology department", "electrical technology"],
    rooms: [
      // First Floor
      { code: "STOR-1", name: "Storage Room", floor: 1, aliases: ["storage", "storage 1"] },
      { code: "TECH-LAB1", name: "Tech Lab 1", floor: 1, aliases: ["technology lab 1", "tech lab 1"] },
      { code: "TECH-LAB2", name: "Tech Lab 2", floor: 1, aliases: ["technology lab 2", "tech lab 2"] },
      { code: "TCL", name: "TCL (close)", floor: 1, aliases: ["tcl", "tcl close"] },
      { code: "STOR-2", name: "Storage Room", floor: 1, aliases: ["storage", "storage 2"] },

      // Second Floor
      { code: "LEC-1", name: "Lecture Room 1", floor: 2, aliases: ["lecture 1", "lecture room 1"] },
      { code: "LEC-2", name: "Lecture Room 2", floor: 2, aliases: ["lecture 2", "lecture room 2"] },
      { code: "LEC-3", name: "Lecture Room 3", floor: 2, aliases: ["lecture 3", "lecture room 3"] },
    ],
  },
  {
    code: "AB",
    name: "Administration Building",
    aliases: ["admin building", "administration", "admin", "ab"],
    rooms: [
      // First Floor
      { code: "AB-11", name: "AB 11", floor: 1, aliases: ["ab11", "ab-11"] },
      { code: "AB-12", name: "AB 12", floor: 1, aliases: ["ab12", "ab-12"] },
      { code: "AB-13", name: "AB 13", floor: 1, aliases: ["ab13", "ab-13"] },
      { code: "AB-14", name: "AB 14", floor: 1, aliases: ["ab14", "ab-14"] },
      { code: "CASHIER", name: "Cashier's Office", floor: 1, aliases: ["cashier", "payment", "cashier office"] },

      // Second Floor
      { code: "ICTMO", name: "I.C.T.M.O (Information and Communication Technology Management Office)", floor: 2, aliases: ["ictmo", "ict office", "it office", "ict management", "information technology"] },
      { code: "ADMIN-OFF", name: "Admin Office", floor: 2, aliases: ["administration office", "admin"] },
      { code: "ACCOUNTING", name: "Accounting Office", floor: 2, aliases: ["accounting", "accounting office"] },
      { code: "DEANS", name: "Deans Office", floor: 2, aliases: ["dean", "deans office", "dean's office"] },
      { code: "ASSOC-DEAN", name: "Associate Dean's Office", floor: 2, aliases: ["associate dean", "assoc dean", "associate deans office"] },
    ],
  },
  {
    code: "GYM",
    name: "Gymnasium",
    aliases: ["gym", "gymnasium", "sports center", "bup gym"],
    rooms: [
      // First Floor
      { code: "ALUMNI", name: "Alumni Office", floor: 1, aliases: ["alumni", "alumni office"] },

      // Second Floor
      { code: "PPBO", name: "Physical Plant and Building Office", floor: 2, aliases: ["physical plant", "building office", "ppbo"] },
      { code: "PCO-DRRM", name: "PCO/DRRM Office", floor: 2, aliases: ["pco", "drrm", "disaster risk", "disaster risk office", "pco office", "drrm office"] },
    ],
  },
  {
    code: "CLINIC",
    name: "Medical and Dental Clinic",
    aliases: ["clinic", "medical clinic", "dental", "health services", "medical", "dental clinic"],
    rooms: [
      { code: "BUHS", name: "Bicol University Health Services", floor: 1, aliases: ["health services", "buhs", "medical", "dental", "bu health services"] },
    ],
  },
  {
    code: "CANTEEN",
    name: "Canteen",
    aliases: ["cafeteria", "food court", "dining", "bup canteen", "food", "cafeteria"],
    rooms: [
      { code: "CANTEEN", name: "Canteen", floor: 1, aliases: ["canteen", "cafeteria", "food", "campus canteen"] },
    ],
  },
  {
    code: "CSS",
    name: "Center for Student Services",
    aliases: ["student services", "css", "center for student services"],
    rooms: [
      { code: "PUBLICATION", name: "Collage Publication", floor: 1, aliases: ["publication", "campus paper", "college publication", "collage publication"] },
      { code: "GUIDANCE", name: "Guidance Office", floor: 1, aliases: ["guidance", "counseling", "guidance office"] },
      { code: "NSTP", name: "NSTP Office", floor: 1, aliases: ["nstp", "national service", "nstp office"] },
      { code: "CSS-OFFICE", name: "Center for Student Services (CSS) Office", floor: 1, aliases: ["css office", "student services office"] },
    ],
  },
  {
    code: "DORM",
    name: "Dormstel and Business Center",
    aliases: ["dormitory", "dormstel", "business center", "dorm"],
    rooms: [
      { code: "DORMSTEL", name: "Dormstel and Business Center", floor: 1, aliases: ["dorm", "dormitory", "business center"] },
    ],
  },
  {
    code: "RDEO",
    name: "Research Development and Extension Office",
    aliases: ["research office", "rdeo", "extension office", "research", "research development"],
    rooms: [
      { code: "RDEO", name: "Research Development and Extension Office", floor: 1, aliases: ["research", "extension", "research office", "rdeo office"] },
    ],
  },
  {
    code: "ROTC",
    name: "Headquarters ROTC office",
    aliases: ["rotc", "military training", "rotc headquarters", "headquarters rotc"],
    rooms: [
      { code: "ROTC-HQ", name: "Headquarters ROTC office", floor: 1, aliases: ["rotc hq", "rotc office", "headquarters rotc office"] },
    ],
  },
  {
    code: "REGISTRAR",
    name: "Registrar Office",
    aliases: ["registrar", "enrollment", "records", "registrar office"],
    rooms: [
      { code: "REGISTRAR", name: "Registrar Office", floor: 1, aliases: ["registrar", "enrollment", "records", "registrars office"] },
    ],
  },
  {
    code: "SUPPLY",
    name: "Supply office",
    aliases: ["supply", "procurement", "supply office"],
    rooms: [
      { code: "SUPPLY", name: "Supply office", floor: 1, aliases: ["supply", "procurement", "supply office"] },
    ],
  },
  {
    code: "BAC",
    name: "BAC Office",
    aliases: ["bac", "bids and awards", "bac office"],
    rooms: [
      { code: "BAC", name: "BAC Office", floor: 1, aliases: ["bac", "bids", "awards", "bids and awards"] },
    ],
  },
  {
    code: "FTB",
    name: "Food Tech",
    fullName: "Food Technology Building",
    aliases: ["food tech", "food technology", "ftb"],
    rooms: [
      { code: "FTB-1", name: "Entrepreneurship Department (Sensory Evaluation Room(Ftb-1))", floor: 1, aliases: ["entrepreneurship", "sensory evaluation", "ftb-1", "ftb1", "entrepreneurship department"] },
      { code: "FP-LAB1", name: "Food processing Laboratory 1", floor: 1, aliases: ["food processing 1", "food lab 1", "food processing laboratory 1"] },
      { code: "FP-LAB2", name: "Food processing Laboratory 2", floor: 1, aliases: ["food processing 2", "food lab 2", "food processing laboratory 2"] },
    ],
  },
  {
    code: "ATB",
    name: "Automotive Building",
    aliases: ["automotive", "auto shop", "atb"],
    rooms: [
      { code: "ATB-1", name: "Atb-1", floor: 1, aliases: ["automotive lab", "atb1", "atb-1"] },
    ],
  },
];

/**
 * Get a formatted list of all campus buildings and rooms for AI context
 */
export function getCampusDirectoryText(): string {
  let output = "BICOL UNIVERSITY POLANGUI CAMPUS - COMPLETE BUILDING DIRECTORY\n\n";

  for (const building of CAMPUS_BUILDINGS) {
    output += `${building.name.toUpperCase()}`;
    if (building.fullName && building.fullName !== building.name) {
      output += ` (${building.fullName})`;
    }
    output += "\n";

    // Group rooms by floor
    const floors = new Map<number, RoomInfo[]>();
    for (const room of building.rooms) {
      if (!floors.has(room.floor)) {
        floors.set(room.floor, []);
      }
      floors.get(room.floor)!.push(room);
    }

    // Sort floors
    const sortedFloors = Array.from(floors.keys()).sort((a, b) => a - b);

    for (const floor of sortedFloors) {
      const floorRooms = floors.get(floor)!;
      const floorLabel = floor === 1 ? "FIRST FLOOR" : floor === 2 ? "SECOND FLOOR" : `FLOOR ${floor}`;
      output += `  ${floorLabel}:\n`;

      for (const room of floorRooms) {
        output += `    - ${room.name}`;
        if (room.code !== room.name) {
          output += ` (${room.code})`;
        }
        if (room.aliases && room.aliases.length > 0) {
          output += ` [Also called: ${room.aliases.join(", ")}]`;
        }
        output += "\n";
      }
    }

    output += "\n";
  }

  return output;
}

/**
 * Search for a room by name, code, or alias
 */
export function findRoom(
  query: string,
): Array<{ building: BuildingInfo; room: RoomInfo }> {
  const normalizedQuery = query.toLowerCase().trim();
  const results: Array<{ building: BuildingInfo; room: RoomInfo }> = [];

  for (const building of CAMPUS_BUILDINGS) {
    for (const room of building.rooms) {
      // Check room code
      if (room.code.toLowerCase() === normalizedQuery) {
        results.push({ building, room });
        continue;
      }

      // Check room name
      if (room.name.toLowerCase().includes(normalizedQuery)) {
        results.push({ building, room });
        continue;
      }

      // Check room aliases
      if (room.aliases) {
        for (const alias of room.aliases) {
          if (alias.toLowerCase().includes(normalizedQuery)) {
            results.push({ building, room });
            break;
          }
        }
      }
    }
  }

  return results;
}

/**
 * Get all rooms in a specific building
 */
export function getRoomsByBuilding(buildingCode: string): RoomInfo[] {
  const building = CAMPUS_BUILDINGS.find(
    (b) => b.code.toLowerCase() === buildingCode.toLowerCase()
  );
  return building ? building.rooms : [];
}

/**
 * CAMPUS SERVICES AND TRANSACTIONS GUIDE
 * Information about key campus offices and services available to students
 */

export const CAMPUS_SERVICES = {
  registrar: {
    office: "Registrar's Office",
    building: "Administration Building",
    floor: 1,
    contact: "Academic Records & Enrollment Services",
    services: [
      "Opening of Cost Recovery Program (CRP)",
      "Dropping of Subjects",
      "Adding or Changing of Subjects",
      "Application for Leave of Absence (LOA)",
      "Official Transcript of Records (OTR)",
      "Authentication of Academic Credentials",
      "Honorable Dismissal",
      "Certifications (Grades, Enrollment, GWA, Good Moral Character, etc.)",
    ],
  },
  library: {
    office: "Library Services",
    building: "Salceda Building",
    floor: 2,
    contact: "Academic Support Services",
    services: [
      "Borrowing of Books",
      "Library Permit Issuance",
      "Student Borrower's Card",
      "Referral Letters",
      "Online Document Delivery",
      "Research Support",
    ],
  },
  health: {
    office: "Medical and Dental Clinic",
    building: "Medical and Dental Clinic",
    floor: 1,
    contact: "Bicol University Health Services (BUHS)",
    services: [
      "Medical Consultation and Treatment",
      "Medical Examination",
      "Dental Consultation and Treatment",
      "Dental Examination",
    ],
  },
  cashier: {
    office: "Cashier's Office",
    building: "Administration Building",
    floor: 1,
    contact: "Financial Transactions",
    services: [
      "Payment Processing",
      "Certification Fees",
      "Identification Card Fees",
      "Transcript of Record",
      "Adding/Dropping/Changing Subjects",
      "Thesis Fee Collection",
      "Practice Teaching Fees",
    ],
    fees: {
      certification: "20.00",
      authentication: "10.00",
      corReprinting: "20.00",
      completionForm: "20.00",
      identificationCard: "75.00",
      honorableDismissal: "75.00",
      transcriptPerPage: "30.00",
      addDropChangePerSubject: "10.00",
      thesisFee: "1200.00",
      onJobTrainingFee: "200.00",
      practiceTeachingFee: "1000.00",
    },
  },
  csac: {
    office: "CSAC Office",
    building: "Salceda Building",
    floor: 1,
    contact: "Academic Services & Clearance",
    services: [
      "Endorsement of insurance claims",
      "Distribution of university identification card",
      "Endorsement for re-printing of university ID",
      "Endorsement for authority to travel",
      "Recognition of college-based organizations",
      "Approval of in-campus student activities",
    ],
  },
  css: {
    office: "Center for Student Services (CSS)",
    building: "Center for Student Services",
    floor: 1,
    contact: "Student Support Services",
    departments: [
      "College Publication",
      "Guidance Office",
      "NSTP Office",
    ],
  },
  rdeo: {
    office: "Research Development and Extension Office",
    building: "Research Development and Extension Office",
    floor: 1,
    contact: "Academic Research Support",
    services: [
      "Receiving and Endorsing Research Proposals",
      "Receiving and Recording Monitoring Reports",
      "Research Capabilities Training for Faculty and Students",
      "Recommendation to Research Forums",
    ],
  },
  supplyOffice: {
    office: "Supply Management Office (SPMO)",
    building: "Supply office",
    floor: 1,
    contact: "Procurement & Materials",
    services: [
      "Procurement through DBM-Ps",
      "Disposal of Unserviceable Properties",
      "Contract Implementation and Payment Processing",
    ],
  },
  procurementManagement: {
    office: "Procurement Management Office",
    building: "BAC Office",
    floor: 1,
    contact: "Bidding & Procurement",
    services: [
      "PPMP to APP Consolidation",
      "Sale of Bidding Documents",
      "Processing of Public Bidding Projects",
      "Procurement Contract Management",
    ],
  },
  financeOffice: {
    office: "Finance Office / Budget Office",
    building: "Administration Building",
    floor: 2,
    contact: "Financial Planning & Budgeting",
    services: [
      "Issuance of Certificate of Availability of Funds (CAF)",
      "Obligation Request and Status (ORS)",
      "Budget Utilization Request and Status (BURS)",
    ],
  },
};

/**
 * Get formatted campus services directory for AI context
 */
export function getCampusServicesText(): string {
  let output = "BICOL UNIVERSITY POLANGUI - CAMPUS SERVICES & TRANSACTIONS\n\n";

  output += "KEY SERVICES FOR STUDENTS:\n\n";

  output += "REGISTRAR'S OFFICE (Administration Building, Floor 1)\n";
  output += "- Academic Records & Enrollment Services\n";
  output += "- Services: Transcript of Records, Certifications, Subject Changes, Leave of Absence\n";
  output += "- Subject-related fees: ₱10.00 per subject for adding/dropping/changing\n";
  output += "- Transcript fee: ₱30.00 per page\n\n";

  output += "LIBRARY (Salceda Building, Floor 2)\n";
  output += "- Borrowing books and research materials\n";
  output += "- Online document delivery and referral letters\n";
  output += "- Student borrower's card and permits\n\n";

  output += "HEALTH SERVICES - Medical and Dental Clinic\n";
  output += "- Medical and Dental consultation and treatment\n";
  output += "- Medical and dental examinations\n";
  output += "- Health clearance services\n\n";

  output += "CASHIER'S OFFICE (Administration Building, Floor 1)\n";
  output += "- All fee collection and payment processing\n";
  output += "- ID Card: ₱75.00 | Honorable Dismissal: ₱75.00\n";
  output += "- Certifications (various): ₱20.00 | Authentication: ₱10.00\n";
  output += "- Thesis Fee: ₱1,200.00 | Practice Teaching: ₱1,000.00\n\n";

  output += "CSAC OFFICE (Salceda Building, Floor 1)\n";
  output += "- Academic clearances and endorsements\n";
  output += "- Student ID card distribution\n";
  output += "- Student activity approvals\n\n";

  output += "CENTER FOR STUDENT SERVICES (CSS)\n";
  output += "- Student guidance and counseling\n";
  output += "- NSTP (National Service Training Program) Office\n";
  output += "- College Publication Office\n\n";

  return output;
}

