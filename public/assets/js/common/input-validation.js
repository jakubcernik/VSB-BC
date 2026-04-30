// Sdílený modul pro všechny tři simulace.
// Každá validační funkce vrací { ok: true, value } nebo { ok: false, reason }.

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? String(el.value).trim() : '';
}

function parseStrictInt(str) {
    if (!/^[+-]?\d+$/.test(str)) return null;
    const n = Number(str);
    return Number.isInteger(n) ? n : null;
}

// ─── Validace ─────────────────────────────────────────────────────────────────

function readInt(id, opts) {
    if (opts === undefined) opts = {};
    const required = opts.required !== false;
    const min = opts.min !== undefined ? opts.min : null;
    const max = opts.max !== undefined ? opts.max : null;

    const raw = getInputValue(id);

    if (!raw) {
        return required ? { ok: false, reason: 'EMPTY' } : { ok: true, value: null };
    }

    const value = parseStrictInt(raw);
    if (value === null) {
        return { ok: false, reason: 'NOT_INT' };
    }

    if ((min !== null && value < min) || (max !== null && value > max)) {
        return { ok: false, reason: 'OUT_OF_RANGE', details: { min, max } };
    }

    return { ok: true, value };
}

function readString(id, opts) {
    if (opts === undefined) opts = {};
    const required = opts.required !== false;
    const raw = getInputValue(id);
    if (!raw && required) return { ok: false, reason: 'EMPTY' };
    return { ok: true, value: raw };
}

function readIntMinMax(minId, maxId, opts) {
    const minRes = readInt(minId, opts);
    if (!minRes.ok) return minRes;

    const maxRes = readInt(maxId, opts);
    if (!maxRes.ok) return maxRes;

    if (minRes.value > maxRes.value) return { ok: false, reason: 'MIN_GT_MAX' };

    return { ok: true, min: minRes.value, max: maxRes.value };
}

function getErrorMessage(reason, dict, details) {
    if (!dict) return 'Invalid input.';

    if (reason === 'EMPTY')        return dict.validationEmpty             || dict.invalidInput || 'Invalid input.';
    if (reason === 'NOT_INT')      return dict.validationNotInteger        || dict.invalidInput || 'Invalid input.';
    if (reason === 'MIN_GT_MAX')   return dict.validationMinGreaterThanMax || dict.invalidInput || 'Invalid input.';
    if (reason === 'OUT_OF_RANGE') {
        if (typeof dict.validationOutOfRange === 'function') return dict.validationOutOfRange(details && details.min, details && details.max);
        return dict.invalidInput || 'Invalid input.';
    }

    return dict.invalidInput || 'Invalid input.';
}

function reportValidation(result, dict, reportFn) {
    const msg = getErrorMessage(result.reason, dict, result.details);
    if (typeof reportFn === 'function') reportFn(msg);
}

function reportValidationError(reason, ctx) {
    const msg = getErrorMessage(reason, ctx && ctx.dict, ctx && ctx.details);
    if (ctx && typeof ctx.report === 'function') ctx.report(msg);
}

// ─── Shared utility ──────────────────────────────────────────────────────────

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
}

// ─── Export ───────────────────────────────────────────────────────────────────

window.InputValidation = {
    readInt,
    readString,
    readIntMinMax,
    reportValidation,
    reportValidationError,
    randInt,
    sleep,
};
