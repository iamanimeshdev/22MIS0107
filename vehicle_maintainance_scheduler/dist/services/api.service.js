"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchDepots = fetchDepots;
exports.fetchVehicles = fetchVehicles;
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://4.224.186.213/evaluation-service';
function getHeaders() {
    const token = process.env.AUTH_TOKEN;
    if (!token) {
        throw new Error('AUTH_TOKEN is missing in environment variables');
    }
    return {
        Authorization: `Bearer ${token}`
    };
}
async function fetchDepots() {
    const response = await axios_1.default.get(`${BASE_URL}/depots`, { headers: getHeaders() });
    return response.data;
}
async function fetchVehicles() {
    const response = await axios_1.default.get(`${BASE_URL}/vehicles`, { headers: getHeaders() });
    return response.data;
}
