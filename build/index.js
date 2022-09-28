"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var child_process_1 = require("child_process");
var discord_rpc_1 = require("discord-rpc");
var node_fetch_1 = __importDefault(require("node-fetch"));
// Activity info, Game / Developer
var ActivityDetails, ActivityState;
// Game Image / Game Id / User Avatar Image / Nickname (@Username)
var LargeImage, LargeText, SmallImage, SmallText;
function Quit() { electron_1.app.quit(); } // TypeScript is dumb
// Silly functions
var latestPlaceId = "none";
function getPlaceId() {
    var _a;
    try {
        var cmd = (0, child_process_1.execSync)('wmic process where "Name=\'RobloxPlayerBeta.exe\'" get /format:csv').toString();
        var placeId = (_a = cmd === null || cmd === void 0 ? void 0 : cmd.split("placeId=")[1]) === null || _a === void 0 ? void 0 : _a.split("&")[0];
        if (!placeId) {
            latestPlaceId = "none";
            return { message: "empty" };
        }
        if (placeId == latestPlaceId)
            return { message: "keep" };
        return {
            message: "update",
            id: placeId
        };
    }
    catch (e) {
        console.log(e);
        console.log('===== Failed to get place id, failsafe message to keep. =====');
        return { message: "keep" };
    }
}
function getJsonFromUrl(url) {
    return __awaiter(this, void 0, void 0, function () {
        var result, data, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, node_fetch_1.default)(url)];
                case 1:
                    result = _a.sent();
                    data = result.json();
                    return [2 /*return*/, data];
                case 2:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [2 /*return*/, { ErrorMessage: "Failed to get result from the following url:\n" + url }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Discord stuff
var Rblxcord;
var dumbLoop;
var RblxcordCon = /** @class */ (function () {
    function RblxcordCon() {
        var _this = this;
        this.isReady = false;
        this.hasActivity = false;
        this.client = new discord_rpc_1.Client({ transport: 'ipc' });
        this.client.once('ready', function () {
            console.log('[DRPC] Connected! Meow!');
            _this.isReady = true;
        });
        this.client.once('disconnected', function () {
            console.log('[DRPC] Disconnected! Meow!');
            _this.destroy();
        });
        this.client.login({ clientId: '983406322924023860' }).catch(function () { _this.destroy(); });
    }
    RblxcordCon.prototype.updateActivity = function () {
        if (!this.isReady)
            return false;
        var activity = {
            details: ActivityDetails,
            state: ActivityState,
            largeImageKey: LargeImage,
            largeImageText: LargeText,
            startTimestamp: new Date()
        };
        this.client.setActivity(activity);
        this.hasActivity = true;
        latestPlaceId = LargeText;
        console.log("[DRPC] Updated status!");
        return true;
    };
    RblxcordCon.prototype.clearActivity = function () {
        if (!this.isReady || !this.hasActivity)
            return;
        this.client.clearActivity();
        this.hasActivity = false;
        console.log("[DRPC] Cleared status!");
    };
    RblxcordCon.prototype.destroy = function () {
        try {
            if (this.isReady) {
                this.client.clearActivity();
                this.client.destroy();
            }
            console.log('boom!');
            clearTimeout(dumbLoop);
            dumbLoop = setTimeout(function () { Rblxcord = new RblxcordCon(); }, 5000);
        }
        catch (e) { }
    };
    return RblxcordCon;
}());
Rblxcord = new RblxcordCon();
// Electron JS stuff to make Tray Menu
// and update info
electron_1.app.disableHardwareAcceleration();
electron_1.app.whenReady().then(function () {
    var ContextMenuItems = [];
    var resourcesPoint = electron_1.app.isPackaged ? './resources/app.asar' : '.';
    ContextMenuItems = [{ label: 'Quit', click: Quit }];
    var tray = new electron_1.Tray(resourcesPoint + '/build/icon.ico');
    tray.setToolTip("Rblxcord");
    // Context menu updating
    setInterval(function () {
        ContextMenuItems = Rblxcord.hasActivity ? [
            { label: ActivityDetails },
            { label: ActivityState },
            { type: 'separator' },
            { label: 'Quit', click: Quit }
        ] : [{ label: 'Quit', click: Quit }];
        tray.setContextMenu(electron_1.Menu.buildFromTemplate(ContextMenuItems));
    }, 1000);
    // Game check and activity update
    setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
        var info, _a, placeData, iconData;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    info = getPlaceId();
                    _a = info.message;
                    switch (_a) {
                        case "update": return [3 /*break*/, 1];
                        case "empty": return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 5];
                case 1: return [4 /*yield*/, getJsonFromUrl("https://www.roblox.com/places/api-get-details?assetId=".concat(info.id))];
                case 2:
                    placeData = _b.sent();
                    return [4 /*yield*/, getJsonFromUrl("https://thumbnails.roblox.com/v1/places/gameicons?placeIds=".concat(info.id, "&size=150x150&format=Png"))];
                case 3:
                    iconData = _b.sent();
                    ActivityDetails = placeData.Name;
                    ActivityState = 'by ' + (placeData.Builder.split('@')[1] || placeData.Builder);
                    LargeImage = iconData.data[0].imageUrl;
                    LargeText = info.id;
                    Rblxcord.updateActivity();
                    return [3 /*break*/, 6];
                case 4:
                    Rblxcord.clearActivity();
                    return [3 /*break*/, 6];
                case 5: return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); }, 5000);
});
//# sourceMappingURL=index.js.map