"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const logger = (0, logger_1.createLogger)('Client');
/**
 * {
        if (this.webSocket.readyState !== WebSocket.OPEN) {
            return logger.warn(`Attempted to send a message on a closed Client`);
        }
        this.webSocket.send(JSON.stringify(message));
    }
 */ 
