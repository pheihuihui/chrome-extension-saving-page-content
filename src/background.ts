import { CONFIG, IMessage, MENU_SAVING_IMAGE, MENU_SAVING_PAGE } from "./message"

chrome.storage.sync.get({ serverAddr: "http://192.168.1.100", apiKey: "xxxxx", albumId: "" }, (items) => {
    CONFIG.serverAddress = items.serverAddr
    CONFIG.apiKey = items.apiKey
    CONFIG.albumId = items.albumId
})

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        contexts: ["image"],
        id: MENU_SAVING_IMAGE,
        title: "Save Image",
    })
    chrome.contextMenus.create({
        contexts: ["page"],
        id: MENU_SAVING_PAGE,
        title: "Save Page",
    })
})

const RELOAD_URL = "http://reload-this-extension/"

async function saveImageFromContent(message: IMessage<"pending_background">) {
    let data = new FormData()
    let timestamp = Date.now()
    if (!message.data?.mimeType || !message.data?.imageBlobStr) {
        return
    }
    let extensionName = message.data.mimeType.split("/")[1]
    let filename = `${timestamp}.${extensionName}`
    let blob = await fetch(message.data?.imageBlobStr).then((res) => res.blob())
    data.append("assetData", blob, filename)
    data.append("deviceId", "deviceAssetId")
    data.append("deviceAssetId", "deviceAssetId")
    let datestr = new Date().toISOString()
    data.append("fileCreatedAt", datestr)
    data.append("fileModifiedAt", datestr)
    return fetch(CONFIG.serverAddress + "/api/assets", {
        method: "POST",
        body: data,
        headers: {
            "x-api-key": CONFIG.apiKey,
            Accept: "application/json",
        },
    })
        .then((x) => x.json())
        .then((x) => {
            if (x && x.id) {
                let data = JSON.stringify({
                    ids: [x.id],
                })
                return fetch(CONFIG.serverAddress + `/api/albums/${CONFIG.albumId}/assets`, {
                    method: "PUT",
                    body: data,
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": CONFIG.apiKey,
                        Accept: "application/json",
                    },
                })
            }
            return
        })
        .then(console.log)
}

async function saveImageFromBlob(blob: Blob) {
    let data = new FormData()
    let timestamp = Date.now()
    let extensionName = "png"
    let filename = `page_${timestamp}.${extensionName}`
    data.append("assetData", blob, filename)
    data.append("deviceId", "deviceAssetId")
    data.append("deviceAssetId", "deviceAssetId")
    let datestr = new Date().toISOString()
    data.append("fileCreatedAt", datestr)
    data.append("fileModifiedAt", datestr)
    return fetch(CONFIG.serverAddress + "/api/assets", {
        method: "POST",
        body: data,
        headers: {
            "x-api-key": CONFIG.apiKey,
            Accept: "application/json",
        },
    })
        .then((x) => x.json())
        .then((x) => {
            if (x && x.id) {
                let data = JSON.stringify({
                    ids: [x.id],
                })
                return fetch(CONFIG.serverAddress + `/api/albums/${CONFIG.albumId}/assets`, {
                    method: "PUT",
                    body: data,
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": CONFIG.apiKey,
                        Accept: "application/json",
                    },
                })
            }
            return
        })
        .then(console.log)
}

chrome.contextMenus.onClicked.addListener(function (info, _tab) {
    if (info.menuItemId == MENU_SAVING_IMAGE) {
        chrome.tabs
            .query({ active: true, currentWindow: true })
            .then((tabs) => {
                if (tabs && tabs[0] && tabs[0].id) {
                    if (info.mediaType && info.mediaType == "image") {
                        if (!info.srcUrl) {
                            return
                        }
                        let message: IMessage<"pending_fetch"> = {
                            contentType: "image",
                            state: "pending_fetch",
                            data: { imageUrl: info.srcUrl },
                        }
                        return {
                            tab: tabs[0],
                            message: message,
                        }
                    }
                }
            })
            .then((res) => {
                if (res && res.message.contentType && res.message.contentType == "image" && res.tab.id) {
                    return chrome.tabs.sendMessage<IMessage<"pending_fetch">>(res.tab.id, res.message)
                }
                return
            })
            .then((resp: IMessage<"pending_background">) => {
                return saveImageFromContent(resp)
            })
        return true
    } else if (info.menuItemId == MENU_SAVING_PAGE) {
        chrome.tabs
            .captureVisibleTab({ quality: 100, format: "png" })
            .then(fetch)
            .then((resp) => {
                return resp.blob()
            })
            .then((blb) => {
                let message: IMessage<"pending_fetch"> = {
                    contentType: "page",
                    state: "pending_fetch",
                }
                let tabid = _tab?.id
                if (!tabid) {
                    return
                }
                chrome.tabs.sendMessage<IMessage<"pending_fetch">>(tabid, message)
                return saveImageFromBlob(blb)
            })
            .then(console.log)
        return true
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

chrome.tabs.onUpdated.addListener(function (tabId, info) {
    console.log(info.url)
    if (info.url == RELOAD_URL) {
        chrome.tabs.remove(tabId)
        chrome.runtime.reload()
    }
})
