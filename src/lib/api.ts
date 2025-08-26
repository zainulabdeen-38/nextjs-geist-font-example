const API_BASE_URL = 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic API call function
async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Patient API functions
export const patientApi = {
  getAll: () => apiCall<any[]>('/patients'),
  
  create: (patientData: any) => 
    apiCall<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    }),
  
  update: (id: number, patientData: any) =>
    apiCall<any>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    }),
  
  delete: (id: number) =>
    apiCall<any>(`/patients/${id}`, {
      method: 'DELETE',
    }),
};

// Appointment API functions
export const appointmentApi = {
  getAll: () => apiCall<any[]>('/appointments'),
  
  create: (appointmentData: any) =>
    apiCall<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),
  
  update: (id: number, appointmentData: any) =>
    apiCall<any>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    }),
  
  delete: (id: number) =>
    apiCall<any>(`/appointments/${id}`, {
      method: 'DELETE',
    }),
  
  confirm: (id: number) =>
    apiCall<any>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Confirmed' }),
    }),
  
  reschedule: (id: number, newDate: string, newTime: string) =>
    apiCall<any>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        appointment_date: newDate,
        appointment_time: newTime,
        status: 'Rescheduled'
      }),
    }),
};

// Billing API functions
export const billingApi = {
  getAll: () => apiCall<any[]>('/billing'),
  
  create: (billingData: any) =>
    apiCall<any>('/billing', {
      method: 'POST',
      body: JSON.stringify(billingData),
    }),
  
  update: (id: number, billingData: any) =>
    apiCall<any>(`/billing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(billingData),
    }),
};

// Reports API functions
export const reportsApi = {
  getAll: () => apiCall<any[]>('/reports'),
  
  create: (reportData: any) =>
    apiCall<any>('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),
  
  update: (id: number, reportData: any) =>
    apiCall<any>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    }),
};

// Prescriptions API functions
export const prescriptionsApi = {
  getAll: () => apiCall<any[]>('/prescriptions'),
  
  create: (prescriptionData: any) =>
    apiCall<any>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    }),
  
  update: (id: number, prescriptionData: any) =>
    apiCall<any>(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(prescriptionData),
    }),
};

// Analytics API functions
export const analyticsApi = {
  get: () => apiCall<any>('/analytics'),
};

// Notifications API functions
export const notificationsApi = {
  send: (message: string, phone: string, patientId?: number) =>
    apiCall<any>('/notify', {
      method: 'POST',
      body: JSON.stringify({
        message,
        phone,
        patient_id: patientId,
      }),
    }),
};

// Health check
export const healthCheck = () => apiCall<any>('/health');
