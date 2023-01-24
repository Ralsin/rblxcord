const fs = require('fs-extra')
const chip = require('child_process')
const package = require('../package.json')
exports.default = async () => {
    const path = `./dist/rblxcord-${package.version}`
    fs.removeSync('./dist/win-unpacked/resources/elevate.exe')
    if (fs.existsSync(path))
        fs.removeSync(path)
    try {
        fs.renameSync('./dist/win-unpacked', path)
    } catch (e) {
        throw new Error("Renaming error! fs.rename couldn't do the thing. If you're running building through PowerShell it wont work, use cmd instead!")
    }
    chip.exec(`7z a -tzip ${path}.zip ${path}`)
    chip.exec(`7z d ${path}.zip */*/elevate.exe`) // cuz for some reason fs doesnt bother to delete it before packing bruh
    // chip.execSync(`7z d ${path}.zip win-unpacked rblxcord-${package.version}`)
}