export interface TreatmentOption {
  id: string;
  name: string;
}


export interface CreateTreatmentForm {
  patientName: string;
  patientId: string;
  dateOfTreatment: string;
  treatmentDescription: string[];
  medicationsPrescribed: string[];
  costOfTreatment: number;
} 