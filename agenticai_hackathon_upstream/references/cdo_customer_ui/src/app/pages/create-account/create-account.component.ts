import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Customer, PartyLifecycleStatus } from '../../models/customer.model';
import { CustomerEtlService } from '../../services/customer-etl.service';
import { minimumAgeValidator, taxIdValidator } from '../../services/validators';

@Component({
  selector: 'cdo-create-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})
export class CreateAccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly etl = inject(CustomerEtlService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly statuses: PartyLifecycleStatus[] = [
    'PROSPECT',
    'ACTIVE PARTY',
    'FORMER PARTY',
    'INACTIVE',
    'SUSPENDED'
  ];

  readonly partyForm = this.fb.nonNullable.group({
    first_name: ['', [Validators.required, Validators.maxLength(80)]],
    last_name: ['', [Validators.required, Validators.maxLength(80)]],
    party_lifecycle_status: ['PROSPECT' as PartyLifecycleStatus, Validators.required],
    dob: ['', [Validators.required, minimumAgeValidator(18)]],
    tax_id_type: ['SSN'],
    tax_id: ['', [taxIdValidator()]]
  });

  readonly addressForm = this.fb.nonNullable.group({
    line1: ['', Validators.required],
    line2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postal_code: ['', Validators.required],
    country: ['US', Validators.required],
    validated: [false]
  });

  readonly contactForm = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s().-]{7,20}$/)]],
    email: ['', [Validators.required, Validators.email]],
    phone_verified: [false],
    email_verified: [false]
  });

  readonly taxForm = this.fb.nonNullable.group({
    tax_type: ['SSN', Validators.required],
    tax_number: ['', Validators.required],
    country: ['US', Validators.required],
    valid_from: [new Date().toISOString().slice(0, 10), Validators.required]
  });

  submit(): void {
    if (
      this.partyForm.invalid ||
      this.addressForm.invalid ||
      this.contactForm.invalid ||
      this.taxForm.invalid
    ) {
      this.partyForm.markAllAsTouched();
      this.addressForm.markAllAsTouched();
      this.contactForm.markAllAsTouched();
      this.taxForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const party = this.partyForm.getRawValue();
    const address = this.addressForm.getRawValue();
    const contact = this.contactForm.getRawValue();
    const tax = this.taxForm.getRawValue();
    const customerId =
      crypto.randomUUID().replace(/\D/g, '').slice(0, 12).padStart(12, '2') ||
      Date.now().toString().slice(-12);
    const addressId = crypto.randomUUID();

    const payload: Customer = {
      id: customerId,
      mdm_id: customerId,
      party_status: '',
      party_lifecycle_status: party.party_lifecycle_status,
      first_name: party.first_name,
      last_name: party.last_name,
      tax_id_type: party.tax_id_type || undefined,
      tax_id: party.tax_id || undefined,
      dob: party.dob,
      legal_address_id: addressId,
      primary_address_id: addressId,
      addresses: [
        {
          id: addressId,
          type: 'primary',
          ...address
        },
        {
          id: crypto.randomUUID(),
          type: 'legal',
          ...address
        }
      ],
      phones: [
        {
          id: crypto.randomUUID(),
          customer_id: customerId,
          type: 'mobile',
          value: contact.phone,
          preferred: true,
          verified: contact.phone_verified
        }
      ],
      emails: [
        {
          id: crypto.randomUUID(),
          customer_id: customerId,
          type: 'email',
          value: contact.email,
          preferred: true,
          verified: contact.email_verified
        }
      ],
      tax_entries: [
        {
          id: crypto.randomUUID(),
          tax_type: tax.tax_type,
          tax_number: tax.tax_number,
          country: tax.country,
          valid_from: tax.valid_from,
          valid_to: null
        }
      ],
      credit_cards: [],
      enquiries: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.etl.createCustomer(payload).subscribe({
      next: (result) => {
        this.submitting.set(false);
        void this.router.navigate(['/customers', result.customer_id, 'account']);
      },
      error: () => this.submitting.set(false)
    });
  }
}
