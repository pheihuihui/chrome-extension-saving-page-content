chrome.runtime.onConnect.addListener(port => {
    if (port.name == 'contentscript') {
        console.log('connected')
    }
    port.onMessage.addListener(function (msg) {
        port.postMessage(msg.image.src)
    })
})