import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;
const API_KEY = Constants.expoConfig?.extra?.API_KEY;

export const searchGifs = async (query) => {
    try {
        if (!API_KEY) {
            console.warn('GIPHY API key not configured');
            return [];
        }
        const response = await fetch(`${API_URL}/gifs/search?api_key=${API_KEY}&q=${query}&limit=10`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error searching gifs:', error);
        return [];
    }
};