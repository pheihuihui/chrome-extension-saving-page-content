let port = chrome.runtime.connect({ name: "contentscript" })

port.onMessage.addListener(function (msg) {
    console.log(msg)
})

port.postMessage("hello")
