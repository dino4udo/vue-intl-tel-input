import isPlainObject from 'lodash/isPlainObject';
import { Component, Mixins } from 'vue-property-decorator';

import { ICountry, DropdowPosition } from '@/components/models';
import Countries from '@/mixin/useCountries';

@Component
export default class Dropdown extends Mixins(Countries) {
    dropdownSearch = ''
    dropdownOpenDirection = 'is-bottom-right' as DropdowPosition
    activeCountry = {
        iso2: this.defaultCountry, // selected country object
    } as ICountry;

    public get fileredCountriesModel() {
        return this.sortedCountries.filter(option => [ option.name, option.dialCode, option.iso2, option.emoji.flag ].some(this.matchInputCountry));
    }

    private matchInputCountry(c = '') {
        return String.prototype.includes.call(c.toLowerCase(), this.dropdownSearch.toLowerCase());
    }

    public updatePreferredCountries(iso2 = '') {
        // Move countries, that has been selected to the top of the list
        // Like a recently chosen
        if (!this.preferredCountries.includes(iso2)) {
            this.preferredCountries.push(iso2);
        }

        return this.preferredCountries;
    }

    public setActiveCountry(country: ICountry | string) {
        if (!country) {
            return this.activeCountry;
        }
        if (typeof country !== 'string' && !isPlainObject(country)) {
            throw new TypeError(`Country argument has to be a string or an object. Got ${typeof country}`);
        }

        this.activeCountry = typeof country === 'string'
            ? this.getCountry(country)
            : country;

        this.updatePreferredCountries(this.activeCountry.iso2);

        return this.activeCountry;
    }

    public setDropdownPosition(el: HTMLElement, minOffset = 200) {
        const spaceBelow = window.innerHeight - el.getBoundingClientRect().bottom;
        const hasEnoughSpaceBelow = spaceBelow > minOffset;

        if (hasEnoughSpaceBelow) {
            this.dropdownOpenDirection = 'is-bottom-right';
        }
        else {
            this.dropdownOpenDirection = 'is-top-right';
        }

        return this.dropdownOpenDirection;
    }
}
