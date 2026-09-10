import {
  Address,
  Contact,
  CreditCardToken,
  Customer,
  CustomerEnquiry,
  TaxRegulatoryEntry
} from '../models/customer.model';

const now = new Date().toISOString();

function addr(
  id: string,
  type: Address['type'],
  line1: string,
  city: string,
  state: string,
  postal: string,
  line2 = '',
  validated = true
): Address {
  return {
    id,
    type,
    line1,
    line2: line2 || undefined,
    city,
    state,
    postal_code: postal,
    country: 'US',
    validated
  };
}

function phone(id: string, customerId: string, value: string, preferred = true): Contact {
  return {
    id,
    customer_id: customerId,
    type: 'mobile',
    value,
    preferred,
    verified: true
  };
}

function email(id: string, customerId: string, value: string): Contact {
  return {
    id,
    customer_id: customerId,
    type: 'email',
    value,
    preferred: true,
    verified: true
  };
}

const c1 = '200142074959';
const c2 = '200142075012';
const c3 = '200142075088';
const c4 = '200142075141';
const c5 = '200142075203';

const legal1 = addr('a-legal-1', 'legal', 'MCG', 'Atlanta', 'GA', '30303');
const primary1 = addr('a-pri-1', 'primary', '20 BRANDON TRCE', 'Atlanta', 'GA', '30328');
const legal2 = addr('a-legal-2', 'legal', 'str 1', 'Atlanta', 'GA', '30309');
const primary2 = addr('a-pri-2', 'primary', '665 ONEIDA DR', 'Atlanta', 'GA', '30327');
const legal3 = addr('a-legal-3', 'legal', 'MCG', 'Marietta', 'GA', '30060');
const primary3 = addr('a-pri-3', 'primary', '107 N 24TH ST', 'Marietta', 'GA', '30060');
const legal4 = addr('a-legal-4', 'legal', 'HQ', 'Decatur', 'GA', '30030');
const primary4 = addr('a-pri-4', 'primary', '412 WILLOW LN', 'Decatur', 'GA', '30030');
const legal5 = addr('a-legal-5', 'legal', 'MCG', 'Alpharetta', 'GA', '30009');
const primary5 = addr('a-pri-5', 'primary', '88 PINE CREST RD', 'Alpharetta', 'GA', '30009');

const cards: CreditCardToken[] = [
  {
    id: 'cc-1',
    brand: 'Visa',
    last4: '4242',
    exp_month: 8,
    exp_year: 2028,
    token_ref: 'tok_vault_9f2a1c',
    status: 'Active'
  }
];

const enquiry: CustomerEnquiry = {
  id: 'enq-1',
  customer_id: c1,
  source: 'Call Center',
  description: 'Confirm legal address change after relocation.',
  created_by: 'agent.morgan',
  status: 'In Progress',
  created_at: '2026-09-02T14:22:00.000Z'
};

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: c1,
    mdm_id: c1,
    party_status: '',
    party_lifecycle_status: 'PROSPECT',
    first_name: 'S',
    last_name: 'SMITH',
    tax_id_type: 'SSN',
    tax_id: '422605955',
    dob: '1946-11-02',
    legal_address_id: legal1.id,
    primary_address_id: primary1.id,
    addresses: [legal1, primary1],
    phones: [phone('p1', c1, '+1 404 555 0101')],
    emails: [email('e1', c1, 's.smith@example.com')],
    tax_entries: [
      {
        id: 't1',
        tax_type: 'SSN',
        tax_number: '422605955',
        country: 'US',
        valid_from: '1964-01-01',
        valid_to: null
      } as TaxRegulatoryEntry
    ],
    credit_cards: cards,
    enquiries: [enquiry],
    created_at: '2020-01-10T09:00:00.000Z',
    updated_at: now
  },
  {
    id: c2,
    mdm_id: c2,
    party_status: '',
    party_lifecycle_status: 'ACTIVE PARTY',
    first_name: 'AM',
    last_name: 'S SMITH',
    tax_id_type: 'SSN',
    tax_id: '318442177',
    dob: '1952-04-18',
    legal_address_id: legal2.id,
    primary_address_id: primary2.id,
    addresses: [legal2, primary2],
    phones: [phone('p2', c2, '+1 404 555 0102')],
    emails: [email('e2', c2, 'am.smith@example.com')],
    tax_entries: [],
    credit_cards: [],
    enquiries: [],
    created_at: '2019-06-01T09:00:00.000Z',
    updated_at: now
  },
  {
    id: c3,
    mdm_id: c3,
    party_status: '',
    party_lifecycle_status: 'FORMER PARTY',
    first_name: 'ADM',
    last_name: 'S SMITH',
    tax_id_type: 'SSN',
    tax_id: '509118223',
    dob: '1939-08-21',
    legal_address_id: legal3.id,
    primary_address_id: primary3.id,
    addresses: [legal3, primary3],
    phones: [phone('p3', c3, '+1 404 555 0103')],
    emails: [email('e3', c3, 'adm.smith@example.com')],
    tax_entries: [],
    credit_cards: [],
    enquiries: [],
    created_at: '2015-03-12T09:00:00.000Z',
    updated_at: now
  },
  {
    id: c4,
    mdm_id: c4,
    party_status: '',
    party_lifecycle_status: 'PROSPECT',
    first_name: 'S',
    last_name: 'SMITH',
    tax_id_type: 'SSN',
    tax_id: '277901445',
    dob: '1981-01-09',
    legal_address_id: legal4.id,
    primary_address_id: primary4.id,
    addresses: [legal4, primary4],
    phones: [phone('p4', c4, '+1 404 555 0104')],
    emails: [email('e4', c4, 's.smith2@example.com')],
    tax_entries: [],
    credit_cards: [],
    enquiries: [],
    created_at: '2024-11-01T09:00:00.000Z',
    updated_at: now
  },
  {
    id: c5,
    mdm_id: c5,
    party_status: '',
    party_lifecycle_status: 'ACTIVE PARTY',
    first_name: 'J',
    last_name: 'SMITH',
    tax_id_type: 'SSN',
    tax_id: '601223889',
    dob: '1974-12-30',
    legal_address_id: legal5.id,
    primary_address_id: primary5.id,
    addresses: [legal5, primary5],
    phones: [phone('p5', c5, '+1 404 555 0105')],
    emails: [email('e5', c5, 'j.smith@example.com')],
    tax_entries: [],
    credit_cards: [],
    enquiries: [],
    created_at: '2021-07-20T09:00:00.000Z',
    updated_at: now
  }
];
