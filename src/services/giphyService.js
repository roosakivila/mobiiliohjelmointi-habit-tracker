import { env } from '@expo/env';

const API_URL = env.API_URL;
const API_KEY = env.API_KEY;

export const searchGifs = async (query) => {
    try {
        const response = await fetch(`${API_URL}/gifs/search?api_key=${API_KEY}&q=${query}&limit=10`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching gifs:', error);
        return [];
    }
};