import { IMessage } from "./message"

chrome.runtime.onMessage.addListener(async function (message: IMessage<"pending_fetch">, _sender, sendResponse) {
    if (message.contentType && message.contentType == "image") {
        if (message.state == "pending_fetch") {
            if (message.data && message.data.imageUrl) {
                let res = await fetch(message.data.imageUrl)
                let blob = await res.blob()
                let blobstr = await blob2base64(blob)
                let resp: IMessage<"pending_background"> = {
                    contentType: "image",
                    state: "pending_background",
                    data: { imageBlobStr: blobstr, mimeType: blob.type },
                }
                console.log(resp)
                sendResponse(resp)
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
