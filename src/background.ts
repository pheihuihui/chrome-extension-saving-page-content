// let port = chrome.runtime.connect({ name: "contentscript" })

const MENU_SAVING_CONTENT = "menu-saving-content"

const config = {
    serverAddress: "http://localhost:3000",
    apiKey: "",
}

chrome.storage.sync.get({ serverAddr: "http://192.168.1.100", apiKey: "xxxxx" }, (items) => {
    config.serverAddress = items.serverAddr
    config.apiKey = items.apiKey
})

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        contexts: ["page", "image"],
        id: MENU_SAVING_CONTENT,
        title: "Save Content",
    })
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {})

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    if (info.menuItemId == MENU_SAVING_CONTENT) {
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            if (tabs && tabs[0] && tabs[0].id) {
                console.log(info)
                if (info.mediaType && info.mediaType == "image") {
                    if (!info.srcUrl) {
                        return
                    }
                    fetch(info.srcUrl)
                        .then(async (response) => {
                            console.log(config)
                            let blob = await response.blob()
                            let data = new FormData()
                            data.append("assetData", blob, "image.png")
                            data.append("deviceId", "deviceAssetId")
                            data.append("deviceAssetId", "deviceAssetId")
                            let datestr = new Date().toISOString()
                            data.append("fileCreatedAt", datestr)
                            data.append("fileModifiedAt", datestr)
                            return fetch(config.serverAddress + "/api/assets", {
                                method: "POST",
                                body: data,
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                    "x-api-key": config.apiKey,
                                    Accept: "application/json",
                                },
                            })
                        })
                        .then(console.log)
                    chrome.tabs.sendMessage(tabs[0].id, { type: "saving-content", contentType: "image", data: info.srcUrl })
                } else {
                    let data = await getContentFromCurrentPage(tabs[0].id)
                    chrome.tabs.sendMessage(tabs[0].id, { type: "saving-content", contentType: "page", data: data })
                }
            }
        })
    }
})

async function getContentFromCurrentPage(tabid: number) {
    return new Promise<string>((resolve, reject) => {
        chrome.pageCapture.saveAsMHTML({ tabId: tabid }, async (data) => {
            if (data?.size) {
                let txt = await data.text()
                resolve(txt)
            } else {
                reject("no data")
            }
        })
    })
}
