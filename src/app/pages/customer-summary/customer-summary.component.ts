import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomerEtlService } from '../../services/customer-etl.service';
import { Customer, CustomerSummary } from '../../models/customer.model';

@Component({
  selector: 'cdo-customer-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './customer-summary.component.html',
  styleUrl: './customer-summary.component.scss'
})
export class CustomerSummaryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly etl = inject(CustomerEtlService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly searching = signal(false);
  readonly summaries = signal<CustomerSummary[]>([]);
  readonly match = signal<Customer | null>(null);
  readonly error = signal<string | null>(null);

  readonly searchForm = this.fb.nonNullable.group({
    query: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit(): void {
    this.loading.set(true);
    this.etl.listSummaries().subscribe({
      next: (rows) => {
        this.summaries.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Unable to load customers from ETL.');
        this.loading.set(false);
      }
    });
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.searching.set(true);
    this.error.set(null);
    this.etl.searchById(this.searchForm.controls.query.value).subscribe({
      next: (customer) => {
        this.match.set(customer);
        this.searching.set(false);
        if (!customer) {
          this.error.set('No customer found for that ID or name.');
        }
      },
      error: () => {
        this.searching.set(false);
        this.error.set('Search failed talking to ETL.');
      }
    });
  }

  openCustomer(id: string): void {
    this.etl.selectCustomer(id);
    void this.router.navigate(['/customers', id, 'account']);
  }
}
