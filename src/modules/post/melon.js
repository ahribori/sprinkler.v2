import path from 'path';
import fs from 'fs';
import { minify } from 'html-minifier';
import { searchByKeyword } from '../youtube/api';

export const buildMelonPost = async (songDetails) => {
    const youtube_search_result = await searchByKeyword(`${songDetails.artist} ${songDetails.title}`);
    const { videoId } = youtube_search_result[0].id;

    const templatePath = path.resolve('src/modules/post/templates');
    let template = fs.readFileSync(path.join(templatePath, 'melon.html'), 'utf-8');

    template = template
        .replace(/{{artist}}/g, songDetails.artist)
        .replace(/{{title}}/g, songDetails.title)
        .replace('{{album}}', songDetails.album)
        .replace('{{releaseDate}}', songDetails.releaseDate)
        .replace('{{genre}}', songDetails.genre)
        .replace(/{{lyric}}/g, songDetails.lyric)
        .replace('{{thumbnail_image}}', songDetails.thumbnail_image)
        .replace('{{videoId}}', videoId);

    const minifyOptions = {
        minifyCSS: true,
        collapseWhitespace: true,
    };

    return minify(template, minifyOptions);
};