/**
 * Comprehensive Campus Services and Transactions Database
 * Complete information about all services, fees, and procedures available at Bicol University Polangui
 * This data is used by the AI assistant to provide detailed service information and navigation
 */

export type ServiceCategory = "academic" | "library" | "health" | "financial" | "administrative" | "research" | "extension";

export type ServiceInfo = {
  id: string;
  name: string;
  category: ServiceCategory;
  building?: string;
  office?: string;
  floor?: number;
  description: string;
  details?: string[];
  fee?: number;
  feeDescription?: string;
  relatedServices?: string[];
};

export const CAMPUS_SERVICES_DATABASE: ServiceInfo[] = [
  // REGISTRAR SERVICES - Academic Transactions
  {
    id: "registrar-crp",
    name: "Opening of Cost Recovery Program (CRP)",
    category: "academic",
    building: "Administration Building",
    office: "Registrar's Office",
    floor: 1,
    description: "Allows students to enroll in subjects offered under a special program (usually with fees if regular slots are unavailable)",
    fee: 10,
    feeDescription: "Per subject",
  },
  {
    id: "registrar-drop",
    name: "Dropping of Subjects",
    category: "academic",
    building: "Administration Building",
    office: "Registrar's Office",
    floor: 1,
    description: "Students may officially remove enrolled subjects within the allowed period",
    fee: 10,
    feeDescription: "Per subject",
  },
  {
    id: "registrar-add-change",
    name: "Adding or Changing of Subjects",
    category: "academic",
    building: "Administration Building",
    office: "Registrar's Office",
    floor: 1,
    description: "Students can revise their enrolled subjects (add new ones or replace existing ones)",
    fee: 10,
    feeDescription: "Per subject",
  },
  {
    id: "registrar-loa",
    name: "Application for Leave of Absence (LOA)",
    category: "academic",
    building: "Administration Building",
    office: "Registrar's Office",
    floor: 1,
    description: "Students formally request temporary leave from their studies for valid reasons",
  },
  {
    id: "registrar-otr",
    name: "Official Transcript of Records (OTR)",
    category: "academic",
    building: "Administration Building",
    office: "Registrar's Office",
    floor: 1,
    description: "Provides the official academic record of a student for employment, transfer, or further studies",
    fee: 30,
    feeDescription: "Per page",
  },
  {
    id: "registrar-auth-credentials",
    name: "Authentication of Academic Credentials",
    category: "academic",
    building: "Administration Building",
    office: "Registrar's Office",
    floor: 1,
    description: "Verification and certification of documents such as TOR, diploma, or certificates for legal or official use",
    fee: 10,
    feeDescription: "Per document",
  },
  {
    id: "registrar-honorable-dismissal",
    name: "Request for Honorable Dismissal",
    category: "academic",
    building: "Administration Building",
    office: "Registrar's Office",
    floor: 1,
    description: "Issued when a student transfers to another school; certifies no pending obligations",
    fee: 75,
  },
  {
    id: "registrar-certifications",
    name: "Request for Certifications",
    category: "academic",
    building: "Administration Building",
    office: "Registrar's Office",
    floor: 1,
    description: "Obtain official certificates for various academic purposes",
    fee: 20,
    feeDescription: "Per certification",
    details: [
      "Grades (Certification of Grades)",
      "Registration/Enrollment Status",
      "General Weighted Average (GWA)",
      "Good Moral Character",
      "Course Descriptions",
      "Units Earned",
      "Certificate of Being a Bona Fide Student",
      "Completion of Academic Requirements (CAR)",
    ],
  },

  // LIBRARY SERVICES
  {
    id: "library-borrow-no-liability",
    name: "Borrowing of Books (Without Accountability)",
    category: "library",
    building: "Salceda Building",
    office: "Library Services",
    floor: 2,
    description: "For students with no pending obligations in the library",
  },
  {
    id: "library-borrow-with-liability",
    name: "Borrowing of Books (With Accountability)",
    category: "library",
    building: "Salceda Building",
    office: "Library Services",
    floor: 2,
    description: "For students with existing obligations but still allowed limited borrowing",
  },
  {
    id: "library-external-researchers",
    name: "Provision of Services to External Researchers",
    category: "library",
    building: "Salceda Building",
    office: "Library Services",
    floor: 2,
    description: "Non-BU individuals may request access to library materials for research purposes",
  },
  {
    id: "library-permit",
    name: "Issuance of Library Permit",
    category: "library",
    building: "Salceda Building",
    office: "Library Services",
    floor: 2,
    description: "Required for access to library facilities and services",
  },
  {
    id: "library-referral-letter",
    name: "Request for Referral Letter",
    category: "library",
    building: "Salceda Building",
    office: "Library Services",
    floor: 2,
    description: "Allows students to access other libraries or institutions",
  },
  {
    id: "library-borrower-card",
    name: "Issuance of Student Borrower's Card",
    category: "library",
    building: "Salceda Building",
    office: "Library Services",
    floor: 2,
    description: "Official ID for borrowing books",
  },
  {
    id: "library-online-delivery",
    name: "Online Document Delivery",
    category: "library",
    building: "Salceda Building",
    office: "Library Services",
    floor: 2,
    description: "Digital access or request of documents and research materials",
  },

  // HEALTH SERVICES
  {
    id: "health-dental-consultation",
    name: "Dental Consultation and Treatment",
    category: "health",
    building: "Medical and Dental Clinic Bicol Univerity Health Services",
    office: "Bicol University Health Services (BUHS)",
    description: "Basic dental care such as check-ups, cleaning, and treatment",
  },
  {
    id: "health-dental-exam",
    name: "Dental Examination",
    category: "health",
    building: "Medical and Dental Clinic Bicol Univerity Health Services",
    office: "Bicol University Health Services (BUHS)",
    description: "Required dental check-ups for medical clearance or school requirements",
  },
  {
    id: "health-medical-consultation",
    name: "Medical Consultation and Treatment",
    category: "health",
    building: "Medical and Dental Clinic Bicol Univerity Health Services",
    office: "Bicol University Health Services (BUHS)",
    description: "General health services including diagnosis and treatment of common illnesses",
  },
  {
    id: "health-medical-exam",
    name: "Medical Examination",
    category: "health",
    building: "Medical and Dental Clinic Bicol Univerity Health Services",
    office: "Bicol University Health Services (BUHS)",
    description: "Physical exams for enrollment, clearance, or other official purposes",
  },

  // CSAC SERVICES
  {
    id: "csac-insurance-endorsement",
    name: "Endorsement of Claims for Insurance Benefits",
    category: "administrative",
    building: "Salceda Building",
    office: "CSAC Office",
    floor: 1,
    description: "Process endorsement for insurance benefit claims",
  },
  {
    id: "csac-id-distribution",
    name: "Distribution of University Identification Card",
    category: "administrative",
    building: "Salceda Building",
    office: "CSAC Office",
    floor: 1,
    description: "Official university ID distribution",
    fee: 75,
  },
  {
    id: "csac-id-reprint",
    name: "Endorsement for Re-printing of University ID",
    category: "administrative",
    building: "Salceda Building",
    office: "CSAC Office",
    floor: 1,
    description: "Re-print damaged, lost, defaced, mutilated, or faded university IDs",
    fee: 50,
    details: ["Lost ID", "Defaced ID", "Mutilated ID", "Faded ID"],
  },
  {
    id: "csac-travel-authority",
    name: "Endorsement for Authority to Travel",
    category: "administrative",
    building: "Salceda Building",
    office: "CSAC Office",
    floor: 1,
    description: "Issuance of travel authority for student field trips and academic activities",
  },
  {
    id: "csac-org-recognition",
    name: "Application for Recognition and Re-accreditation of College Organizations",
    category: "administrative",
    building: "Salceda Building",
    office: "CSAC Office",
    floor: 1,
    description: "Formal recognition of college-based student organizations",
  },
  {
    id: "csac-activity-approval",
    name: "Endorsement for Approval of In-Campus Student Activities",
    category: "administrative",
    building: "Salceda Building",
    office: "CSAC Office",
    floor: 1,
    description: "Approval and endorsement of student organization activities",
  },

  // SUPPLY OFFICE SERVICES
  {
    id: "supply-procurement",
    name: "Procurement through DBM-Ps",
    category: "administrative",
    building: "Supply office",
    description: "Uniform procurement procedure for supplies and materials through Department of Budget and Management",
  },
  {
    id: "supply-disposal",
    name: "Disposal of Unserviceable Properties & Waste Materials",
    category: "administrative",
    building: "Supply office",
    description: "Proper handling and disposal of unserviceable university properties",
    details: ["Conduct Sale of Unserviceable Property", "Refund of Bid Security"],
  },
  {
    id: "supply-contract-payment",
    name: "Contract Implementation and Processing of Payment",
    category: "administrative",
    building: "Supply office",
    description: "Uniform process for contract implementation and supplier payment",
    details: ["Inspection", "Acceptance", "Issuance", "Payment"],
  },

  // RESEARCH AND DEVELOPMENT
  {
    id: "rdeo-research-proposals",
    name: "Receiving and Endorsing Research Proposals",
    category: "research",
    building: "Research Development and Extension Office",
    description: "Submit and process research proposals for faculty and students",
  },
  {
    id: "rdeo-monitoring-reports",
    name: "Receiving and Recording Monitoring Reports",
    category: "research",
    building: "Research Development and Extension Office",
    description: "Track and record research project progress reports",
  },
  {
    id: "rdeo-research-capabilities",
    name: "Conduct Research Capabilities for Faculty and Students",
    category: "research",
    building: "Research Development and Extension Office",
    description: "Training and development programs for research skills",
  },
  {
    id: "rdeo-research-forum",
    name: "Recommendations to Research Forums",
    category: "research",
    building: "Research Development and Extension Office",
    description: "Recommend faculty and students to participate in research forums",
    details: ["International Forums", "National Forums", "Regional Forums", "Local Forums"],
  },

  // EXTENSION SERVICES
  {
    id: "extension-proposals",
    name: "Receiving and Endorsing Extension Proposals",
    category: "extension",
    building: "College Extension Management Office",
    description: "Submit and process community extension project proposals",
  },
  {
    id: "extension-monitoring",
    name: "Receiving and Recording Monitoring Reports",
    category: "extension",
    building: "College Extension Management Office",
    description: "Track and record extension project progress",
  },
  {
    id: "extension-capabilities",
    name: "Conduct Extension Capabilities for Faculty and Students",
    category: "extension",
    building: "College Extension Management Office",
    description: "Training for community outreach and extension programs",
  },
  {
    id: "extension-forum",
    name: "Recommendations to Extension Forums",
    category: "extension",
    building: "College Extension Management Office",
    description: "Recommend faculty and students for extension forum participation",
  },

  // FINANCE AND BUDGET SERVICES
  {
    id: "finance-caf",
    name: "Issuance of Certificate of Availability of Funds (CAF)",
    category: "financial",
    building: "Administration Building",
    office: "Finance Office / Budget Office",
    floor: 2,
    description: "Commitment of budget allocation for approved activities",
  },
  {
    id: "finance-ors-burs",
    name: "Issuance of Obligation Request and Status (ORS/BURS)",
    category: "financial",
    building: "Administration Building",
    office: "Finance Office / Budget Office",
    floor: 2,
    description: "Certification of available and obligated budget allocations",
    details: ["ORS (Obligation Request and Status)", "BURS (Budget Utilization Request and Status)"],
  },

  // CASHIER SERVICES - FEES
  {
    id: "cashier-certification-fee",
    name: "Certification Fees",
    category: "financial",
    building: "Administration Building",
    office: "Cashier's Office",
    floor: 1,
    description: "Fees for various official certifications",
    fee: 20,
    details: [
      "Certificate of Good Moral Character",
      "Certificate of Bona Fide Student",
      "Certificate of Enrollment",
      "Certificate of Payment (O.R.)",
    ],
  },
  {
    id: "cashier-authentication-fee",
    name: "Authentication Fees",
    category: "financial",
    building: "Administration Building",
    office: "Cashier's Office",
    floor: 1,
    description: "Fees for document authentication",
    fee: 10,
    details: ["Authentication of Transcript of Records (TOR)", "Authentication of Good Moral", "Authentication of O.R.", "Authentication of ID"],
  },
  {
    id: "cashier-cor-reprint",
    name: "COR Reprinting",
    category: "financial",
    building: "Administration Building",
    office: "Cashier's Office",
    floor: 1,
    description: "Reprinting of Certificate of Records",
    fee: 20,
  },
  {
    id: "cashier-completion-form",
    name: "Completion Form",
    category: "financial",
    building: "Administration Building",
    office: "Cashier's Office",
    floor: 1,
    description: "Completion of Academic Requirements form",
    fee: 20,
  },
  {
    id: "cashier-id-fee",
    name: "Identification Card",
    category: "financial",
    building: "Administration Building",
    office: "Cashier's Office",
    floor: 1,
    description: "Initial issuance of university identification card",
    fee: 75,
  },
  {
    id: "cashier-subject-change-fee",
    name: "Adding/Dropping/Changing of Subjects",
    category: "financial",
    building: "Administration Building",
    office: "Cashier's Office",
    floor: 1,
    description: "Fee per subject for enrollment changes",
    fee: 10,
    feeDescription: "Per subject",
  },
  {
    id: "cashier-thesis-fee",
    name: "Thesis Fee",
    category: "financial",
    building: "Administration Building",
    office: "Cashier's Office",
    floor: 1,
    description: "Fee for thesis research and writing",
    fee: 1200,
  },
  {
    id: "cashier-ojt-fee",
    name: "On the Job Training Fee",
    category: "financial",
    building: "Administration Building",
    office: "Cashier's Office",
    floor: 1,
    description: "Fee for on-the-job training programs",
    fee: 200,
  },
  {
    id: "cashier-practice-teaching",
    name: "Practice Teaching Fee",
    category: "financial",
    building: "Administration Building",
    office: "Cashier's Office",
    floor: 1,
    description: "Fee for practice teaching program",
    fee: 1000,
  },
];

/**
 * Get all services for a specific category
 */
export function getServicesByCategory(category: ServiceCategory): ServiceInfo[] {
  return CAMPUS_SERVICES_DATABASE.filter((service) => service.category === category);
}

/**
 * Get service information by ID
 */
export function getServiceById(id: string): ServiceInfo | undefined {
  return CAMPUS_SERVICES_DATABASE.find((service) => service.id === id);
}

/**
 * Search services by name or keywords
 */
export function searchServices(query: string): ServiceInfo[] {
  const normalizedQuery = query.toLowerCase();
  return CAMPUS_SERVICES_DATABASE.filter((service) => {
    const nameMatch = service.name.toLowerCase().includes(normalizedQuery);
    const descriptionMatch = service.description.toLowerCase().includes(normalizedQuery);
    const officeMatch = service.office?.toLowerCase().includes(normalizedQuery);
    const detailsMatch = service.details?.some((detail) => detail.toLowerCase().includes(normalizedQuery));
    return nameMatch || descriptionMatch || officeMatch || detailsMatch;
  });
}

/**
 * Get formatted services information for AI context
 */
export function getCampusServicesText(): string {
  let output = "BICOL UNIVERSITY POLANGUI CAMPUS - SERVICES & TRANSACTIONS GUIDE\n\n";

  // Group by category
  const categories: Array<{ name: string; category: ServiceCategory }> = [
    { name: "ACADEMIC SERVICES", category: "academic" },
    { name: "LIBRARY SERVICES", category: "library" },
    { name: "HEALTH SERVICES", category: "health" },
    { name: "FINANCIAL SERVICES", category: "financial" },
    { name: "STUDENT SERVICES", category: "administrative" },
    { name: "RESEARCH SERVICES", category: "research" },
    { name: "EXTENSION SERVICES", category: "extension" },
  ];

  for (const { name, category } of categories) {
    const services = getServicesByCategory(category);
    if (services.length === 0) continue;

    output += `${name}\n`;
    output += "=".repeat(name.length) + "\n\n";

    for (const service of services) {
      output += `• ${service.name}`;
      if (service.building) {
        output += ` (${service.building}`;
        if (service.floor) {
          output += `, Floor ${service.floor}`;
        }
        output += ")";
      }
      output += "\n";

      output += `  ${service.description}\n`;

      if (service.fee) {
        output += `  Fee: ₱${service.fee} ${service.feeDescription || ""}\n`;
      }

      if (service.details && service.details.length > 0) {
        output += `  Includes: ${service.details.join(", ")}\n`;
      }

      output += "\n";
    }

    output += "\n";
  }

  return output;
}
