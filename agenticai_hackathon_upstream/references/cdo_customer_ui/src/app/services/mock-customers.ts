import {
  Address,
  Contact,
  CreditCardToken,
  Customer,
  CustomerEnquiry,
  PartyLifecycleStatus,
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

function phone(
  id: string,
  customerId: string,
  value: string,
  preferred = true,
  type: Contact['type'] = 'mobile',
  verified = true
): Contact {
  return { id, customer_id: customerId, type, value, preferred, verified };
}

function emailContact(id: string, customerId: string, value: string): Contact {
  return {
    id,
    customer_id: customerId,
    type: 'email',
    value,
    preferred: true,
    verified: true
  };
}

interface Seed {
  mdm_id: string;
  first_name: string;
  last_name: string;
  party_lifecycle_status: PartyLifecycleStatus;
  tax_id_type: string;
  tax_id: string;
  dob: string;
  legal?: [string, string, string, string, string?];
  primary: [string, string, string, string, string?];
  phone: string;
  email: string;
  otherAddress?: boolean;
  hasCard?: boolean;
  hasEnquiry?: boolean;
  taxExtra?: boolean;
  created_at: string;
}

function buildCustomer(seed: Seed): Customer {
  const id = seed.mdm_id;
  const legal = seed.legal
    ? addr(
        `a-legal-${id}`,
        'legal',
        seed.legal[0],
        seed.legal[1],
        seed.legal[2],
        seed.legal[3],
        seed.legal[4] || ''
      )
    : undefined;
  const primary = addr(
    `a-pri-${id}`,
    'primary',
    seed.primary[0],
    seed.primary[1],
    seed.primary[2],
    seed.primary[3],
    seed.primary[4] || '',
    true
  );
  const mailing = seed.otherAddress
    ? addr(`a-mail-${id}`, 'mailing', 'PO BOX 1200', primary.city, primary.state, primary.postal_code)
    : undefined;

  const addresses = [legal, primary, mailing].filter(Boolean) as Address[];
  const tax_entries: TaxRegulatoryEntry[] = [
    {
      id: `t-${id}`,
      tax_type: seed.tax_id_type,
      tax_number: seed.tax_id,
      country: 'US',
      valid_from: '2010-01-01',
      valid_to: null
    }
  ];
  if (seed.taxExtra) {
    tax_entries.push({
      id: `t2-${id}`,
      tax_type: 'VAT',
      tax_number: `EU-${id.slice(-6)}`,
      country: 'DE',
      valid_from: '2022-06-15',
      valid_to: '2027-06-14'
    });
  }

  const credit_cards: CreditCardToken[] = seed.hasCard
    ? [
        {
          id: `cc-${id}`,
          brand: Number(id) % 2 === 0 ? 'Mastercard' : 'Visa',
          last4: id.slice(-4),
          exp_month: 8,
          exp_year: 2028,
          token_ref: `tok_vault_${id.slice(-6)}`,
          status: 'Active'
        }
      ]
    : [];

  const enquiries: CustomerEnquiry[] = seed.hasEnquiry
    ? [
        {
          id: `enq-${id}`,
          customer_id: id,
          source: 'Call Center',
          description: 'Customer requested verification of mailing address and tax profile.',
          created_by: 'agent.morgan',
          status: 'In Progress',
          created_at: '2026-09-02T14:22:00.000Z'
        }
      ]
    : [];

  return {
    id,
    mdm_id: id,
    party_status: '',
    party_lifecycle_status: seed.party_lifecycle_status,
    first_name: seed.first_name,
    last_name: seed.last_name,
    tax_id_type: seed.tax_id_type,
    tax_id: seed.tax_id,
    dob: seed.dob,
    legal_address_id: legal?.id,
    primary_address_id: primary.id,
    addresses,
    phones: [phone(`p-${id}`, id, seed.phone)],
    emails: [emailContact(`e-${id}`, id, seed.email)],
    tax_entries,
    credit_cards,
    enquiries,
    created_at: seed.created_at,
    updated_at: now
  };
}

const SEEDS: Seed[] = [
  {
    mdm_id: '200142074959',
    first_name: 'S',
    last_name: 'SMITH',
    party_lifecycle_status: 'PROSPECT',
    tax_id_type: 'SSN',
    tax_id: '422605955',
    dob: '1946-11-02',
    legal: ['MCG', 'Atlanta', 'GA', '30303'],
    primary: ['20 BRANDON TRCE', 'Atlanta', 'GA', '30328'],
    phone: '+1 404 555 0101',
    email: 's.smith@example.com',
    hasCard: true,
    hasEnquiry: true,
    created_at: '2020-01-10T09:00:00.000Z'
  },
  {
    mdm_id: '200142075012',
    first_name: 'AM',
    last_name: 'S SMITH',
    party_lifecycle_status: 'ACTIVE PARTY',
    tax_id_type: 'SSN',
    tax_id: '318442177',
    dob: '1952-04-18',
    legal: ['str 1', 'Atlanta', 'GA', '30309'],
    primary: ['665 ONEIDA DR', 'Atlanta', 'GA', '30327'],
    phone: '+1 404 555 0102',
    email: 'am.smith@example.com',
    created_at: '2019-06-01T09:00:00.000Z'
  },
  {
    mdm_id: '200142075088',
    first_name: 'ADM',
    last_name: 'S SMITH',
    party_lifecycle_status: 'FORMER PARTY',
    tax_id_type: 'SSN',
    tax_id: '509118223',
    dob: '1939-08-21',
    legal: ['MCG', 'Marietta', 'GA', '30060'],
    primary: ['107 N 24TH ST', 'Marietta', 'GA', '30060'],
    phone: '+1 404 555 0103',
    email: 'adm.smith@example.com',
    created_at: '2015-03-12T09:00:00.000Z'
  },
  {
    mdm_id: '200142075141',
    first_name: 'S',
    last_name: 'SMITH',
    party_lifecycle_status: 'PROSPECT',
    tax_id_type: 'SSN',
    tax_id: '277901445',
    dob: '1981-01-09',
    legal: ['HQ', 'Decatur', 'GA', '30030'],
    primary: ['412 WILLOW LN', 'Decatur', 'GA', '30030'],
    phone: '+1 404 555 0104',
    email: 's.smith2@example.com',
    created_at: '2024-11-01T09:00:00.000Z'
  },
  {
    mdm_id: '200142075203',
    first_name: 'J',
    last_name: 'SMITH',
    party_lifecycle_status: 'ACTIVE PARTY',
    tax_id_type: 'SSN',
    tax_id: '601223889',
    dob: '1974-12-30',
    legal: ['MCG', 'Alpharetta', 'GA', '30009'],
    primary: ['88 PINE CREST RD', 'Alpharetta', 'GA', '30009'],
    phone: '+1 404 555 0105',
    email: 'j.smith@example.com',
    otherAddress: true,
    created_at: '2021-07-20T09:00:00.000Z'
  },
  {
    mdm_id: '200142080001',
    first_name: 'Ava',
    last_name: 'Chen',
    party_lifecycle_status: 'ACTIVE PARTY',
    tax_id_type: 'SSN',
    tax_id: '428119933',
    dob: '1991-04-18',
    legal: ['1200 Market Street', 'San Francisco', 'CA', '94102', 'Suite 400'],
    primary: ['88 Marina Blvd', 'San Francisco', 'CA', '94123'],
    phone: '+1 415 555 0142',
    email: 'ava.chen@example.com',
    hasCard: true,
    hasEnquiry: true,
    taxExtra: true,
    created_at: '2024-11-12T09:00:00.000Z'
  },
  {
    mdm_id: '200142080002',
    first_name: 'Noah',
    last_name: 'Patel',
    party_lifecycle_status: 'PROSPECT',
    tax_id_type: 'EIN',
    tax_id: '12-3456789',
    dob: '1986-09-03',
    primary: ['500 Peachtree Center Ave', 'Atlanta', 'GA', '30303'],
    phone: '+1 404 555 0177',
    email: 'noah.patel@example.com',
    created_at: '2026-08-20T11:30:00.000Z'
  },
  {
    mdm_id: '200142080114',
    first_name: 'Mia',
    last_name: 'Johnson',
    party_lifecycle_status: 'ACTIVE PARTY',
    tax_id_type: 'SSN',
    tax_id: '334908221',
    dob: '1988-03-14',
    legal: ['LEGAL HQ', 'Austin', 'TX', '78701'],
    primary: ['901 CONGRESS AVE', 'Austin', 'TX', '78701'],
    phone: '+1 512 555 0188',
    email: 'mia.johnson@example.com',
    hasCard: true,
    created_at: '2022-02-11T10:00:00.000Z'
  },
  {
    mdm_id: '200142080225',
    first_name: 'Liam',
    last_name: 'Garcia',
    party_lifecycle_status: 'PROSPECT',
    tax_id_type: 'SSN',
    tax_id: '719334006',
    dob: '1995-07-22',
    legal: ['MCG', 'Dallas', 'TX', '75201'],
    primary: ['2200 ROSS AVE', 'Dallas', 'TX', '75201'],
    phone: '+1 214 555 0191',
    email: 'liam.garcia@example.com',
    created_at: '2025-01-08T15:20:00.000Z'
  },
  {
    mdm_id: '200142080336',
    first_name: 'Sophia',
    last_name: 'Nguyen',
    party_lifecycle_status: 'ACTIVE PARTY',
    tax_id_type: 'SSN',
    tax_id: '558201774',
    dob: '1979-10-05',
    legal: ['CORP', 'Seattle', 'WA', '98101'],
    primary: ['1201 3RD AVE', 'Seattle', 'WA', '98101'],
    phone: '+1 206 555 0120',
    email: 'sophia.nguyen@example.com',
    otherAddress: true,
    hasEnquiry: true,
    created_at: '2018-09-19T08:45:00.000Z'
  },
  {
    mdm_id: '200142080447',
    first_name: 'Ethan',
    last_name: 'Brooks',
    party_lifecycle_status: 'INACTIVE',
    tax_id_type: 'SSN',
    tax_id: '401882339',
    dob: '1968-01-28',
    legal: ['OLD LEGAL', 'Chicago', 'IL', '60601'],
    primary: ['233 S WACKER DR', 'Chicago', 'IL', '60606'],
    phone: '+1 312 555 0144',
    email: 'ethan.brooks@example.com',
    created_at: '2016-04-02T12:00:00.000Z'
  },
  {
    mdm_id: '200142080558',
    first_name: 'Isabella',
    last_name: 'Martinez',
    party_lifecycle_status: 'ACTIVE PARTY',
    tax_id_type: 'SSN',
    tax_id: '290441568',
    dob: '1993-06-11',
    legal: ['MCG', 'Miami', 'FL', '33130'],
    primary: ['100 S BISCAYNE BLVD', 'Miami', 'FL', '33131'],
    phone: '+1 305 555 0166',
    email: 'isabella.martinez@example.com',
    hasCard: true,
    created_at: '2023-05-17T09:30:00.000Z'
  },
  {
    mdm_id: '200142080669',
    first_name: 'Oliver',
    last_name: 'Wright',
    party_lifecycle_status: 'FORMER PARTY',
    tax_id_type: 'SSN',
    tax_id: '667120984',
    dob: '1955-09-19',
    legal: ['CLOSED', 'Denver', 'CO', '80202'],
    primary: ['1700 LINCOLN ST', 'Denver', 'CO', '80203'],
    phone: '+1 303 555 0175',
    email: 'oliver.wright@example.com',
    created_at: '2014-12-01T11:00:00.000Z'
  },
  {
    mdm_id: '200142080770',
    first_name: 'Amelia',
    last_name: 'Khan',
    party_lifecycle_status: 'PROSPECT',
    tax_id_type: 'SSN',
    tax_id: '183557042',
    dob: '1998-02-07',
    legal: ['NEW PARTY', 'Boston', 'MA', '02108'],
    primary: ['1 BEACON ST', 'Boston', 'MA', '02108'],
    phone: '+1 617 555 0182',
    email: 'amelia.khan@example.com',
    created_at: '2026-03-03T14:10:00.000Z'
  },
  {
    mdm_id: '200142080881',
    first_name: 'James',
    last_name: 'Okoye',
    party_lifecycle_status: 'ACTIVE PARTY',
    tax_id_type: 'SSN',
    tax_id: '744201159',
    dob: '1982-11-30',
    legal: ['HQ EAST', 'New York', 'NY', '10005'],
    primary: ['55 WATER ST', 'New York', 'NY', '10041'],
    phone: '+1 212 555 0199',
    email: 'james.okoye@example.com',
    otherAddress: true,
    hasCard: true,
    hasEnquiry: true,
    taxExtra: true,
    created_at: '2017-08-25T16:40:00.000Z'
  }
];

export const MOCK_CUSTOMERS: Customer[] = SEEDS.map(buildCustomer);
