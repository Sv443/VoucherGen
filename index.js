"use strict";

document.addEventListener("DOMContentLoaded", () => onLoad());

let isGenerated = false;

function onLoad() {
    const genBtn = document.querySelector("#generateBtn");
    genBtn.addEventListener("click", () => generateVouchers());

    const printBtn = document.querySelector("#printBtn");
    printBtn.addEventListener("click", () => {
        generateVouchers();

        setTimeout(() => {
            if(getSettings().removeSettingsForPrint) {
                if(!confirm(tr("alert.print_confirm")))
                    return;
                document.querySelector("#form-page")?.remove();
            }

            window.print();
        }, 50);
    });
}

function renderType(settings, type) {
    return settings.addBullets
        ? `• &nbsp; ${type} &nbsp; •`
        : type;
}

const formSettingsCfg = [
    ["numRows", (el) => Number(el.value)],
    ["numPages", (el) => Number(el.value)],
    ["voucherType", (el) => el.value.split("\n").map(s => s.trim()).filter(s => s.length > 0)],
    ["addBullets", (el) => el.checked],
    ["removeSettingsForPrint", (el) => el.checked],
];

function getSettings() {
    const settings = {};
    for(const [id, parse] of formSettingsCfg) {
        const el = document.getElementById(id);
        if(!el) {
            console.error(`Element with id ${id} not found`);
            return;
        }
        settings[id] = parse(el);
    }

    console.log("Settings:", settings);

    return settings;
}

const vouchersPerRow = 3;

function generateVouchers() {
    // #region clear output:

    const outputCont = document.querySelector("#output");
    outputCont.innerHTML = "";

    // #region read settings:

    const settings = getSettings();

    if(settings.voucherType.length === 0) {
        alert(tr("alert.provide_voucher_types"));
        return;
    }

    // #region stats

    const vouchersPerTypeEl = document.querySelector("#vouchersPerType");
    const totalVouchers = settings.numPages * settings.numRows * vouchersPerRow;
    vouchersPerTypeEl.innerText = `${tr("stats.vouchers_per_type")} ${totalVouchers}`;

    const vouchersTotalEl = document.querySelector("#vouchersTotal");
    const totalTypes = settings.voucherType.length;
    vouchersTotalEl.innerText = `${tr("stats.vouchers_total")} ${totalVouchers * totalTypes}`;

    // #region generate vouchers:

    for(const type of settings.voucherType) {
        for(let i = 0; i < settings.numPages; i++) {
            const page = document.createElement("div");
            page.classList.add("page", "voucher-page");

            for(let j = 0; j < settings.numRows * vouchersPerRow; j++) {
                if(j % vouchersPerRow === 0) {
                    const row = document.createElement("div");
                    row.classList.add("voucher-row");
                    page.appendChild(row);
                }

                const voucher = createVoucherElement(settings, type);
                page.lastChild.appendChild(voucher);
            }

            outputCont.appendChild(page);
        }
    }

    isGenerated = true;
}

function createVoucherElement(settings, type) {
    const voucher = document.createElement("div");
    voucher.classList.add("voucher");
    
    const textEl = document.createElement("div");
    textEl.classList.add("voucher-text");
    textEl.innerHTML = renderType(settings, type);

    const imgEl = document.createElement("img");
    imgEl.classList.add("voucher-image");
    imgEl.src = "./fallback.png";

    voucher.appendChild(textEl);
    voucher.appendChild(imgEl);

    return voucher;
}
