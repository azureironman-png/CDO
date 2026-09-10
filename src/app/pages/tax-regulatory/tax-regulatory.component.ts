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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Customer, TaxRegulatoryEntry } from '../../models/customer.model';
import { CustomerEtlService } from '../../services/customer-etl.service';

@Component({
  selector: 'cdo-tax-regulatory',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './tax-regulatory.component.html',
  styleUrl: './tax-regulatory.component.scss'
})
export class TaxRegulatoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly etl = inject(CustomerEtlService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly customer = signal<Customer | null>(null);

  readonly form = this.fb.nonNullable.group({
    entries: this.fb.nonNullable.array([this.entryGroup()])
  });

  get entries(): FormArray {
    return this.form.controls.entries;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.etl.selectCustomer(id);
    this.etl.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.entries.clear();
        (customer.tax_entries.length
          ? customer.tax_entries
          : [
              {
                id: crypto.randomUUID(),
                tax_type: '',
                tax_number: '',
                country: 'US',
                valid_from: '',
                valid_to: null
              } as TaxRegulatoryEntry
            ]
        ).forEach((e) => this.entries.push(this.entryGroup(e)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  addEntry(): void {
    this.entries.push(this.entryGroup());
  }

  removeEntry(index: number): void {
    if (this.entries.length > 1) {
      this.entries.removeAt(index);
    }
  }

  save(): void {
    const current = this.customer();
    if (!current || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload: Customer = {
      ...current,
      tax_entries: this.form.getRawValue().entries as TaxRegulatoryEntry[]
    };
    this.etl.saveCustomer(payload).subscribe({
      next: () => {
        this.customer.set(payload);
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  private entryGroup(entry?: TaxRegulatoryEntry) {
    return this.fb.nonNullable.group({
      id: [entry?.id ?? crypto.randomUUID()],
      tax_type: [entry?.tax_type ?? '', Validators.required],
      tax_number: [entry?.tax_number ?? '', Validators.required],
      country: [entry?.country ?? 'US', Validators.required],
      valid_from: [entry?.valid_from ?? '', Validators.required],
      valid_to: [entry?.valid_to ?? '']
    });
  }
}
