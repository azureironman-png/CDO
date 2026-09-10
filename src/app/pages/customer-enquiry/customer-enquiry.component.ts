import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Customer, EnquiryStatus } from '../../models/customer.model';
import { CustomerEtlService } from '../../services/customer-etl.service';

@Component({
  selector: 'cdo-customer-enquiry',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './customer-enquiry.component.html',
  styleUrl: './customer-enquiry.component.scss'
})
export class CustomerEnquiryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly etl = inject(CustomerEtlService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly customer = signal<Customer | null>(null);

  readonly statuses: EnquiryStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];

  readonly form = this.fb.nonNullable.group({
    source: ['Portal', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    created_by: ['ui.analyst', Validators.required],
    status: ['Open' as EnquiryStatus, Validators.required]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.etl.selectCustomer(id);
    this.etl.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    const current = this.customer();
    if (!current || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.etl.addEnquiry(current.id, this.form.getRawValue()).subscribe({
      next: (updated) => {
        this.etl.saveCustomer(updated).subscribe({
          next: () => {
            this.customer.set(updated);
            this.form.reset({
              source: 'Portal',
              description: '',
              created_by: 'ui.analyst',
              status: 'Open'
            });
            this.saving.set(false);
          },
          error: () => this.saving.set(false)
        });
      },
      error: () => this.saving.set(false)
    });
  }
}
