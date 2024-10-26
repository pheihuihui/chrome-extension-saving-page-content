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
        if (message.state == "pending_fetch") {
            setTimeout(() => {
                blink()
            }, 100)
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

function blink() {
    let blink = document.createElement("div")
    blink.style.position = "fixed"
    blink.style.top = "10px"
    blink.style.left = "10px"
    blink.style.bottom = "10px"
    blink.style.right = "10px"
    blink.style.zIndex = "9999"
    blink.style.borderRadius = "25px"
    blink.style.boxShadow = "0 0 10px 10px #4caa98"
    blink.style.backgroundColor = "transparent"
    document.body.appendChild(blink)
    setTimeout(() => {
        document.body.removeChild(blink)
    }, 500)
}
