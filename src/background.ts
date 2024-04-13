// let port = chrome.runtime.connect({ name: "contentscript" })

const MENU_SAVING_CONTENT = "menu-saving-content"

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        contexts: ["page", "frame", "image"],
        id: MENU_SAVING_CONTENT,
        title: "Save Content",
    })
})

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    if (info.menuItemId == MENU_SAVING_CONTENT) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs && tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: "saving-image", src: info.srcUrl })
            }
        })
    }
})

async function getContentFromCurrentPage(tabid: number) {
    return new Promise<string>((resolve, reject) => {
        chrome.pageCapture.saveAsMHTML({ tabId: tabid }, async (data) => {
            if (data?.size) {
                // let txt = await data.text()
                resolve(data.size.toString())
            } else {
                reject("no data")
            }
        })
    })
}
