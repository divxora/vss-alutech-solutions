export type EnquiryStatus =
  | 'new'
  | 'in_review'
  | 'contacted'
  | 'proposal_sent'
  | 'won'
  | 'lost'
  | 'archived';

export type EmailDeliveryStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export type ServiceCategory =
  | 'Aluminium extrusion press solutions'
  | 'Furnace selection, setup and execution'
  | 'Plant troubleshooting and technical consultancy'
  | 'Tool-room solutions and die sourcing'
  | 'Skilled and contract manpower'
  | 'Other aluminium extrusion requirements';

export type ProjectStage =
  | 'New Greenfield Plant'
  | 'Plant Expansion / Line Addition'
  | 'Machinery Replacement / Modernization'
  | 'Troubleshooting & Optimization'
  | 'Die / Tooling Sourcing'
  | 'Skilled Manpower Requirement';

export type TimelineUrgency =
  | 'Immediate (Within 1-2 weeks)'
  | '1 Month'
  | '1 to 3 Months'
  | '3 to 6 Months'
  | 'Budgetary / Exploratory Planning';

export type PreferredContactMethod = 'WhatsApp' | 'Phone Call' | 'Email';

export interface Enquiry {
  id: string;
  referenceId: string;
  // Customer details
  fullName: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  cityState: string;
  country: string;
  // Core enquiry
  serviceCategory: ServiceCategory | string;
  message: string;
  // Optional specifications
  plantLocation?: string;
  machineryRequired?: string;
  pressCapacity?: string;
  technicalSpecs?: string;
  approxBudget?: string;
  projectStage?: ProjectStage | string;
  timelineUrgency?: TimelineUrgency | string;
  preferredContact?: PreferredContactMethod | string;
  additionalNotes?: string;
  attachmentName?: string;
  attachmentSizeMB?: string;
  // Workflow & CRM
  status: EnquiryStatus;
  adminNotes?: string;
  // Email tracking
  emailStatus: EmailDeliveryStatus;
  emailProviderId?: string;
  emailError?: string;
  emailSentAt?: string;
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryActivity {
  id: string;
  enquiryId: string;
  action: string;
  details?: Record<string, unknown>;
  performedBy: string;
  createdAt: string;
}

export interface EnquirySubmissionPayload {
  fullName: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  cityState: string;
  country: string;
  serviceCategory: string;
  message: string;
  plantLocation?: string;
  machineryRequired?: string;
  pressCapacity?: string;
  technicalSpecs?: string;
  approxBudget?: string;
  projectStage?: string;
  timelineUrgency?: string;
  preferredContact?: string;
  additionalNotes?: string;
  attachmentName?: string;
  attachmentSizeMB?: string;
  honeypot?: string; // Bot protection
  submittedAtClient?: string;
}

export interface EnquirySubmissionResponse {
  success: boolean;
  referenceId?: string;
  emailStatus?: EmailDeliveryStatus;
  message: string;
  error?: string;
}

// Backwards-compatible ConsultationFormData
export interface ConsultationFormData {
  fullName: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  cityState?: string;
  country?: string;
  serviceRequired: string;
  projectStage: string;
  estimatedRequirement: string;
  message: string;
  plantLocation?: string;
  machineryRequired?: string;
  pressCapacity?: string;
  technicalSpecs?: string;
  approxBudget?: string;
  timelineUrgency?: string;
  preferredContact?: string;
  additionalNotes?: string;
  attachmentName?: string;
  attachmentSizeMB?: string;
  submittedAt?: string;
}

export interface ManpowerFormData {
  designation: string;
  workersCount: number | string;
  skillLevel: string;
  shift: string;
  duration: string;
  location: string;
  phone: string;
  email: string;
  requestedAt?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  isSuccess?: boolean;
}

export interface TonnageRule {
  press: string;
  container: string;
  output: string;
  ccd: string;
}
