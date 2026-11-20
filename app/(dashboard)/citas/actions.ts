"use server";

import {
  getAppointments as originalGetAppointments,
  getCitasFormOptions as originalGetCitasFormOptions,
  createAppointment as originalCreateAppointment,
  updateAppointmentStatus as originalUpdateAppointmentStatus,
} from "@/app/protected/citas/actions";
import {
  type AppointmentStatus,
  type CreateAppointmentInput,
} from "./types";

export async function getAppointments(orgId: string) {
  return originalGetAppointments(orgId);
}

export async function getCitasFormOptions(orgId: string) {
  return originalGetCitasFormOptions(orgId);
}

export async function createAppointment(
  input: CreateAppointmentInput | FormData,
  orgId: string,
) {
  return originalCreateAppointment(input, orgId);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
  orgId?: string,
) {
  return originalUpdateAppointmentStatus(id, status, orgId);
}
