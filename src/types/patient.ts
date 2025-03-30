export interface Patient {
    id: string;
    name: string;
    patientId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface CreatePatientForm {
    name: string;
    patientId?: string;
}

export interface UpdatePatientForm extends Partial<CreatePatientForm> {
    id: string;
}