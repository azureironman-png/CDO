import { Component, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerEtlService } from '../services/customer-etl.service';

@Component({
  selector: 'cdo-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private readonly etl = inject(CustomerEtlService);
  private readonly snack = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly selectedId = this.etl.selectedCustomerId;
  readonly etlMessage = this.etl.lastEtlMessage;

  readonly customerNav = computed(() => {
    const id = this.selectedId();
    if (!id) {
      return [];
    }
    return [
      { label: 'Account Details', path: `/customers/${id}/account`, icon: 'badge' },
      { label: 'Addresses', path: `/customers/${id}/addresses`, icon: 'home_work' },
      { label: 'Contacts', path: `/customers/${id}/contacts`, icon: 'call' },
      { label: 'Tax & Regulatory', path: `/customers/${id}/tax`, icon: 'gavel' },
      { label: 'Credit Cards', path: `/customers/${id}/cards`, icon: 'credit_card' },
      { label: 'Customer Enquiry', path: `/customers/${id}/enquiry`, icon: 'forum' }
    ];
  });

  constructor() {
    effect(() => {
      const msg = this.etlMessage();
      if (msg) {
        this.snack.open(msg, 'Dismiss', { duration: 3200 });
        this.etl.lastEtlMessage.set(null);
      }
    });
  }

  createAccount(): void {
    void this.router.navigate(['/customers/new']);
  }
}
