// let port = chrome.runtime.connect({ name: "contentscript" })

import { IMessage } from "./message"

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

chrome.runtime.onMessage.addListener(function (message: IMessage<"pending_background">, sender, sendResponse) {
    if (message.contentType && message.contentType == "image" && message.state == "pending_background") {
        let data = new FormData()
        let timestamp = Date.now()
        data.append("assetData", message.data.image, "")
        data.append("deviceId", "deviceAssetId")
        data.append("deviceAssetId", "deviceAssetId")
        let datestr = new Date().toISOString()
        data.append("fileCreatedAt", datestr)
        data.append("fileModifiedAt", datestr)
        fetch(config.serverAddress + "/api/assets", {
            method: "POST",
            body: data,
            headers: {
                "x-api-key": config.apiKey,
                Accept: "application/json",
            },
        })
            .then((x) => x.json())
            .then(console.log)
    }
})

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
                            let blob = await response.blob()
                            let datestr = new Date().toISOString()
                            let data = new FormData()
                            data.append("assetData", blob, "zzz.png")
                            data.append("deviceId", "deviceAssetId")
                            data.append("deviceAssetId", "deviceAssetId")
                            data.append("fileCreatedAt", datestr)
                            data.append("fileModifiedAt", datestr)
                            console.log(data)
                            return fetch(config.serverAddress + "/api/assets", {
                                method: "POST",
                                body: data,
                                headers: {
                                    "x-api-key": config.apiKey,
                                    Accept: "application/json",
                                },
                            })
                        })
                        .then((x) => x.json())
                        .then(console.log)
                    chrome.tabs.sendMessage<IMessage<"pending_fetch">>(tabs[0].id, {
                        contentType: "image",
                        state: "pending_fetch",
                        data: { imageUrl: info.srcUrl },
                    })
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
