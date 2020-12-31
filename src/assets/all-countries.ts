// Array of country objects for the flag dropdown.

// Here is the criteria for the plugin to support a given country/territory
// - It has an iso2 code: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
// - It has it's own country calling code (it is not a sub-region of another country): https://en.wikipedia.org/wiki/List_of_country_calling_codes
// - It has a flag in the region-flags project: https://github.com/behdad/region-flags/tree/gh-pages/png
// - It is supported by libphonenumber (it must be listed on this page): https://github.com/googlei18n/libphonenumber/blob/master/resources/ShortNumberMetadata.xml

import { ICountry } from '@/components/models';
import { isEmojiUnicodeSupported, isoToEmoji } from '@/utils/emoji';

import _countries from './countries.json';

const countries: Map<string, ICountry> = new Map();
// const countriesIso: Set<string> = new Set();

// loop over all of the countries above, restructuring the data to be objects with named keys
for (let i = 0; i < _countries.length; i++) {
    const names = String(_countries[i][0]).split(/([\\(||//)])/g);
    const iso2 = String(_countries[i][1]).toUpperCase();

    const countryDict: ICountry = {
        name: [].concat(names).join(''), // _countries[i][0], // Country name,
        name_en: names[0],
        name_local: names[2],
        iso2, // iso2 code,
        dialCode: String(_countries[i][2]), // International dial code,
        priority: Number(_countries[i][3]) || 0, // Order (if >1 country with same dial code),
        areaCodes: _countries[i][4] || null, // Area codes
        emoji: {
            flag: isoToEmoji(iso2),
            supported: isEmojiUnicodeSupported(iso2),
        },
    };

    // countriesIso.add(iso2);
    countries.set(iso2, countryDict);
}

export {
    // countriesIso,
    countries,
};
