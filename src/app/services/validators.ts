import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Customer must be at least 18 years old (offline DOB rule). */
export function minimumAgeValidator(minAge = 18): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) {
      return null;
    }
    const dob = new Date(value);
    if (Number.isNaN(dob.getTime())) {
      return { invalidDate: true };
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }
    return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
  };
}

export function taxIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string | null)?.trim();
    if (!value) {
      return null;
    }
    // Accept masked demo values and simple SSN/EIN-like patterns.
    const ok =
      /^\*{3}-\*{2}-\d{4}$/.test(value) ||
      /^\d{3}-\d{2}-\d{4}$/.test(value) ||
      /^\d{2}-\d{7}$/.test(value) ||
      /^[A-Z0-9-]{5,20}$/i.test(value);
    return ok ? null : { taxId: true };
  };
}
