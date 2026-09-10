import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Contact, Customer } from '../../models/customer.model';
import { CustomerEtlService } from '../../services/customer-etl.service';

@Component({
  selector: 'cdo-contacts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly etl = inject(CustomerEtlService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly customer = signal<Customer | null>(null);

  readonly form = this.fb.nonNullable.group({
    phones: this.fb.nonNullable.array([this.phoneGroup()]),
    emails: this.fb.nonNullable.array([this.emailGroup()])
  });

  get phones(): FormArray {
    return this.form.controls.phones;
  }

  get emails(): FormArray {
    return this.form.controls.emails;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.etl.selectCustomer(id);
    this.etl.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.phones.clear();
        this.emails.clear();
        (customer.phones.length ? customer.phones : [this.emptyPhone(customer.id)]).forEach(
          (p) => this.phones.push(this.phoneGroup(p))
        );
        (customer.emails.length ? customer.emails : [this.emptyEmail(customer.id)]).forEach(
          (e) => this.emails.push(this.emailGroup(e))
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  addPhone(): void {
    const id = this.customer()?.id ?? '';
    this.phones.push(this.phoneGroup(this.emptyPhone(id)));
  }

  addEmail(): void {
    const id = this.customer()?.id ?? '';
    this.emails.push(this.emailGroup(this.emptyEmail(id)));
  }

  removePhone(index: number): void {
    if (this.phones.length > 1) {
      this.phones.removeAt(index);
    }
  }

  removeEmail(index: number): void {
    if (this.emails.length > 1) {
      this.emails.removeAt(index);
    }
  }

  save(): void {
    const current = this.customer();
    if (!current || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const payload: Customer = {
      ...current,
      phones: value.phones as Contact[],
      emails: value.emails as Contact[]
    };
    this.etl.saveCustomer(payload).subscribe({
      next: () => {
        this.customer.set(payload);
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  private phoneGroup(contact?: Contact) {
    return this.fb.nonNullable.group({
      id: [contact?.id ?? crypto.randomUUID()],
      customer_id: [contact?.customer_id ?? ''],
      type: [contact?.type ?? 'mobile', Validators.required],
      value: [
        contact?.value ?? '',
        [Validators.required, Validators.pattern(/^\+?[\d\s().-]{7,20}$/)]
      ],
      preferred: [contact?.preferred ?? false],
      verified: [contact?.verified ?? false]
    });
  }

  private emailGroup(contact?: Contact) {
    return this.fb.nonNullable.group({
      id: [contact?.id ?? crypto.randomUUID()],
      customer_id: [contact?.customer_id ?? ''],
      type: ['email' as const],
      value: [contact?.value ?? '', [Validators.required, Validators.email]],
      preferred: [contact?.preferred ?? false],
      verified: [contact?.verified ?? false]
    });
  }

  private emptyPhone(customerId: string): Contact {
    return {
      id: crypto.randomUUID(),
      customer_id: customerId,
      type: 'mobile',
      value: '',
      preferred: true,
      verified: false
    };
  }

  private emptyEmail(customerId: string): Contact {
    return {
      id: crypto.randomUUID(),
      customer_id: customerId,
      type: 'email',
      value: '',
      preferred: true,
      verified: false
    };
  }
}
