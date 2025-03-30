import useSWR from 'swr';
import { getCookie, setCookie, removeCookie } from '../utils/cookies';
import { TreatmentOption } from '../types/treatmentOption';
import { Medication } from '../types/medication';
import { getTokenExpirationTime } from '../utils/jwt';
import { Patient, CreatePatientForm, UpdatePatientForm } from '../types/patient';
import { Treatment, CreateTreatmentForm, UpdateTreatmentForm } from '../types/treatment';
import { User, CreateUserForm, UpdateUserForm } from '../types/user';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Use environment variable or fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ApiError extends Error {
  info?: any;
  status?: number;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getCookie('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Remove invalid token
      removeCookie('auth_token');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

const fetcher = async (url: string, options: RequestInit = {}) => {
  const token = getCookie('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.') as ApiError;
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }

  return response.json();
};

const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  revalidateOnMount: false,
  dedupingInterval: 5000,
};

// Auth hooks
export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      
      // Save token to localStorage and cookie
      if (data.token) {
        const expirationTime = getTokenExpirationTime(data.token);
        setCookie('auth_token', data.token, expirationTime);
        localStorage.setItem('token', data.token);
      }
      
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error logging in';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

// Treatment hooks
export const useTreatments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [treatmentOptions, setTreatmentOptions] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);

  // Get all treatments
  const getTreatments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/treatments');
      const data = response.data;
      setTreatments(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching treatments';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get treatment by id
  const getTreatmentById = async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/treatments/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching treatment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get treatment options (types of treatments available)
  const getTreatmentOptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/treatment-options');
      const data = response.data;
      setTreatmentOptions(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching treatment options';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get medications
  const getMedications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/medications');
      const data = response.data;
      setMedications(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching medications';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new treatment
  const createTreatment = async (treatmentData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/treatments', treatmentData);
      
      // Refresh treatments list
      await getTreatments();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error creating treatment';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new medication prescription
  const createMedication = async (medicationData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/prescriptions', medicationData);
      
      // Refresh medications list
      await getMedications();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error prescribing medication';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { 
    treatments, 
    treatmentOptions,
    medications,
    getTreatments,
    getTreatmentById,
    getTreatmentOptions,
    getMedications,
    createTreatment,
    createMedication,
    loading, 
    error
  };
};

// Treatment Options hooks
export const useTreatmentOptions = () => {
  return useSWR<TreatmentOption[]>('/treatments/options', fetcher, swrConfig);
};

// Medications hooks
export const useMedications = () => {
  return useSWR<Medication[]>('/treatments/medications', fetcher, swrConfig);
};

// Patient hooks
export const usePatients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);

  // Get all patients
  const getPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/patients');
      const data = response.data;
      setPatients(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching patients';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get patient by id
  const getPatientById = async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching patient';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new patient
  const createPatient = async (patientData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/patients', patientData);
      
      // Refresh patients list
      await getPatients();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error creating patient';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update existing patient
  const updatePatient = async (id: string | number, patientData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/patients/${id}`, patientData);
      
      // Refresh patients list
      await getPatients();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error updating patient';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete patient
  const deletePatient = async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/patients/${id}`);
      
      // Refresh patients list
      await getPatients();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error deleting patient';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { 
    patients, 
    getPatients, 
    getPatientById,
    createPatient, 
    updatePatient,
    deletePatient,
    loading, 
    error 
  };
};

export const usePatient = (id: string) => {
  return useSWR<Patient>(id ? `/patients/${id}` : null, fetcher, swrConfig);
};

export const usePatientMutations = () => {
  const { mutate } = useSWR('/patients', null, swrConfig);

  const createPatient = async (data: CreatePatientForm) => {
    try {
      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie('auth_token')}`,
        },
        body: JSON.stringify({
          name: data.name,
          patientId: data.patientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create patient');
      }

      const newPatient = await response.json();
      await mutate();
      return newPatient;
    } catch (error) {
      throw error;
    }
  };

  const updatePatient = async (data: UpdatePatientForm) => {
    try {
      const response = await fetch(`${API_URL}/patients/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getCookie('auth_token')}`,
        },
        body: JSON.stringify({
          name: data.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update patient');
      }

      const updatedPatient = await response.json();
      await mutate();
      return updatedPatient;
    } catch (error) {
      throw error;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getCookie('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete patient');
      }

      await mutate();
    } catch (error) {
      throw error;
    }
  };

  return { createPatient, updatePatient, deletePatient };
};

// User hooks
export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Get all users
  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/users');
      const data = response.data;
      setUsers(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching users';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get user by id
  const getUserById = async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create a new user
  const createUser = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/users', userData);
      
      // Refresh users list
      await getUsers();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error creating user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update existing user
  const updateUser = async (id: string | number, userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/users/${id}`, userData);
      
      // Refresh users list
      await getUsers();
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error updating user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id: string | number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/users/${id}`);
      
      // Refresh users list
      await getUsers();
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error deleting user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { 
    users, 
    getUsers, 
    getUserById,
    createUser, 
    updateUser,
    deleteUser,
    loading, 
    error 
  };
};

// Export a combined API hook
export const useAPI = () => {
  const login = useLogin();
  const treatments = useTreatments();
  const patients = usePatients();
  const users = useUsers();

  return {
    useLogin: () => login,
    useTreatments: () => treatments,
    usePatients: () => patients,
    useUsers: () => users,
  };
}; 