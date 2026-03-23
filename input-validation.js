/* input-validation.js – shared, strict input validation helpers.
   Designed to be used across all simulations (vector / binary counter / hash table).

   Philosophy:
   - strict parsing (no parseInt("12abc") → 12)
   - consistent rules (required, integer-only, min/max, min<=max)
   - UI decides how to report errors (infoPanel, alert, etc.) via callback
*/

(function () {
    'use strict';

    /** @param {string|HTMLElement} elOrId */
    function resolveEl(elOrId) {
        if (!elOrId) return null;
        if (typeof elOrId === 'string') return document.getElementById(elOrId);
        return elOrId;
    }

    function getTrimmedValue(elOrId) {
        const el = resolveEl(elOrId);
        if (!el) return '';
        return String(el.value ?? '').trim();
    }

    function strictParseInt(str) {
        // Accept: optional leading +/-, then digits
        if (typeof str !== 'string') return { ok: false };
        if (!/^[+-]?\d+$/.test(str)) return { ok: false };
        const n = Number(str);
        if (!Number.isFinite(n) || !Number.isInteger(n)) return { ok: false };
        return { ok: true, value: n };
    }

    /**
     * @returns {{ok:true,value:number}|{ok:false,reason:string,details?:any}}
     */
    function readInt(elOrId, opts = {}) {
        const { required = true, min = null, max = null } = opts;

        const raw = getTrimmedValue(elOrId);
        if (!raw) {
            return required ? { ok: false, reason: 'EMPTY' } : { ok: true, value: null };
        }

        const parsed = strictParseInt(raw);
        if (!parsed.ok) return { ok: false, reason: 'NOT_INT' };

        const value = parsed.value;
        if (min !== null && value < min) return { ok: false, reason: 'OUT_OF_RANGE', details: { min, max } };
        if (max !== null && value > max) return { ok: false, reason: 'OUT_OF_RANGE', details: { min, max } };

        return { ok: true, value };
    }

    /**
     * @returns {{ok:true,value:string}|{ok:false,reason:string}}
     */
    function readString(elOrId, opts = {}) {
        const { required = true } = opts;
        const raw = getTrimmedValue(elOrId);
        if (!raw && required) return { ok: false, reason: 'EMPTY' };
        return { ok: true, value: raw };
    }

    /**
     * Validates min/max pair.
     * @returns {{ok:true,min:number,max:number}|{ok:false,reason:string}}
     */
    function readIntMinMax(minElOrId, maxElOrId, opts = {}) {
        const minRes = readInt(minElOrId, opts);
        if (!minRes.ok) return minRes;
        const maxRes = readInt(maxElOrId, opts);
        if (!maxRes.ok) return maxRes;
        if (minRes.value > maxRes.value) return { ok: false, reason: 'MIN_GT_MAX' };
        return { ok: true, min: minRes.value, max: maxRes.value };
    }

    function defaultMessageForReason(reason, d, details) {
        // d.* keys are optional; we provide fallbacks.
        switch (reason) {
            case 'EMPTY':
                return (d?.validationEmpty) || (d?.invalidInput) || 'Invalid input.';
            case 'NOT_INT':
                return (d?.validationNotInteger) || (d?.invalidInput) || 'Invalid input.';
            case 'OUT_OF_RANGE':
                if (typeof d?.validationOutOfRange === 'function') {
                    return d.validationOutOfRange(details?.min, details?.max);
                }
                return (d?.invalidInput) || 'Invalid input.';
            case 'MIN_GT_MAX':
                return (d?.validationMinGreaterThanMax) || (d?.invalidInput) || 'Invalid input.';
            default:
                return (d?.invalidInput) || 'Invalid input.';
        }
    }

    /**
     * @param {string} reason
     * @param {object} ctx
     * @param {object} ctx.dict dictionary for current language (page-specific)
     * @param {(msg:string)=>void} ctx.report function that shows the validation error
     * @param {any} [ctx.details]
     */
    function reportValidationError(reason, ctx) {
        const msg = defaultMessageForReason(reason, ctx?.dict, ctx?.details);
        if (typeof ctx?.report === 'function') ctx.report(msg);
    }

    window.InputValidation = {
        readInt,
        readString,
        readIntMinMax,
        reportValidationError,
    };
})();

