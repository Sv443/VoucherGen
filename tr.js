//#region data

/** Translation strings. */
const trans = {
    en: {
        "meta.lang_name": "English",
        "alert.generate_vouchers_first": "Please generate vouchers first.",
        "alert.print_confirm": "To print, the settings will be removed.\nTo regenerate the vouchers, please reload the page (key: F5).\n\nContinue?",
        "btn.generate": "Generate Vouchers",
        "btn.print": "Print",
        "page.title": "Voucher Generator",
        "settings.add_bullets": "Add bullets:",
        "settings.language": "Language:",
        "settings.pages_per_voucher_type": "Pages per voucher type:",
        "settings.rows_per_page": "Rows per page:",
        "settings.voucher_types": "Voucher types (one per line):",
        "stats.vouchers_per_type": "Vouchers per type:",
        "stats.vouchers_total": "Vouchers total:",
    },
    de: {
        "meta.lang_name": "Deutsch",
        "alert.generate_vouchers_first": "Bitte zuerst Wertmarken generieren.",
        "alert.print_confirm": "Zum Drucken werden die Einstellungen entfernt.\nZum erneuten Generieren der Wertmarken bitte die Seite neu laden (Taste: F5).\n\nFortfahren?",
        "btn.generate": "Wertmarken generieren",
        "btn.print": "Drucken",
        "page.title": "Wertmarken-Generator",
        "settings.add_bullets": "Mit Aufzählungszeichen:",
        "settings.language": "Sprache:",
        "settings.pages_per_voucher_type": "Seiten je Wertmarken-Typ:",
        "settings.rows_per_page": "Zeilen je Seite:",
        "settings.voucher_types": "Wertmarken-Typen (einer pro Zeile):",
        "stats.vouchers_per_type": "Wertmarken pro Typ:",
        "stats.vouchers_total": "Wertmarken gesamt:",
    },
};

/** Map of BCP-47 codes to translation identifiers. */
const langCodeMap = [
    ["en", ["en", "en-US", "en-GB", "en-AU", "en-CA"]],
    ["de", ["de", "de-DE", "de-AT", "de-CH"]],
];

const fallbackLang = "en";
let currentLang = document.documentElement.lang = getDefaultLang() ?? fallbackLang;

document.addEventListener("DOMContentLoaded", () => initTranslations());

//#region functions

/** Initializes the translation system. */
function initTranslations() {
    const langSelect = document.querySelector("#lang-select");
    if(!langSelect) return;

    for(const lang in trans) {
        const option = document.createElement("option");
        option.value = lang;
        option.innerText = trans[lang]?.["meta.lang_name"] ?? lang.toUpperCase();
        if(lang === currentLang)
            option.selected = true;
        langSelect.appendChild(option);
    }

    langSelect.addEventListener("change", (e) => {
        const newLang = e.target.value;
        if(newLang && newLang !== currentLang)
            setLang(newLang);
    });

    retranslateElements();
}

/** Updates all elements with the `tr` class to the current language. */
function retranslateElements() {
    document.querySelectorAll(".tr").forEach(el => {
        const key = el.dataset.key;
        if(!key)
            return warn("Element with .tr class has no data-key attribute:", el);

        if(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
            el.placeholder = tr(key);
        else
            el.innerText = tr(key);
    });

    document.title = tr("meta.title");
}

/**
 * Returns the best matching language key from {@linkcode trans} based on the browser's language settings.
 * @returns {string}
 */
function getDefaultLang() {
    const navLangs = [navigator.language, ...(navigator.languages ?? [])];

    for(const navLang of navLangs) {
        for(const [langKey, codes] of langCodeMap) {
            if(codes.includes(navLang))
                return langKey;
        }
        const trimmedLang = navLang.split("-")[0];
        for(const [langKey, codes] of langCodeMap) {
            if(codes.includes(trimmedLang))
                return langKey;
        }
    }

    return fallbackLang;
}

/**
 * Sets the current language.
 * @param {string} lang Any language key from the {@linkcode trans} object
 * @returns {string}
 */
function setLang(lang) {
    document.documentElement.lang = currentLang = lang;
    retranslateElements();
    return currentLang;
}

/**
 * Returns the translation string for the given key in the current language.
 * @param {string} key The translation key.
 * @returns {string}
 */
function tr(key) {
    return trans?.[currentLang]?.[key] ?? trans?.[fallbackLang]?.[key] ?? key;
}
