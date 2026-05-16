import axios from 'axios';

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

export async function fetchDepots() {
    const response = await axios.get(`${BASE_URL}/depots`, { headers: getHeaders() });
    return response.data;
}

export async function fetchVehicles() {
    const response = await axios.get(`${BASE_URL}/vehicles`, { headers: getHeaders() });
    return response.data;
}
