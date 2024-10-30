import { buildSync } from "esbuild"
import { copyFileSync, readdirSync, statSync } from "fs"
import { exec } from "child_process"

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

buildSync({
    entryPoints: ["./src/options.ts"],
    platform: "browser",
    treeShaking: true,
    outfile: "./dist/options.js",
    tsconfig: "tsconfig.json",
    bundle: true,
})

copyFileSync("./src/pages/options.html", "./dist/options.html")
copyFileSync("./src/manifests/manifest.json", "./dist/manifest.json")

function listAllFiles(dir) {
    return readdirSync(dir).reduce((files, file) => {
        const name = dir + "/" + file
        const isDirectory = statSync(name).isDirectory()
        return isDirectory ? [...files, ...listAllFiles(name)] : [...files, name]
    }, [])
}

let imgFiles = listAllFiles("./src/icons")

imgFiles.forEach((file) => {
    copyFileSync(file, `./dist/${file.split("/")[3]}`)
})

exec("start http://reload-this-extension/")
