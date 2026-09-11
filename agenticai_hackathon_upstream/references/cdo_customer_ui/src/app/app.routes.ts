import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'customers'
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./pages/customer-summary/customer-summary.component').then(
            (m) => m.CustomerSummaryComponent
          )
      },
      {
        path: 'customers/new',
        loadComponent: () =>
          import('./pages/create-account/create-account.component').then(
            (m) => m.CreateAccountComponent
          )
      },
      {
        path: 'customers/:id/account',
        loadComponent: () =>
          import('./pages/account-details/account-details.component').then(
            (m) => m.AccountDetailsComponent
          )
      },
      {
        path: 'customers/:id/addresses',
        loadComponent: () =>
          import('./pages/addresses/addresses.component').then(
            (m) => m.AddressesComponent
          )
      },
      {
        path: 'customers/:id/contacts',
        loadComponent: () =>
          import('./pages/contacts/contacts.component').then(
            (m) => m.ContactsComponent
          )
      },
      {
        path: 'customers/:id/tax',
        loadComponent: () =>
          import('./pages/tax-regulatory/tax-regulatory.component').then(
            (m) => m.TaxRegulatoryComponent
          )
      },
      {
        path: 'customers/:id/cards',
        loadComponent: () =>
          import('./pages/credit-cards/credit-cards.component').then(
            (m) => m.CreditCardsComponent
          )
      },
      {
        path: 'customers/:id/enquiry',
        loadComponent: () =>
          import('./pages/customer-enquiry/customer-enquiry.component').then(
            (m) => m.CustomerEnquiryComponent
          )
      }
    ]
  },
  { path: '**', redirectTo: 'customers' }
];
