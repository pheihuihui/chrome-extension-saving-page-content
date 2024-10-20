const saveOptions = () => {
    // @ts-ignore
    const serverAddr = document.getElementById("immichServerAddr")?.value
    // @ts-ignore
    const apiKey = document.getElementById("immichApiKey")?.value
    // @ts-ignore
    const albumId = document.getElementById("immichAlbumId")?.value

    chrome.storage.sync.set({ serverAddr: serverAddr, apiKey: apiKey, albumId: albumId })
}

const restoreOptions = () => {
    chrome.storage.sync.get({ serverAddr: "http://192.168.1.100", apiKey: "xxxxx", albumId: "" }, (items) => {
        document.getElementById("immichServerAddr")?.setAttribute("value", items.serverAddr)
        document.getElementById("immichApiKey")?.setAttribute("value", items.apiKey)
        document.getElementById("immichAlbumId")?.setAttribute("value", items.albumId)
    })
}

document.addEventListener("DOMContentLoaded", restoreOptions)
document.getElementById("save")?.addEventListener("click", saveOptions)
