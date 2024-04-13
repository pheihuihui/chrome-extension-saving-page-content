import { buildSync } from "esbuild"
import { copyFileSync, readdirSync, statSync } from "fs"

buildSync({
    entryPoints: ["./src/background.ts"],
    platform: "browser",
    treeShaking: true,
    outfile: "./dist/background.js",
    tsconfig: "tsconfig.json",
    bundle: true,
})

buildSync({
    entryPoints: ["./src/content.ts"],
    platform: "browser",
    treeShaking: true,
    outfile: "./dist/content.js",
    tsconfig: "tsconfig.json",
    bundle: true,
})

copyFileSync("./src/manifests/manifest.json", "./dist/manifest.json")

function listAllFiles(dir) {
    return readdirSync(dir).reduce((files, file) => {
        const name = dir + "/" + file
        const isDirectory = statSync(name).isDirectory()
        return isDirectory ? [...files, ...listAllFiles(name)] : [...files, name]
    }, [])
}

let imgFiles = listAllFiles("./src/icons")
// let certs = listAllFiles("./src/certs")

imgFiles.forEach((file) => {
    copyFileSync(file, `./dist/${file.split("/")[3]}`)
})

// certs.forEach((file) => {
//     let name = file.split("/")[3]
//     if (name != ".keep") {
//         copyFileSync(file, `./dist/${name}`)
//     }
// })
