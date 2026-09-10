import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, delay, map, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Customer,
  CustomerEnquiry,
  CustomerSummary,
  EtlSaveResult
} from '../models/customer.model';
import { MOCK_CUSTOMERS } from './mock-customers';

@Injectable({ providedIn: 'root' })
export class CustomerEtlService {
  private readonly store = signal<Customer[]>(
    structuredClone(MOCK_CUSTOMERS)
  );

  readonly selectedCustomerId = signal<string | null>(MOCK_CUSTOMERS[0].id);
  readonly lastEtlMessage = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  listSummaries(): Observable<CustomerSummary[]> {
    if (!environment.useMockEtl) {
      return this.http.get<CustomerSummary[]>(`${environment.etlApiUrl}/customers`);
    }
    return of(this.toSummaries(this.store())).pipe(delay(180));
  }

  searchById(id: string): Observable<Customer | null> {
    const normalized = id.trim().toLowerCase();
    if (!normalized) {
      return of(null);
    }
    if (!environment.useMockEtl) {
      return this.http
        .get<Customer>(`${environment.etlApiUrl}/customers/${encodeURIComponent(id)}`)
        .pipe(catchError(() => of(null)));
    }
    const match = this.store().find(
      (c) =>
        c.id.toLowerCase() === normalized ||
        c.id.toLowerCase().includes(normalized) ||
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(normalized)
    );
    return of(match ?? null).pipe(delay(160));
  }

  getCustomer(id: string): Observable<Customer> {
    if (!environment.useMockEtl) {
      return this.http.get<Customer>(
        `${environment.etlApiUrl}/customers/${encodeURIComponent(id)}`
      );
    }
    const found = this.store().find((c) => c.id === id);
    return found
      ? of(structuredClone(found)).pipe(delay(120))
      : throwError(() => new Error('Customer not found'));
  }

  saveCustomer(customer: Customer): Observable<EtlSaveResult> {
    const payload = {
      ...customer,
      updated_at: new Date().toISOString()
    };

    if (!environment.useMockEtl) {
      return this.http
        .put<EtlSaveResult>(
          `${environment.etlApiUrl}/customers/${encodeURIComponent(customer.id)}`,
          payload
        )
        .pipe(tap((res) => this.lastEtlMessage.set(res.message)));
    }

    const next = this.store().map((c) => (c.id === payload.id ? payload : c));
    if (!next.some((c) => c.id === payload.id)) {
      next.push(payload);
    }
    this.store.set(next);
    const result: EtlSaveResult = {
      ok: true,
      customer_id: payload.id,
      event: 'customer.updated',
      message: 'Saved via mock ETL → MDM'
    };
    this.lastEtlMessage.set(result.message);
    return of(result).pipe(delay(220));
  }

  createCustomer(customer: Customer): Observable<EtlSaveResult> {
    const created: Customer = {
      ...customer,
      id: customer.id || crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!environment.useMockEtl) {
      return this.http
        .post<EtlSaveResult>(`${environment.etlApiUrl}/customers`, created)
        .pipe(tap((res) => this.lastEtlMessage.set(res.message)));
    }

    this.store.set([created, ...this.store()]);
    this.selectedCustomerId.set(created.id);
    const result: EtlSaveResult = {
      ok: true,
      customer_id: created.id,
      event: 'customer.created',
      message: 'Created via mock ETL → MDM (customer.created published)'
    };
    this.lastEtlMessage.set(result.message);
    return of(result).pipe(delay(280));
  }

  addEnquiry(
    customerId: string,
    enquiry: Omit<CustomerEnquiry, 'id' | 'customer_id' | 'created_at'>
  ): Observable<Customer> {
    return this.getCustomer(customerId).pipe(
      map((customer) => {
        const nextEnquiry: CustomerEnquiry = {
          ...enquiry,
          id: crypto.randomUUID(),
          customer_id: customerId,
          created_at: new Date().toISOString()
        };
        return {
          ...customer,
          enquiries: [nextEnquiry, ...customer.enquiries],
          updated_at: new Date().toISOString()
        };
      }),
      tap((updated) => {
        if (environment.useMockEtl) {
          this.store.set(
            this.store().map((c) => (c.id === updated.id ? updated : c))
          );
        }
      })
    );
  }

  selectCustomer(id: string | null): void {
    this.selectedCustomerId.set(id);
  }

  private toSummaries(customers: Customer[]): CustomerSummary[] {
    return customers.map((c) => ({
      id: c.id,
      full_name: `${c.first_name} ${c.last_name}`,
      party_lifecycle_status: c.party_lifecycle_status,
      primary_email: c.emails.find((e) => e.preferred)?.value ?? c.emails[0]?.value,
      primary_phone: c.phones.find((p) => p.preferred)?.value ?? c.phones[0]?.value,
      updated_at: c.updated_at
    }));
  }
}
