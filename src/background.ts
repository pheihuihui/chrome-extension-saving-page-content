import { APP_NAME, CONFIG, IMessage, MENU_SAVING_CONTENT, PORT_NAME } from "./message"

chrome.storage.sync.get({ serverAddr: "http://192.168.1.100", apiKey: "xxxxx" }, (items) => {
    CONFIG.serverAddress = items.serverAddr
    CONFIG.apiKey = items.apiKey
})

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        contexts: ["page", "image"],
        id: MENU_SAVING_CONTENT,
        title: APP_NAME,
    })
})

async function saveImage(message: IMessage<"pending_background">) {
    let data = new FormData()
    let timestamp = Date.now()
    let extensionName = message.data.mimeType.split("/")[1]
    let filename = `${timestamp}.${extensionName}`
    let blob = await fetch(message.data.imageBlobStr).then((res) => res.blob())
    console.log(blob)
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
        .then(console.log)
}

chrome.contextMenus.onClicked.addListener(function (info, _tab) {
    if (info.menuItemId == MENU_SAVING_CONTENT) {
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
                return saveImage(resp)
            })
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
