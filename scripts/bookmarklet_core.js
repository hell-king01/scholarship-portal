// This is the bookmarklet logic - label-first approach
// To be embedded in DashboardPage.tsx between lines 289-567

// Helper: set value on any input (works with React/Angular)
function smSetVal(el, val) {
    try {
        var proto = Object.getPrototypeOf(el);
        var desc = Object.getOwnPropertyDescriptor(proto, 'value');
        if (desc && desc.set) desc.set.call(el, val);
        else el.value = val;
    } catch (e) { el.value = val; }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
}

// Helper: fill a select dropdown
function smFillSelect(el, val) {
    if (!val) return false;
    var target = String(val).toLowerCase().trim();
    var opts = el.options;
    var best = null;
    for (var i = 1; i < opts.length; i++) {
        var ot = opts[i].text.toLowerCase().trim();
        var ov = opts[i].value.toLowerCase().trim();
        if (ot === target || ov === target) { best = i; break; }
        if (target === 'male' && (ot === 'male' || ot === 'm')) { best = i; break; }
        if (target === 'female' && (ot === 'female' || ot === 'f')) { best = i; break; }
        if (ot.indexOf(target) > -1) { best = i; break; }
        if (target.indexOf(ot) > -1 && ot.length > 2 && ot.indexOf('select') < 0) { best = i; }
    }
    if (best !== null) {
        el.selectedIndex = best;
        el.value = opts[best].value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        return true;
    }
    return false;
}

// Helper: show toast notification
function smShowToast(msg) {
    var old = document.getElementById('sm-toast'); if (old) old.remove();
    var t = document.createElement('div'); t.id = 'sm-toast'; t.innerHTML = msg;
    document.body.appendChild(t);
    setTimeout(function () { if (document.getElementById('sm-toast')) document.getElementById('sm-toast').remove(); }, 4000);
}

// Helper: highlight an element with tooltip
function smHighlight(el, msg) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () {
        try { el.focus(); } catch (e) { }
        el.style.outline = '3px solid #f97316';
        el.style.outlineOffset = '2px';
        el.style.boxShadow = '0 0 0 6px rgba(249,115,22,0.3)';
        var old = document.getElementById('sm-tooltip'); if (old) old.remove();
        var rect = el.getBoundingClientRect();
        var tip = document.createElement('div'); tip.id = 'sm-tooltip';
        tip.innerHTML = msg;
        tip.style.cssText = 'position:fixed;top:' + (Math.max(5, rect.top - 40)) + 'px;left:' + Math.max(5, rect.left) + 'px;background:#f97316;color:white;padding:8px 14px;border-radius:8px;font-weight:700;font-size:12px;z-index:9999999;box-shadow:0 4px 15px rgba(0,0,0,0.25);pointer-events:none;max-width:280px;';
        document.body.appendChild(tip);
        setTimeout(function () {
            el.style.outline = ''; el.style.outlineOffset = ''; el.style.boxShadow = '';
            if (document.getElementById('sm-tooltip')) document.getElementById('sm-tooltip').remove();
        }, 5000);
    }, 400);
}

// Find the input associated with a label element
function smGetLabelFor(labelEl) {
    var inp = null;
    // Strategy 1: label[for] attribute
    if (labelEl.htmlFor) { inp = document.getElementById(labelEl.htmlFor); if (inp) return inp; }
    // Strategy 2: input INSIDE the label
    inp = labelEl.querySelector('input,select,textarea');
    if (inp) return inp;
    // Strategy 3: input in the same parent container
    var p = labelEl.parentElement;
    if (p) {
        inp = p.querySelector('input:not([type=hidden]),select,textarea');
        if (inp && inp !== labelEl) return inp;
        // Strategy 4: next sibling
        var ns = labelEl.nextElementSibling;
        while (ns) {
            if (ns.matches && ns.matches('input,select,textarea')) return ns;
            var inner = ns.querySelector('input:not([type=hidden]),select,textarea');
            if (inner) return inner;
            ns = ns.nextElementSibling;
        }
    }
    // Strategy 5: grandparent
    var gp = p ? p.parentElement : null;
    if (gp) {
        var allIn = gp.querySelectorAll('input:not([type=hidden]),select,textarea');
        if (allIn.length === 1) return allIn[0];
    }
    return null;
}

// Matching rules with NEGATIVE keywords to avoid false positives
var rules = [
    { key: 'fullName', val: data.fullName, match: function (t) { return (t.indexOf('applicant') > -1 || t.indexOf('student name') > -1 || t.indexOf('candidate name') > -1 || (t.indexOf('full name') > -1) || (t.indexOf('name') > -1 && t.indexOf('institute') < 0 && t.indexOf('college') < 0 && t.indexOf('school') < 0 && t.indexOf('scheme') < 0 && t.indexOf('bank') < 0 && t.indexOf('user') < 0 && t.indexOf('parent') < 0 && t.indexOf('father') < 0 && t.indexOf('mother') < 0 && t.indexOf('course') < 0)); } },
    { key: 'aadhar', val: data.aadhar, match: function (t) { return t.indexOf('aadhar') > -1 || t.indexOf('aadhaar') > -1; } },
    { key: 'gender', val: data.gender, match: function (t) { return t.indexOf('gender') > -1; } },
    { key: 'dob', val: data.dob, match: function (t) { return t.indexOf('date of birth') > -1 || t.indexOf('dob') > -1 || t.indexOf('birth date') > -1 || t.indexOf('d.o.b') > -1; } },
    { key: 'income', val: String(data.income), match: function (t) { return t.indexOf('income') > -1; } },
    { key: 'state', val: data.state, match: function (t) { return t.indexOf('state') > -1 && t.indexOf('marital') < 0; } },
    { key: 'category', val: data.category, match: function (t) { return t.indexOf('community') > -1 || t.indexOf('category') > -1 || t.indexOf('caste') > -1; } },
    { key: 'religion', val: data.category, match: function (t) { return t.indexOf('religion') > -1; } },
    { key: 'education', val: data.education, match: function (t) { return (t.indexOf('education') > -1 || t.indexOf('qualification') > -1) && t.indexOf('loan') < 0; } },
    { key: 'percentage', val: String(data.percentage), match: function (t) { return t.indexOf('percentage') > -1 || t.indexOf('percent') > -1 || (t.indexOf('marks') > -1 && t.indexOf('remark') < 0); } },
    { key: 'disability', val: data.disability, match: function (t) { return t.indexOf('divyang') > -1 || t.indexOf('disability') > -1 || t.indexOf('handicap') > -1 || t.indexOf('pwd') > -1; } },
    { key: 'institution', val: data.institution, match: function (t) { return t.indexOf('institute') > -1 || t.indexOf('institution') > -1 || t.indexOf('college') > -1 || t.indexOf('school name') > -1 || t.indexOf('university') > -1; } },
    { key: 'course', val: data.course, match: function (t) { return (t.indexOf('course') > -1 || t.indexOf('degree') > -1 || t.indexOf('programme') > -1 || t.indexOf('program') > -1) && t.indexOf('source') < 0; } },
    { key: 'domicile', val: data.state, match: function (t) { return t.indexOf('domicile') > -1; } }
];

// BUILD FIELD MAP: scan all labels and match to inputs
function smBuildFieldMap() {
    var fieldMap = [];
    var used = {};

    // Phase 1: scan all label-like elements
    var labels = document.querySelectorAll('label,th,dt,.control-label,.form-label,.col-form-label,[class*=label]');
    for (var i = 0; i < labels.length; i++) {
        var lb = labels[i];
        if (lb.closest('#sm-bridge-sidebar')) continue;
        var txt = (lb.textContent || '').trim();
        if (txt.length < 2 || txt.length > 80) continue;
        var inp = smGetLabelFor(lb);
        if (!inp || inp.type === 'hidden' || inp.closest('#sm-bridge-sidebar')) continue;
        if (inp.offsetParent === null && inp.type !== 'hidden') continue;
        var tl = txt.toLowerCase();
        for (var r = 0; r < rules.length; r++) {
            var rule = rules[r];
            if (used[rule.key]) continue;
            if (!rule.val || String(rule.val).trim() === '') continue;
            if (rule.match(tl)) {
                fieldMap.push({ rule: rule, input: inp, labelText: txt });
                used[rule.key] = true;
                break;
            }
        }
    }

    // Phase 2: fallback - check input attributes directly (name, id, formControlName, placeholder)
    var allInputs = document.querySelectorAll('input:not([type=hidden]),select,textarea');
    for (var i = 0; i < allInputs.length; i++) {
        var el = allInputs[i];
        if (el.closest('#sm-bridge-sidebar')) continue;
        if (el.offsetParent === null) continue;
        var attrs = ((el.name || '') + ' ' + (el.id || '') + ' ' + (el.placeholder || '') + ' ' + (el.getAttribute('formcontrolname') || '') + ' ' + (el.getAttribute('ng-model') || '')).toLowerCase();
        if (attrs.trim().length < 2) continue;
        for (var r = 0; r < rules.length; r++) {
            var rule = rules[r];
            if (used[rule.key]) continue;
            if (!rule.val || String(rule.val).trim() === '') continue;
            if (rule.match(attrs)) {
                fieldMap.push({ rule: rule, input: el, labelText: attrs });
                used[rule.key] = true;
                break;
            }
        }
    }

    return fieldMap;
}
