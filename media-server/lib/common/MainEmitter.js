"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainEmitter = void 0;
const events_1 = require("events");
/**
 * Some common global event emitter to make things easier in this app
 */
class MainEmitter extends events_1.EventEmitter {
    constructor() {
        super();
    }
}
exports.MainEmitter = MainEmitter;
;
