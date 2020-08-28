const fs = require("fs-extra");

//待处理文件路径
const dir = "./locales";
//输出文件路径
const outputDir = "./output";
// 待处理语言中文路径
const basicFile = `${dir}/zh-cn.json`;
// 参考中文路径
const basicZhFile = `${dir}/source/zh-cn.json`;
// 待处理语言文件
const pendingFile = `${dir}/en-us.json`;
// 参考语言文件
const sourceFile = `${dir}/source/en-us.json`;
// 输出文件名称
const outputPendingFile = `${outputDir}/en-us.json`;

let pendingTranslateKeys = [];
let parentKey = [];

let basicFileJson = fs.readJsonSync(basicFile);
let pendingFileJson = fs.readJsonSync(pendingFile);
let sourceFileJson = fs.readJsonSync(sourceFile);
let basicZhFileJson = fs.readJsonSync(basicZhFile);

compareJson(basicFileJson, pendingFileJson, parentKey, false);
copySourceValue(pendingFileJson, basicZhFileJson, basicFileJson, sourceFileJson, pendingTranslateKeys);
// console.log("pendingFileJson", pendingFileJson);

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

function getTextParentIds(basicZhFileJson, text, parentIds) {
    let result = [];
    for (var i in basicZhFileJson) {
        // result = [...parentIds] || [];
        let value = basicZhFileJson[i];
        if (text === value && !result.length) {
            // console.log(text,value,i)
            let newIds = [...parentIds, i].join(".");
            result.push(newIds);
        } else if (typeof value === "object") {
            // let oldIds = [...result, i].join(".");
            let ids = getTextParentIds(value, text, [...parentIds, i]);
            if (ids && ids.length) {
                // console.log("ids", ids,text)
                // result = [i, ...ids];
                result.push(ids.join("."));
            }
        }
    }
    return result;
}

function getValues(basicZhFileJson, basicFileJson, sourceFileJson, text) {
    let parentIds = getTextParentIds(basicZhFileJson, text, []);
    if (!parentIds || !parentIds.length) {
        return text;
    } else {
        let texts = parentIds.reduce((prevTexts, id) => {
            let ids = id.split(".");
            prevTexts.push(getKeyValue(sourceFileJson, ids));
            return prevTexts;
        }, []);
        texts = texts.filter(Boolean);
        let uniqueText = [...new Set(texts)];
        if (texts.length) {
            return uniqueText.join("@#@");
        } else {
            return text;
            // let zhTexts = parentIds.reduce((prevTexts, id) => {
            //     let ids = id.split(".");
            //     prevTexts.push(getKeyValue(basicFileJson, ids));
            //     return prevTexts;
            // }, []);
            // zhTexts = zhTexts.filter(Boolean);
            // let uniqueText = [...new Set(zhTexts)];
            // return uniqueText.join("@#@");
            // return "TODO 手动查找"
        }
    }
    // console.log("parentIds", parentIds, text);

    // for (var i in sourceFile) {
    //     if (i === lastKey) {
    //         if (typeof sourceFile[i] === "string") {
    //             if (result.indexOf(sourceFile[i]) == -1) {
    //                 if (!result.length) {
    //                     result.push(sourceFile[i]);
    //                 } else if (prevKey && prevLastKey && prevKey === prevLastKey) {
    //                     result.push(sourceFile[i]);
    //                 }
    //             }
    //         }
    //     } else {
    //         if (typeof sourceFile[i] === "object") {
    //             let values = getValues(sourceFile[i], lastKey, prevLastKey, i);
    //             if (!result.length) {
    //                 result.push(...values);
    //             } else if (i && prevLastKey && i === prevLastKey) {
    //                 console.log("values", values)
    //                 result.push(...values);
    //             } else if (values && values.length) {
    //                 console.log("values", values)
    //                 result.push("@#@");
    //             }
    //             result = [...new Set(result)];
    //         }
    //     }
    // }
    // return result;
}

function copySourceValue(pendingFileJson, basicZhFileJson, basicFileJson, sourceFileJson, pendingTranslateKeys) {
    if (pendingTranslateKeys) {
        pendingTranslateKeys.forEach(keys => {
            keys = keys.split(".");
            let zhKey = [...keys];
            let lastKey = keys.pop();
            let obj = getKeyValue(pendingFileJson, keys);
            let zhText = getKeyValue(basicFileJson, zhKey);
            if (typeof obj === "object" && typeof obj[lastKey] === "string" && zhText) {

                let value = getValues(basicZhFileJson, basicFileJson, sourceFileJson, zhText);
                // let values = getValues(sourceFile, lastKey, keys[keys.length - 1]);
                if (value) {
                    obj[lastKey] = value;
                }
            }
        })
    }
}


// function getValues(sourceFile, lastKey, prevLastKey, prevKey) {
//     let result = [];
//     for (var i in sourceFile) {
//         // if (lastKey === "searchQueueNameTip") {
//         //     console.log("searchQueueNameTip", i);
//         // }
//         if (i === lastKey) {

//             if (typeof sourceFile[i] === "string") {
//                 if (result.indexOf(sourceFile[i]) == -1) {
//                     if (!result.length) {
//                         result.push(sourceFile[i]);
//                     } else if (prevKey && prevLastKey && prevKey === prevLastKey) {
//                         result.push(sourceFile[i]);
//                     }
//                 }
//             }
//         } else {
//             if (typeof sourceFile[i] === "object") {
//                 // if (lastKey === "email") {
//                 //     console.log("email2", prevLastKey, prevKey)
//                 // }
//                 let values = getValues(sourceFile[i], lastKey, prevLastKey, i);
//                 if (!result.length) {
//                     result.push(...values);
//                 } else if (i && prevLastKey && i === prevLastKey) {
//                     console.log("values", values)
//                     result.push(...values);
//                 } else if (values && values.length) {
//                     console.log("values", values)
//                     result.push("@#@");
//                 }
//                 result = [...new Set(result)];
//             }
//         }
//     }
//     return result;
// }