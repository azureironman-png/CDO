import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Customer } from '../../models/customer.model';
import { CustomerEtlService } from '../../services/customer-etl.service';

@Component({
  selector: 'cdo-credit-cards',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './credit-cards.component.html',
  styleUrl: './credit-cards.component.scss'
})
export class CreditCardsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly etl = inject(CustomerEtlService);

  readonly loading = signal(true);
  readonly customer = signal<Customer | null>(null);

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
}
