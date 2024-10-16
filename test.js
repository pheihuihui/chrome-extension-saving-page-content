import axios from "axios"
import FormData from "form-data"
import { createReadStream } from "fs"
let data = new FormData()
data.append("assetData", createReadStream("./src/icons/icon48.png"))
data.append("deviceId", "deviceAssetId")
data.append("deviceAssetId", "deviceAssetId")
let datestr = new Date().toISOString()
data.append("fileCreatedAt", datestr)
data.append("fileModifiedAt", datestr)

// console.log(data.getHeaders())

let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "http://192.168.1.1:2283/api/assets",
    headers: {
        "Content-Type": "multipart/form-data",
        "x-api-key": "zzzzzzzzzzzzzzzzzzzzzzzzzz",
        Accept: "application/json",
        ...data.getHeaders(),
    },
    data: data,
}

// axios
//     .request(config)
//     .then((response) => {
//         console.log(JSON.stringify(response.data))
//     })
//     .catch((error) => {
//         console.log(error)
//     })
