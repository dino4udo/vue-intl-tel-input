import PhoneNumber from 'awesome-phonenumber';
import { Component, Mixins, Watch } from 'vue-property-decorator';

import { INTL, VALID_CHAR } from '@/assets/constants';
import Dropdown from '@/mixin/useDropdown';
import { isDefined } from '@/utils/';

import { IPhoneObject, INumber, ParseMode } from '../components/types';

@Component
export default class Input extends Mixins(Dropdown) {
    public cursorPosition = 0;

    public get phoneValue(): string {
        return String(this.phone).trim();
    }

    public set phoneValue(v) {
        /**
         * Returns response.number to assign it to v-model (if being used)
         * Returns full response for cases @input is used
         * and parent wants to return the whole response.
         */
        this.$emit('update:phone', v, this.phoneData);
    }
    // end V-MODEL

    /**
     * NOTE: awesome-phonenumber has odd behaviour
     * if you type number like 00380 (which is also an international input)
     * number.international shows correct parse phone - +38097
     * but regionCode satays as previous country
     * hence we need to replace all possible variations to +
     */
    public get regionCode(): string {
        const { international = '' } = this.phoneData.number;

        /**
         * Readon for fallback to the regionCode
         * is that parsed 'number' object comes later
         * then detection of the region code
         */
        return PhoneNumber.call(null, international).getRegionCode() || this.phoneData.regionCode;
    }

    public get newPlaceholder(): string {
        if (this.dynamicPlaceholder && this.activeCountry.iso2) {
            const mode: ParseMode = this.mode || 'national';

            return PhoneNumber.getExample(this.activeCountry.iso2, this.placeholderNumberType).getNumber(mode);
        }

        return this.inputPlaceholder;
    }

    public get newMode(): keyof INumber {
        if (this.customRegexp) {
            return 'input';
        }

        if (this.mode) {
            // TODO: have mode validator. revisit later
            if (![ 'international', 'national' ].includes(this.mode)) {
                console.error('Invalid value of prop "mode"');
            }
            else {
                return this.mode;
            }
        }

        if (!this.phoneValue || !this.phoneData.isIntlInput) {
            return 'national';
        }

        return 'international';
    }

    public get formattedPhone(): string {
        let key: keyof INumber = 'input';

        if (this.automaticFormatting && this.phoneData.valid) {
            key = this.newMode;
        }

        return this.phoneData.number[key] || this.phoneValue;
    }

    public get phoneData(): IPhoneObject {
        const parserPhone = new PhoneNumber(this.phoneValue, this.activeCountry.iso2).toJSON();

        return {
            ...parserPhone,
            isIntlInput: this.testInternational(this.phoneValue),
            country: this.activeCountry,
        };
    }

    @Watch('phoneValue', { immediate: true })
    onPhoneChanged(p: string, valuePrev: string) {
        if (isDefined(p) && p !== '') {
            /**
             * Sanitizing input if validCharactersOnly id on
             * NOTE: has to be { immediate: true } in order this to work with v-model
             */
            if (this.validCharactersOnly && !this.testCharacters()) {
                p = this.normalizeInput(p);

                this.$nextTick(() => {
                    this.phoneValue = p;
                });
            }

            // Reset the cursor to current position if it's not the last character.
            // if (this.cursorPosition < oldValue.length) {
            //     this.$nextTick(() => {
            //         // TODO: check for correct refs
            //         setCaretPosition(this.$refs.refPhoneInput.$refs.input, this.cursorPosition);
            //     });
            // }
        }
    }

    @Watch('regionCode', { immediate: false })
    onRegionCode(iso2: string, o: string) {
        if (!this.disabledDropdown && iso2 !== this.activeCountry.iso2) { // iso comparsion prevent multiple events firing
            this.setActiveCountry(iso2);

            /**
             * In case user start input with +, format it base on this.mode
             */
            this.phoneValue = this.formattedPhone;
        }
    }

    public testCharacters(p = this.phoneValue): boolean {
        return VALID_CHAR.test(p);
    }

    public normalizeInput(p = this.phoneValue): string {
        return p.replace(/[^()\-\+\d\s]+/gi, '');
    }

    public testInternational(p = this.phoneValue): boolean {
        return INTL.test(p);
    }

    public normalizeIntlInput(p = this.phoneValue): string {
        return this.testInternational(p)
            ? p.replace(INTL, '+')
            : p;
    }

    public testCustomValidate(p = this.phoneValue): boolean {
        if (this.customRegexp instanceof RegExp) {
            return this.customRegexp.test(p);
        }

        throw new TypeError(`[testCustomValidate]: phone in customRegexp has to be a RegExp. Got ${typeof this.customRegexp}`);
    }
}
