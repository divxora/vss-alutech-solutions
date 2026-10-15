export interface ConsultationFormData {
  fullName: string;
  companyName: string;
  phoneNumber: string;
  emailAddress: string;
  serviceRequired: string;
  projectStage: string;
  estimatedRequirement: string;
  message: string;
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
