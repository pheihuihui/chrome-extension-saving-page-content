// let port = chrome.runtime.connect({ name: "contentscript" })

const MENU_SAVING_CONTENT = "menu-saving-content"

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
