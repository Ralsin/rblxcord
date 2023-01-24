const fs = require('fs-extra')
const blacklist = [
    "./dist/win-unpacked/chrome_200_percent.pak",
    "./dist/win-unpacked/d3dcompiler_47.dll",
    "./dist/win-unpacked/libEGL.dll",
    "./dist/win-unpacked/libGLESv2.dll",
    "./dist/win-unpacked/vk_swiftshader.dll",
    "./dist/win-unpacked/vk_swiftshader_icd.json",
    "./dist/win-unpacked/vulkan-1.dll",
    "./dist/win-unpacked/resources/app-update.yml",
    "./dist/win-unpacked/resources/elevate.exe"
]
exports.default = async () => {
    blacklist.forEach((v) => {
        fs.remove(v)
    })
    fs.readdirSync('./dist/win-unpacked/locales/').forEach(file => {
        if (file != 'en-US.pak') fs.remove('./dist/win-unpacked/locales/' + file)
    })
}