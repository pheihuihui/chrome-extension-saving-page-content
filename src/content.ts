chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type && message.type == "saving-content") {
        if (message.contentType && message.contentType == "image") {
            // fetch(message.data).then(async (response) => {
            //     let blob = await response.blob()
            //     let data = new FormData()
            //     data.append("assetData", blob, "image.png")
            //     data.append("deviceId", "deviceAssetId")
            //     data.append("deviceAssetId", "deviceAssetId")
            //     let datestr = new Date().toISOString()
            //     data.append("fileCreatedAt", datestr)
            //     data.append("fileModifiedAt", datestr)
            //     return fetch(config.serverAddress + "/api/assets", {
            //         method: "POST",
            //         body: data,
            //         headers: {
            //             "Content-Type": "multipart/form-data",
            //             "x-api-key": config.apiKey,
            //             Accept: "application/json",
            //         },
            //     })
            // })
        } else if (message.contentType && message.contentType == "page") {
            let obj = { type: "saving-content", contentType: "page", data: message.data, link: document.URL }
            let str = JSON.stringify(obj)
            console.log(str)
        }
    }
})

function blob2base64(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = () => {
            resolve(reader.result as string)
        }
        reader.onerror = () => {
            reject("error")
        }
        reader.readAsDataURL(blob)
    })
}
