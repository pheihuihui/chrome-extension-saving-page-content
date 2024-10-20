import { IMessage } from "./message"

chrome.runtime.onMessage.addListener(function (message: IMessage<"pending_fetch">, _sender, sendResponse) {
    if (message.contentType && message.contentType == "image") {
        if (message.state == "pending_fetch") {
            if (message.data && message.data.imageUrl) {
                fetch(message.data.imageUrl)
                    .then((res) => res.blob())
                    .then((blob) => {
                        return Promise.all([blob.type, blob2base64(blob)])
                    })
                    .then((blobstrs) => {
                        let resp: IMessage<"pending_background"> = {
                            contentType: "image",
                            state: "pending_background",
                            data: { imageBlobStr: blobstrs[1], mimeType: blobstrs[0] },
                        }
                        // chrome.runtime.sendMessage(resp)
                        sendResponse(resp)
                    })
                console.log(message)
                return true
            }
        }
    } else if (message.contentType && message.contentType == "page") {
        let obj = { type: "saving-content", contentType: "page", data: message.data, link: document.URL }
        let str = JSON.stringify(obj)
        console.log(str)
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
