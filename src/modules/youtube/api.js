import config from '@config';
import request from 'axios';

const KEY = config.youtube.api_key || 'AIzaSyCEWVsRNMbuO9wW7ifrbHFEAxTJtUBszL0';

export const searchByKeyword = async (keyword) => {
    if (!KEY || !keyword || KEY === '' || keyword === '') {
        throw new Error('YOUTUBE_KEY and YOUTUBE_SEARCH_KEYWORD are required');
    }
    const q = encodeURIComponent(keyword);
    const query = `https://www.googleapis.com/youtube/v3/search?key=${KEY}&part=id&type=video&q=${q}`;
    const response = await request.get(query);
    return response.data.items;
};