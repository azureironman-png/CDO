import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Address, Customer } from '../../models/customer.model';
import { CustomerEtlService } from '../../services/customer-etl.service';

@Component({
  selector: 'cdo-addresses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss'
})
export class AddressesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly etl = inject(CustomerEtlService);

  readonly loading = signal(true);
  readonly savingLegal = signal(false);
  readonly savingPrimary = signal(false);
  readonly customer = signal<Customer | null>(null);

  readonly legalForm = this.fb.nonNullable.group({
    line1: ['', Validators.required],
    line2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postal_code: ['', Validators.required],
    country: ['US', Validators.required],
    validated: [false]
  });

  readonly primaryForm = this.fb.nonNullable.group({
    line1: ['', Validators.required],
    line2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postal_code: ['', Validators.required],
    country: ['US', Validators.required],
    validated: [false]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.etl.selectCustomer(id);
    this.etl.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.patchForms(customer);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  validateLegal(): void {
    this.legalForm.patchValue({ validated: true });
  }

  validatePrimary(): void {
    this.primaryForm.patchValue({ validated: true });
  }

  saveLegal(): void {
    this.saveAddress('legal', this.legalForm, this.savingLegal);
  }

  savePrimary(): void {
    this.saveAddress('primary', this.primaryForm, this.savingPrimary);
  }

  private saveAddress(
    type: 'legal' | 'primary',
    form: typeof this.legalForm,
    saving: ReturnType<typeof signal<boolean>>
  ): void {
    const current = this.customer();
    if (!current || form.invalid) {
      form.markAllAsTouched();
      return;
    }
    saving.set(true);
    const existing = current.addresses.find((a) => a.type === type);
    const value = form.getRawValue();
    const updated: Address = {
      id: existing?.id ?? crypto.randomUUID(),
      type,
      ...value
    };
    const addresses = [
      ...current.addresses.filter((a) => a.type !== type),
      updated
    ];
    const payload: Customer = {
      ...current,
      addresses,
      legal_address_id: type === 'legal' ? updated.id : current.legal_address_id,
      primary_address_id: type === 'primary' ? updated.id : current.primary_address_id
    };
    this.etl.saveCustomer(payload).subscribe({
      next: () => {
        this.customer.set(payload);
        this.patchForms(payload);
        saving.set(false);
      },
      error: () => saving.set(false)
    });
  }

  private patchForms(customer: Customer): void {
    const legal = customer.addresses.find((a) => a.type === 'legal');
    const primary = customer.addresses.find((a) => a.type === 'primary');
    if (legal) {
      this.legalForm.patchValue(legal);
    }
    if (primary) {
      this.primaryForm.patchValue(primary);
    }
  }
}
