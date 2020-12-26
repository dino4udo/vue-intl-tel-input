import PhoneNumber from 'awesome-phonenumber';
import isNil from 'lodash/isNil';
import { Component, Mixins, Watch, VModel } from 'vue-property-decorator';

import { IPhoneObject, ParseMode } from '@/components/models';
import Dropdown from '@/mixin/useDropdown';
// import useCountries from '@/mixin/useCountries';

@Component
export default class Input extends Mixins(Dropdown) {
    cursorPosition = 0 as number;

    @VModel({ type: String, default: () => '' }) phone!: string

    public get isAllowedInternationalInput() {
        return !this.disabledDropdown;
    }

    public get parsedPlaceholder() {
        if (this.dynamicPlaceholder && this.activeCountry.iso2) {
            // As for me doesnt make sense to confuse user and show hint with country code
            // const mode = this.mode || 'international';

            return PhoneNumber.getExample(this.activeCountry.iso2, 'mobile').getNumber('national');
        }

        return this.inputPlaceholder;
    }

    public get phoneObject(): IPhoneObject {
        return {
            ...new PhoneNumber(this.phone, this.activeCountry.iso2).toJSON(),
            isIntlInput: this.isInternationalInput(this.phone),
            country: this.activeCountry,
        };
    }

    public get parsedMode(): ParseMode {
        if (this.customRegExp) {
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

        if (!this.phone || !this.phoneObject.isIntlInput) {
            return 'national';
        }

        return 'international';
    }

    public get phoneText() {
        let key: ParseMode = 'input';

        if (this.phoneObject.valid) {
            key = this.parsedMode;
        }

        return this.phoneObject.number[key] || '';
    }

    @Watch('phone', { immediate: true })
    onPhoneChanged(value = '', oldValue = '') {
        // const isValidCharactersOnly = this.validCharactersOnly && !testCharacters();
        // const isCustomValidate = this.customRegExp && !testCustomValidate();

        // if (isValidCharactersOnly || isCustomValidate) {
        //     $root.$nextTick(() => {
        //         this.phone = oldValue;
        //     });
        // }

        if (!isNil(value) && this.isInternationalInput(value) && this.isAllowedInternationalInput) {
            const code = PhoneNumber.call(null, `${this.phoneObject.number?.international}`).getRegionCode();

            if (code) {
                this.setActiveCountry(code);
                this.phone = this.phoneObject.number.national;
            }
        }

        // TODO: sanitize on mount
        // if Intl input is not allowed just remove first char
        if (value && this.isInternationalInput(value) && !this.isAllowedInternationalInput) {
            this.phone = this.phone.substring(1);
        }

        // Reset the cursor to current position if it's not the last character.
        if (this.cursorPosition < oldValue.length) {
            this.$nextTick(() => {
                // TODO: check for correct refs
                this.setCaretPosition(this.$refs.refPhoneInput, this.cursorPosition);
            });
        }
    }

    @Watch('phoneObject.valid', { immediate: false })
    watchPhoneValidity(value = false) {
        if (value) {
            this.phone = this.phoneText;
        }

        this.$nextTick(() => {
            this.$emit('validate', this.phoneObject);
        });
    }

    public testCharacters(value = this.phone) {
        const re = /^[()\-+0-9\s]*$/;

        return re.test(value);
    }

    public testCustomValidate(value = this.phone): boolean {
        return this.customRegExp instanceof RegExp
            ? this.customRegExp.test(value)
            : false;
    }

    public isInternationalInput(phoneInput = this.phone) {
        if (typeof phoneInput === 'string') {
            // return /^(?!00|\+)[()\-0-9\s]*$/gi.test()
            return phoneInput[0] === '+' || (phoneInput.length > 2 && phoneInput.startsWith('00'));
        }

        throw new TypeError(`DmcTelInput: phoneInput in isInternationalInput has to be as string. Got ${typeof phoneInput}`);
    }

    public setCaretPosition(ctrl, pos) {
        // Modern browsers
        if (ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(pos, pos);
        }
        // IE8 and below
        else if (ctrl.createTextRange) {
            const range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }
}
