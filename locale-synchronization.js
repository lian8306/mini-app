const fs = require("fs-extra");

const dir = "./locales";
const outputDir = "./output";
const basicFile = `${dir}/zh-cn.json`;
const pendingFile = `${dir}/ja.json`;
const sourceFile = `${dir}/source/ja.json`;
const outputPendingFile = `${outputDir}/ja.json`;

let pendingTranslateKeys = [];
let parentKey = [];

let basicFileJson = fs.readJsonSync(basicFile);
let pendingFileJson = fs.readJsonSync(pendingFile);
let sourceFileJson = fs.readJsonSync(sourceFile);

compareJson(basicFileJson, pendingFileJson, parentKey, false);
copySourceValue(pendingFileJson, sourceFileJson, pendingTranslateKeys);
console.log("pendingFileJson", pendingFileJson);

fs.outputJsonSync(outputPendingFile, pendingFileJson);

function compareJson(basicFileJson, pendingFileJson, parentKey, deep) {
    let newParentKey = [...parentKey];
    for (var i in basicFileJson) {
        // if (deep) {
        // newParentKey.push(i);
        // } else {
        newParentKey = [...parentKey, i];
        // }
        // console.log("parentKey", newParentKey);

        if (!pendingFileJson[i]) {
            pendingFileJson[i] = basicFileJson[i];

            if (typeof pendingFileJson[i] === "string") {
                pendingTranslateKeys.push(newParentKey.join("."));
            } else {
                addPendingTranslateKeys(pendingFileJson[i], newParentKey, pendingTranslateKeys);
            }
        } else {
            if (typeof basicFileJson[i] === "object") {
                compareJson(basicFileJson[i], pendingFileJson[i], newParentKey, true);
            }
        }
    }
}

function addPendingTranslateKeys(pendingFileJson, parentKey, pendingTranslateKeys, deep) {
    for (var i in pendingFileJson) {
        let newParentKey = [...parentKey, i];
        // if (deep) {
        //     newParentKey.push(i);
        // } else {
        //     newParentKey = [...parentKey];
        // }
        if (typeof pendingFileJson[i] === "string") {
            // newParentKey.push(i);
            pendingTranslateKeys.push(newParentKey.join("."));
        } else {
            addPendingTranslateKeys(pendingFileJson[i], newParentKey, pendingTranslateKeys, true);
        }
    }
}


function getKeyValue(value, keys) {
    if (!keys) {
        return;
    }
    // let keys = key.split(".");
    return keys.reduce((prevValue, key) => {
        return prevValue && prevValue[key];
    }, value);
}

function getValues(sourceFile, lastKey, prevLastKey, prevKey) {
    let result = [];
    for (var i in sourceFile) {
        // if (lastKey === "searchQueueNameTip") {
        //     console.log("searchQueueNameTip", i);
        // }
        if (i === lastKey) {

            if (typeof sourceFile[i] === "string") {
                if (result.indexOf(sourceFile[i]) == -1) {
                    if (!result.length) {
                        result.push(sourceFile[i]);
                    } else if (prevKey && prevLastKey && prevKey === prevLastKey) {
                        result.push(sourceFile[i]);
                    }
                }
            }
        } else {
            if (typeof sourceFile[i] === "object") {
                // if (lastKey === "email") {
                //     console.log("email2", prevLastKey, prevKey)
                // }
                let values = getValues(sourceFile[i], lastKey, prevLastKey, i);
                if (!result.length) {
                    result.push(...values);
                } else if (i && prevLastKey && i === prevLastKey) {
                    console.log("values",values)
                    result.push(...values);
                } else {
                    result.push("@#@");
                }
                result = [...new Set(result)];
            }
        }
    }
    return result;
}

function copySourceValue(pendingFileJson, sourceFile, pendingTranslateKeys) {
    if (pendingTranslateKeys) {
        pendingTranslateKeys.forEach(keys => {
            keys = keys.split(".");
            let lastKey = keys.pop();
            let obj = getKeyValue(pendingFileJson, keys);
            if (typeof obj === "object" && typeof obj[lastKey] === "string") {
                let values = getValues(sourceFile, lastKey, keys[keys.length - 1]);
                // console.log("obj", lastKey, values)
                if (values) {
                    obj[lastKey] = values.join("@#@");
                }
            }
        })
    }
}