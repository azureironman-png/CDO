import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Address, AddressType, Customer } from '../../models/customer.model';
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
    MatSelectModule,
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
  readonly saving = signal(false);
  readonly customer = signal<Customer | null>(null);
  readonly selectedIndex = signal(0);

  readonly types: AddressType[] = ['legal', 'primary', 'mailing'];

  readonly form = this.fb.nonNullable.group({
    type: ['primary' as AddressType, Validators.required],
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
        if (customer.addresses[0]) {
          this.loadAddress(customer.addresses[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onTabChange(index: number): void {
    this.selectedIndex.set(index);
    const address = this.customer()?.addresses[index];
    if (address) {
      this.loadAddress(address);
    }
  }

  validateAddress(): void {
    // Stub for Google/Loqate integration in later weeks.
    this.form.patchValue({ validated: true });
  }

  save(): void {
    const current = this.customer();
    if (!current || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const idx = this.selectedIndex();
    const existing = current.addresses[idx];
    const value = this.form.getRawValue();
    const updatedAddress: Address = {
      id: existing?.id ?? crypto.randomUUID(),
      ...value
    };
    const addresses = [...current.addresses];
    if (existing) {
      addresses[idx] = updatedAddress;
    } else {
      addresses.push(updatedAddress);
    }
    const payload: Customer = {
      ...current,
      addresses,
      legal_address_id:
        updatedAddress.type === 'legal' ? updatedAddress.id : current.legal_address_id,
      primary_address_id:
        updatedAddress.type === 'primary' ? updatedAddress.id : current.primary_address_id
    };
    this.etl.saveCustomer(payload).subscribe({
      next: () => {
        this.customer.set(payload);
        this.saving.set(false);
      },
      error: () => this.saving.set(false)
    });
  }

  private loadAddress(address: Address): void {
    this.form.patchValue(address);
  }
}
