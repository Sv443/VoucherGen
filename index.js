"use strict";

document.addEventListener("DOMContentLoaded", () => onLoad());

/** Whether vouchers have been generated yet. */
let isGenerated = false;

/** @type {string|ArrayBuffer|null} */
let voucherImageData = null;

function onLoad() {
    const genBtn = document.querySelector("#generateBtn");
    genBtn.addEventListener("click", () => generateVouchers());

    const printBtn = document.querySelector("#printBtn");
    printBtn.addEventListener("click", () => {
        if(generateVouchers()) {
            setTimeout(() => {
                const formPage = document.querySelector("#form-page");

                if(getSettings().removeSettingsForPrint)
                    formPage?.classList.add("hidden");

                window.print();

                setTimeout(() => {
                    formPage?.classList.remove("hidden");
                }, 100);
            }, 100);
        }
    });

    initializeDropzone();
}

function renderType(settings, type) {
    return settings.addBullets
        ? `• &nbsp; ${type} &nbsp; •`
        : type;
}

const formSettingsCfg = [
    ["numRows", (el) => Number(el.value)],
    ["numPages", (el) => Number(el.value)],
    ["voucherTypes", (el) => el.value.split("\n").map(s => s.trim()).filter(s => s.length > 0)],
    ["addBullets", (el) => el.checked],
    ["removeSettingsForPrint", (el) => el.checked],
];

function getSettings() {
    const settings = {};
    for(const [id, parse] of formSettingsCfg) {
        try {
            const el = document.getElementById(id);
            if(!el) {
                console.error(`Element with id ${id} not found`);
                return;
            }
            settings[id] = parse(el);
        }
        catch(e) {
            console.error(`Error parsing setting ${id}:`, e);
            continue;
        }
    }

    console.log("Parsed settings:", settings);

    return settings;
}

const vouchersPerRow = 3;

function generateVouchers() {
    // #region clear output:

    const outputCont = document.querySelector("#output");
    outputCont.innerHTML = "";

    // #region read settings:

    const settings = getSettings();

    if(settings.voucherTypes.length === 0) {
        alert(tr("alert.provide_voucher_types"));
        return false;
    }

    // #region stats

    const vouchersPerType = settings.numPages * settings.numRows * vouchersPerRow;
    const vouchersTotal = vouchersPerType * settings.voucherTypes.length;

    const vouchersPerTypeEl = document.querySelector("#vouchersPerType");
    vouchersPerTypeEl.innerText = `${tr("stats.vouchers_per_type")} ${vouchersPerType}`;

    const vouchersTotalEl = document.querySelector("#vouchersTotal");
    vouchersTotalEl.innerText = `${tr("stats.vouchers_total")} ${vouchersTotal}`;

    const voucherPagesEl = document.querySelector("#voucherPages");
    voucherPagesEl.innerText = `${tr("stats.voucher_pages")} ${settings.numPages * settings.voucherTypes.length}`;

    // #region generate vouchers:

    for(const type of settings.voucherTypes) {
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

    return isGenerated = true;
}

function createVoucherElement(settings, type) {
    const voucher = document.createElement("div");
    voucher.classList.add("voucher");
    
    const textEl = document.createElement("div");
    textEl.classList.add("voucher-text");
    textEl.innerHTML = renderType(settings, type);

    const imgEl = document.createElement("img");
    imgEl.classList.add("voucher-image");
    imgEl.src = voucherImageData ?? "./fallback.png";

    voucher.appendChild(textEl);
    voucher.appendChild(imgEl);

    return voucher;
}

//#region dropzone

function initializeDropzone() {
    const dropzone = document.querySelector("#dropzone");
    const fileInput = document.querySelector("#file-input");
    const dropzoneContent = document.querySelector(".dropzone-content");
    const imagePreview = document.querySelector("#image-preview");
    const previewImg = document.querySelector("#preview-img");
    const removeImageBtn = document.querySelector("#remove-image");

    dropzone.addEventListener("click", () => {
        if (!imagePreview.style.display || imagePreview.style.display === 'none') {
            fileInput.click();
        }
    });

    fileInput.addEventListener("change", (e) => {
        handleFiles(e.target.files);
    });

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        handleFiles(e.dataTransfer.files);
    });

    removeImageBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeImage();
    });

    function handleFiles(files) {
        if(files.length === 0) return;

        const file = files[0];

        if (!file.type.startsWith("image/")) {
            alert(tr("alert.invalid_file_type"));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            voucherImageData = e.target.result;
            showImagePreview(voucherImageData, file.name);
        };
        reader.readAsDataURL(file);
    }

    function showImagePreview(dataUri, fileName) {
        previewImg.src = dataUri;
        previewImg.title = fileName;
        dropzoneContent.style.display = "none";
        imagePreview.style.display = "flex";
    }

    function removeImage() {
        voucherImageData = null;
        previewImg.src = "";
        fileInput.value = "";
        dropzoneContent.style.display = "block";
        imagePreview.style.display = "none";
    }
}
