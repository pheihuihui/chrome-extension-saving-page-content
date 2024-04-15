chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type && message.type == "saving-content") {
        if (message.contentType && message.contentType == "image") {
            fetch(message.data)
                .then(async (response) => {
                    let blob = await response.blob()
                    let base64 = await blob2base64(blob)
                    let obj = { type: "saving-content", contentType: "image", data: base64 }
                    let str = JSON.stringify(obj)
                    navigator.clipboard.writeText(str)
                })
                .then(() => {
                    window.open("http://localhost:8080/desq/#/new-image")
                })
        } else if (message.contentType && message.contentType == "page") {
            let obj = { type: "saving-content", contentType: "page", data: message.data, link: document.URL }
            let str = JSON.stringify(obj)
            navigator.clipboard.writeText(str).then(() => {
                window.open("http://localhost:8080/desq/#/new-page")
            })
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
