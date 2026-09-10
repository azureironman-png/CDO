import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomerEtlService } from '../../services/customer-etl.service';
import { Customer, PartyLifecycleStatus } from '../../models/customer.model';
import { minimumAgeValidator, taxIdValidator } from '../../services/validators';

@Component({
  selector: 'cdo-account-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss'
})
export class AccountDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly etl = inject(CustomerEtlService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly customer = signal<Customer | null>(null);

  readonly statuses: PartyLifecycleStatus[] = [
    'PROSPECT',
    'ACTIVE PARTY',
    'FORMER PARTY',
    'INACTIVE',
    'SUSPENDED'
  ];

  readonly form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(80)]],
    last_name: ['', [Validators.required, Validators.maxLength(80)]],
    party_lifecycle_status: ['PROSPECT' as PartyLifecycleStatus, Validators.required],
    tax_id_type: [''],
    tax_id: ['', [taxIdValidator()]],
    dob: ['', [minimumAgeValidator(18)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.etl.selectCustomer(id);
    this.etl.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.form.patchValue({
          first_name: customer.first_name,
          last_name: customer.last_name,
          party_lifecycle_status: customer.party_lifecycle_status,
          tax_id_type: customer.tax_id_type ?? '',
          tax_id: customer.tax_id ?? '',
          dob: customer.dob ?? ''
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
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
      ...value,
      tax_id_type: value.tax_id_type || undefined,
      tax_id: value.tax_id || undefined,
      dob: value.dob || undefined
    };
    this.etl.saveCustomer(payload).subscribe({
      next: () => {
        this.customer.set(payload);
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }
}
