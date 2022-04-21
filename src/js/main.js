let modalInstance;

//LISTA DE PRESETS

function printPresets(allKeys) {
    let containsAll;
    str = '<option disabled selected>Ou selecione um preset</option>';
    for (var key in presets) {
        if (!presets.hasOwnProperty(key)) continue;

        var obj = presets[key];

        containsAll = obj.fields.every(element => {
            return allKeys.includes(element);
        });

        if (containsAll)
            str += '<option value="' + key + '">' + key + '</option>';

    }
    document.getElementById("presetsId").innerHTML = str;

    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, [{ belowOrigin: true, coverTrigger: false }]);
}

//DOWNLOAD POR PRESET

function onSelectChange() {
    tableKeys = presets[document.getElementById('presetsId').value].fields
    download();
    modalInstance.close()
}

//INICIALIZANDO E INSTANCIANDO COMPONENTS DO MATERIALIZE
document.addEventListener('DOMContentLoaded', function () {

    var modal1 = document.querySelector('#modal1');
    modalInstance = M.Modal.init(modal1, []);

    var modal2 = document.querySelector('#modal2');
    modalInstance2 = M.Modal.init(modal2, []);

    var tElems = document.querySelectorAll('.tooltipped');
    var tooltipInstances = M.Tooltip.init(tElems, []);
});

let finalFile;
let tableKeys;
let text;

const csvFile = document.getElementById("csvFile");

function csvToObject(str, delimiter = ",") {

    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

    const rows = str.slice(str.indexOf("\n") + 1).split("\n");

    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });

    return arr;
}

//SELETOR DE COLUNAS

function triggerList(key) {
    let haveKey = false;

    for (var i = 0; i < tableKeys.length; i++) {
        if (!document.getElementById(key).checked && tableKeys[i] === key) {
            tableKeys.splice(i, 1);
            haveKey = true;
        }
    }

    if (!haveKey) {
        tableKeys.push(key);
    }

    printOrder();
}

function printOrder() {
    let str = '';
    tableKeys.forEach(e => {
        str += '<span style="margin-left: 0; margin-right: 6px; min-width:max-content" class="badge amber lighten-2 black-text">' + e + '</span>';
    });

    document.getElementById("tableOrder").innerHTML = str;
}

function printModalItens(keys) {
    let htmlList = '<ul style="border: none" class="collection grey darken-1" >';
    keys.forEach(key => {
        htmlList += '<li class="grey darken-4 white-text collection-item" style="padding: 0; display: flex;"><label class="white-text" style="cursor: pointer; width: 100%;padding: 10px 20px;"><input onclick="triggerList(\'' + key + '\')" type="checkbox" id="' + key + '"/><span>' + key + '</span></label></li>';
    });

    htmlList += '</ul>';

    document.getElementById('modalList').innerHTML = htmlList;
}

//DOWNLOAD POR SELETOR DE COLUNAS

const myForm = document.getElementById("myForm");
myForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var instance = M.Modal.getInstance(document.querySelector('#modal1'));
    instance.open();

    const input = csvFile.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        text = e.target.result.replaceAll(['\r'], '');
        const data = csvToObject(text);
        let keys = Object.keys(data[0]);
        tableKeys = [];
        printModalItens(keys);
        printPresets(keys);
    };

    reader.readAsText(input);

    tableKeys = [];
    printOrder();
});

//CONVERTER E FORMATAR

function objectToCsv(array) {
    var fields = Object.keys(array[0])
    var replacer = function (key, value) { return value === null || value === '' ? '0' : (!isNaN(Math.round(value)) ? Math.round(value) : value) }
    var rounder = function (key, value) { return Math.round(value) !== false ? Math.round(value) : value }
    var csv = array.map(function (row) {
        return fields.map(function (fieldName) {
            return JSON.stringify(row[fieldName], replacer)
        }).join(',')
    })
    csv.unshift(fields.join(',')) // add header column
    csv = csv.join('\r\n');

    return csv
}

function formatCsv(object) {
    let new_list = object.map(function (obj) { return _.pick(obj, tableKeys) });
    var ret = objectToCsv(new_list);
    return ret.replaceAll('"', '');
}

String.prototype.replaceAt = function (index, replacement) {
    if (index >= this.length) {
        return this.valueOf();
    }

    return this.substring(0, index) + replacement + this.substring(index + 1);
}

function removeComma(text) {
    let ret;
    ret = text;

    let switch_ = 0;
    let commas = [];
    for (let i = 0; i <= text.length - 1; i++) {
        if (text.charAt(i) == '"')
            switch_++;

        if (switch_ % 2 != 0 && text.charAt(i) == ',')
            commas.push(i);
    }

    commas.forEach(function (e, index) {
        ret = ret.replaceAt(e, ' ');
    });

    return ret;
}

//DOWNLOAD DO ARQUIVO

function download() {
    let text2 = removeComma(text)
    const data = csvToObject(text2);
    finalFile = formatCsv(data);

    save('datastudio_format', finalFile);
}

function save(filename, data) {
    const blob = new Blob(["\ufeff", data], { type: 'text/csv;charset=UTF-8' });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

//MODAL DE INFORMAÇÃO

function openInfo() {
    modalInstance2.open();
}