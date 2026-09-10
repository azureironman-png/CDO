import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CustomerEtlService } from '../../services/customer-etl.service';
import { CustomerSummary } from '../../models/customer.model';

@Component({
  selector: 'cdo-customer-summary',
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
  readonly error = signal<string | null>(null);
  readonly panelOpen = signal(true);

  readonly searchForm = this.fb.nonNullable.group({
    query: ['']
  });

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
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
    const q = this.searchForm.controls.query.value.trim();
    if (!q) {
      this.loadAll();
      return;
    }
    this.searching.set(true);
    this.error.set(null);
    this.etl.searchById(q).subscribe({
      next: (customer) => {
        this.searching.set(false);
        if (!customer) {
          this.summaries.set([]);
          this.error.set('No customer found for that MDM ID or name.');
          return;
        }
        this.etl.listSummaries().subscribe((rows) => {
          this.summaries.set(rows.filter((r) => r.id === customer.id));
        });
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

  togglePanel(): void {
    this.panelOpen.update((v) => !v);
  }
}
