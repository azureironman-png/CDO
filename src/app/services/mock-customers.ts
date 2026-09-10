import {
  Address,
  Contact,
  CreditCardToken,
  Customer,
  CustomerEnquiry,
  TaxRegulatoryEntry
} from '../models/customer.model';

function uuid(seed: string): string {
  // Deterministic-looking demo IDs for stable UX in MVP stubs.
  return `00000000-0000-4000-8000-${seed.padStart(12, '0')}`;
}

const now = new Date().toISOString();

const addressesA: Address[] = [
  {
    id: uuid('a10000000001'),
    type: 'legal',
    line1: '1200 Market Street',
    line2: 'Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94102',
    country: 'US',
    validated: true
  },
  {
    id: uuid('a10000000002'),
    type: 'primary',
    line1: '88 Marina Blvd',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94123',
    country: 'US',
    validated: true
  }
];

const phonesA: Contact[] = [
  {
    id: uuid('c10000000001'),
    customer_id: uuid('custo0000001'),
    type: 'mobile',
    value: '+1 415 555 0142',
    preferred: true,
    verified: true
  },
  {
    id: uuid('c10000000002'),
    customer_id: uuid('custo0000001'),
    type: 'work',
    value: '+1 415 555 0198',
    preferred: false,
    verified: false
  }
];

const emailsA: Contact[] = [
  {
    id: uuid('c10000000003'),
    customer_id: uuid('custo0000001'),
    type: 'email',
    value: 'ava.chen@example.com',
    preferred: true,
    verified: true
  }
];

const taxA: TaxRegulatoryEntry[] = [
  {
    id: uuid('t10000000001'),
    tax_type: 'SSN',
    tax_number: '***-**-4281',
    country: 'US',
    valid_from: '2018-01-01',
    valid_to: null
  },
  {
    id: uuid('t10000000002'),
    tax_type: 'VAT',
    tax_number: 'EU-778812',
    country: 'DE',
    valid_from: '2022-06-15',
    valid_to: '2027-06-14'
  }
];

const cardsA: CreditCardToken[] = [
  {
    id: uuid('cc1000000001'),
    brand: 'Visa',
    last4: '4242',
    exp_month: 8,
    exp_year: 2028,
    token_ref: 'tok_vault_9f2a1c',
    status: 'Active'
  }
];

const enquiriesA: CustomerEnquiry[] = [
  {
    id: uuid('e10000000001'),
    customer_id: uuid('custo0000001'),
    source: 'Call Center',
    description: 'Confirm legal address change after relocation.',
    created_by: 'agent.morgan',
    status: 'In Progress',
    created_at: '2026-09-02T14:22:00.000Z'
  }
];

const customerA: Customer = {
  id: uuid('custo0000001'),
  party_lifecycle_status: 'Active',
  first_name: 'Ava',
  last_name: 'Chen',
  tax_id_type: 'SSN',
  tax_id: '***-**-4281',
  dob: '1991-04-18',
  legal_address_id: addressesA[0].id,
  primary_address_id: addressesA[1].id,
  addresses: addressesA,
  phones: phonesA,
  emails: emailsA,
  tax_entries: taxA,
  credit_cards: cardsA,
  enquiries: enquiriesA,
  created_at: '2024-11-12T09:00:00.000Z',
  updated_at: now
};

const customerB: Customer = {
  id: uuid('custo0000002'),
  party_lifecycle_status: 'Prospect',
  first_name: 'Noah',
  last_name: 'Patel',
  tax_id_type: 'EIN',
  tax_id: '12-3456789',
  dob: '1986-09-03',
  addresses: [
    {
      id: uuid('a20000000001'),
      type: 'primary',
      line1: '500 Peachtree Center Ave',
      city: 'Atlanta',
      state: 'GA',
      postal_code: '30303',
      country: 'US',
      validated: false
    }
  ],
  phones: [
    {
      id: uuid('c20000000001'),
      customer_id: uuid('custo0000002'),
      type: 'mobile',
      value: '+1 404 555 0177',
      preferred: true,
      verified: false
    }
  ],
  emails: [
    {
      id: uuid('c20000000002'),
      customer_id: uuid('custo0000002'),
      type: 'email',
      value: 'noah.patel@example.com',
      preferred: true,
      verified: true
    }
  ],
  tax_entries: [],
  credit_cards: [],
  enquiries: [],
  created_at: '2026-08-20T11:30:00.000Z',
  updated_at: '2026-09-01T16:45:00.000Z'
};

export const MOCK_CUSTOMERS: Customer[] = [customerA, customerB];
