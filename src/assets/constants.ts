import PhoneNumber from 'awesome-phonenumber';

import { Possibility, CustomPossibility, ParseMode, PhoneNumberTypes } from '@/components/models';

export const PHONE_TYPE: PhoneNumberTypes[] = [
    'fixed-line',
    'mobile',
    'fixed-line-or-mobile',
    'toll-free',
    'premium-rate',
    'shared-cost',
    'voip',
    'personal-number',
    'pager',
    'uan',
    'unknown',
];

export const NUMBER: ParseMode[] = [
    // 'input',
    'international',
    'national',
    'e164',
    'rfc3966',
    'significant',
];

export const POSIBILITY: Possibility[] = [
    'unknown',
    'is-possible',
    'invalid-country-code',
    'too-long',
    'too-short',
];

// Test string for first '+' or first two '0's
export const INTL = new RegExp(/^(0{2}|\+)/);

export const VALID_CHAR = new RegExp(/^[\+]?[()\-\d\s]*$/);

export const SUPPORTED_ISO = PhoneNumber.getSupportedRegionCodes().reduce((a, c) => ({ ...a, [c]: c }), {} as Record<string, string>);

// TODO: use i18n later
export const VALIDATION_MESSAGES: Record<Possibility | CustomPossibility, string> = {
    // lib
    'unknown': 'Country is unknown',
    'invalid-country-code': 'Invalid country code',
    'too-long': 'Phone is too long',
    'too-short': 'Phone is too short',
    // custom
    'no-country-change': 'Country change is not allowed',
    'invalid-phone-type': 'Not permitted phone type',
    // default
    'is-possible': 'Phone is invalid',
};
