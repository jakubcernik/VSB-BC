/* input-validation.js – shared, strict input validation helpers.
   Designed to be used across all simulations (vector / binary counter / hash table).

   Philosophy:
   - strict parsing (no parseInt("12abc") → 12)
   - consistent rules (required, integer-only, min/max, min<=max)
   - UI decides how to report errors (infoPanel, alert, etc.) via callback
*/

/** @param {string|HTMLElement} elOrId */
function resolveEl(elOrId) {
    if (!elOrId) return null;
    if (typeof elOrId === 'string') return document.getElementById(elOrId);
    return elOrId;
}

function getTrimmedValue(elOrId) {
    const el = resolveEl(elOrId);
    if (!el) return '';
    var val = el.value;
    if (val === null || val === undefined) val = '';
    return String(val).trim();
}

function strictParseInt(str) {
    // Accept: optional leading +/-, then digits
    if (typeof str !== 'string') return { ok: false };
    if (!/^[+-]?\d+$/.test(str)) return { ok: false };
    const n = Number(str);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return { ok: false };
    return { ok: true, value: n };
}

function isOutOfRange(value, min, max) {
    if (min !== null && value < min) return true;
    if (max !== null && value > max) return true;
    return false;
}

/**
 * @returns {{ok:true,value:number}|{ok:false,reason:string,details?:any}}
 */
function readInt(elOrId, opts) {
    if (opts === undefined) opts = {};
    var required = opts.required !== undefined ? opts.required : true;
    var min = opts.min !== undefined ? opts.min : null;
    var max = opts.max !== undefined ? opts.max : null;

    const raw = getTrimmedValue(elOrId);
    if (!raw) {
        return required ? { ok: false, reason: 'EMPTY' } : { ok: true, value: null };
    }

    const parsed = strictParseInt(raw);
    if (!parsed.ok) return { ok: false, reason: 'NOT_INT' };

    const value = parsed.value;
    if (isOutOfRange(value, min, max)) {
        return { ok: false, reason: 'OUT_OF_RANGE', details: { min: min, max: max } };
    }

    return { ok: true, value: value };
}

/**
 * @returns {{ok:true,value:string}|{ok:false,reason:string}}
 */
function readString(elOrId, opts) {
    if (opts === undefined) opts = {};
    var required = opts.required !== undefined ? opts.required : true;
    const raw = getTrimmedValue(elOrId);
    if (!raw && required) return { ok: false, reason: 'EMPTY' };
    return { ok: true, value: raw };
}

/**
 * Validates min/max pair.
 * @returns {{ok:true,min:number,max:number}|{ok:false,reason:string}}
 */
function readIntMinMax(minElOrId, maxElOrId, opts) {
    if (opts === undefined) opts = {};
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
            return (d && d.validationEmpty) || (d && d.invalidInput) || 'Invalid input.';
        case 'NOT_INT':
            return (d && d.validationNotInteger) || (d && d.invalidInput) || 'Invalid input.';
        case 'OUT_OF_RANGE':
            if (d && typeof d.validationOutOfRange === 'function') {
                return d.validationOutOfRange(details && details.min, details && details.max);
            }
            return (d && d.invalidInput) || 'Invalid input.';
        case 'MIN_GT_MAX':
            return (d && d.validationMinGreaterThanMax) || (d && d.invalidInput) || 'Invalid input.';
        default:
            return (d && d.invalidInput) || 'Invalid input.';
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
    var ctxDict = ctx ? ctx.dict : undefined;
    var ctxDetails = ctx ? ctx.details : undefined;
    const msg = defaultMessageForReason(reason, ctxDict, ctxDetails);
    if (ctx && typeof ctx.report === 'function') ctx.report(msg);
}

window.InputValidation = {
    readInt,
    readString,
    readIntMinMax,
    reportValidationError,
};
