export type PartyLifecycleStatus =
  | 'Prospect'
  | 'Active'
  | 'Inactive'
  | 'Suspended'
  | 'Closed';

export type AddressType = 'legal' | 'primary' | 'mailing';
export type ContactChannelType = 'mobile' | 'home' | 'work' | 'email';
export type EnquiryStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface Address {
  id: string;
  type: AddressType;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  validated: boolean;
}

export interface Contact {
  id: string;
  customer_id: string;
  type: ContactChannelType;
  value: string;
  preferred: boolean;
  verified: boolean;
}

export interface TaxRegulatoryEntry {
  id: string;
  tax_type: string;
  tax_number: string;
  country: string;
  valid_from: string;
  valid_to?: string | null;
}

export interface CreditCardToken {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  token_ref: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

export interface CustomerEnquiry {
  id: string;
  customer_id: string;
  source: string;
  description: string;
  created_by: string;
  status: EnquiryStatus;
  created_at: string;
}

export interface Customer {
  id: string;
  party_lifecycle_status: PartyLifecycleStatus;
  first_name: string;
  last_name: string;
  tax_id_type?: string;
  tax_id?: string;
  dob?: string;
  legal_address_id?: string;
  primary_address_id?: string;
  addresses: Address[];
  phones: Contact[];
  emails: Contact[];
  tax_entries: TaxRegulatoryEntry[];
  credit_cards: CreditCardToken[];
  enquiries: CustomerEnquiry[];
  created_at: string;
  updated_at: string;
}

export interface CustomerSummary {
  id: string;
  full_name: string;
  party_lifecycle_status: PartyLifecycleStatus;
  primary_email?: string;
  primary_phone?: string;
  updated_at: string;
}

export interface EtlSaveResult {
  ok: boolean;
  customer_id: string;
  event?: string;
  message: string;
}
