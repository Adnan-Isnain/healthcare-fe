import { Patient } from './patient';

export interface Treatment {
  id: string;
  date: string;
  treatmentOptions: string[];
  medications: string[];
  costOfTreatment: number;
  patientId: string;
  patient?: Patient;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateTreatmentForm {
  patientId: string;
  dateOfTreatment: string;
  treatmentDescription: string[];
  medicationsPrescribed: string[];
  costOfTreatment: number;
}

export interface UpdateTreatmentForm extends Partial<CreateTreatmentForm> {
  id: string;
}