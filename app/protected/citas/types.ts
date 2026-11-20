export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "canceled"
  | "no_show";

export interface PersonRecord {
  first_name: string;
  last_name: string;
  phone?: string | null;
}

export interface CustomerRelation {
  id: string;
  people: PersonRecord | null;
}

export interface ServiceRelation {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

export interface EmployeeRelation {
  id: string;
  people: Pick<PersonRecord, "first_name" | "last_name"> | null;
}

export interface AppointmentRecord {
  id: string;
  organization_id: string;
  customer_id: string;
  employee_id: string | null;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
  customers: CustomerRelation | null;
  services: ServiceRelation | null;
  employees: EmployeeRelation | null;
}

export interface CustomerOption {
  id: string;
  name: string;
  phone?: string | null;
}

export interface ServiceOption {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
}

export interface EmployeeOption {
  id: string;
  name: string;
}

export interface CitasFormOptions {
  customers: CustomerOption[];
  services: ServiceOption[];
  employees: EmployeeOption[];
}

export interface CreateAppointmentInput {
  customer_id: string;
  service_id: string;
  employee_id?: string | null;
  starts_at: string;
  ends_at: string;
  notes?: string | null;
  status?: AppointmentStatus;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
