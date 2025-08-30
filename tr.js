//#region data

/** @typedef {"en"|"de"} LangCode */

/** @type {Record<LangCode, Record<string, string>>} Translation strings. */
const trans = {
    en: {
        "alert.invalid_file_type": "Please select a valid image file.",
        "alert.print_confirm": "To print, the settings will be removed.\nTo regenerate the vouchers, please reload the page (key: F5).\n\nContinue?",
        "alert.provide_voucher_types": "Please provide at least one voucher type.",
        "btn.generate_and_print": "Generate & Print",
        "btn.generate": "Generate Vouchers",
        "meta.lang_name": "English",
        "meta.page_title": "Voucher Generator",
        "notes.title": "Notes:",
        "notes.save_as_pdf": "To save as PDF, click 'Generate & Print' and select 'Microsoft Print to PDF' or a similar option instead of your regular printer.",
        "settings.add_bullets": "⏺ With bullets:",
        "settings.language": "🌐 Language:",
        "settings.pages_per_voucher_type": "📜 Pages per voucher type:",
        "settings.remove_settings_for_print": "⚙️ Remove settings for print:",
        "settings.rows_per_page": "📝 Rows per page:",
        "settings.voucher_image": "🌄 Voucher image:",
        "settings.voucher_image.dropzone_text": "Drop an image here or click to browse",
        "settings.voucher_types": "🔠 Voucher types (one per line):",
        "stats.voucher_pages": "📄 Voucher pages:",
        "stats.vouchers_per_type": "🧮 Vouchers per type:",
        "stats.vouchers_total": "📚 Vouchers total:",
    },
    de: {
        "alert.invalid_file_type": "Bitte wähle eine gültige Bilddatei aus.",
        "alert.print_confirm": "Zum Drucken werden die Einstellungen entfernt.\nZum erneuten Generieren der Wertmarken bitte die Seite neu laden (Taste: F5).\n\nFortfahren?",
        "alert.provide_voucher_types": "Bitte mindestens einen Wertmarken-Typ angeben.",
        "btn.generate_and_print": "Generieren & Drucken",
        "btn.generate": "Wertmarken generieren",
        "meta.lang_name": "Deutsch",
        "meta.page_title": "Wertmarken-Generator",
        "notes.title": "Hinweise:",
        "notes.save_as_pdf": "Zum Speichern als PDF, auf 'Generieren & Drucken' klicken und statt dem normalen Drucker 'Microsoft Print to PDF' oder eine ähnliche Option auswählen.",
        "settings.add_bullets": "⏺ Mit Aufzählungszeichen:",
        "settings.language": "🌐 Sprache (Language):",
        "settings.pages_per_voucher_type": "📜 Seiten je Wertmarken-Typ:",
        "settings.remove_settings_for_print": "⚙️ Einstellungen zum Drucken entfernen:",
        "settings.rows_per_page": "📝 Zeilen je Seite:",
        "settings.voucher_image": "🌄 Wertmarken-Bild:",
        "settings.voucher_image.dropzone_text": "Ziehe ein Bild hierher, oder klicke zum Auswählen",
        "settings.voucher_types": "🔠 Wertmarken-Typen (einer pro Zeile):",
        "stats.voucher_pages": "📄 Wertmarken-Seiten:",
        "stats.vouchers_per_type": "🧮 Wertmarken pro Typ:",
        "stats.vouchers_total": "📚 Wertmarken gesamt:",
    },
};

/** @type {[string, string[]][]} Map of BCP-47 code variants to translation identifiers. */
const langCodeMap = [
    ["en", ["en", "en-AU", "en-CA", "en-GB", "en-IN", "en-NZ", "en-US", "en-ZA"]],
    ["de", ["de", "de-AT", "de-CH", "de-DE", "de-LI", "de-LU"]],
];

const fallbackLang = "en";
let currentLang = document.documentElement.lang = getDefaultLang() ?? fallbackLang;

document.addEventListener("DOMContentLoaded", () => initTranslations());

//#region functions

/** Initializes the translation system. */
function initTranslations() {
    const langSelect = document.querySelector("#language");
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

    document.title = tr("meta.page_title");
}

/**
 * Returns the best matching language key from {@linkcode trans} based on the browser's language settings.
 * @returns {string}
 */
function getDefaultLang() {
    const storedLang = localStorage.getItem("lang");
    if(storedLang && typeof trans[storedLang] === "object")
        return storedLang;

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
    localStorage.setItem("lang", lang);
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
