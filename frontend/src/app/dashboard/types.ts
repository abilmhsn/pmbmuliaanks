import React from 'react';

export type TabType = 'personal' | 'education' | 'program' | 'documents' | 'payment';

export interface PersonalFormData {
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  rt: string;
  rw: string;
  postalCode: string;
  district: string;
  subDistrict: string;
  city: string;
  province: string;
  phone: string;
}

export interface EducationFormData {
  schoolName: string;
  npsn: string;
  major: string;
  graduationYear: number;
}

export interface BankSettingsData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  registrationFee: number;
}

export interface StatusStep {
  key: string;
  label: string;
}

export interface TabDefinition {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface StudyProgram {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  publishedAt?: string;
  createdAt?: string;
}

export interface DocumentItem {
  id: string;
  type: string;
  fileName: string;
  fileUrl?: string;
  isVerified?: boolean;
}

export interface PaymentItem {
  id: string;
  paymentType?: string;
  amount: number;
  proofUrl?: string;
  status?: string;
}
