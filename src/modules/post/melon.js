import path from 'path';
import fs from 'fs';
import { minify } from 'html-minifier';
import { searchByKeyword } from '../youtube/api';

const producerMarkup = `
<li>
    <div class="produce_thumb">
        <img src="{{thumbnail_image}}"
             alt="{{alt}}">
    </div>
    <div class="produce_info">
        <div class="produce_name">{{producer_name}}</div>
        <div class="produce_type">{{producer_type}}</div>
    </div>
</li>
`;

const buildProducersMarkup = (producers) => {
    let html = '';

    producers.forEach(producer => {
        html += producerMarkup
            .replace('{{thumbnail_image}}',
                producer.thumbnail_image === 'https://cdnimg.melon.co.kr' ?
                    `${producer.thumbnail_image}/resource/image/web/default/noArtist_60.jpg` :
                    producer.thumbnail_image)
            .replace('{{alt}}', producer.name)
            .replace('{{producer_name}}', producer.name)
            .replace('{{producer_type}}', producer.type);
    });

    return html;
};

export const buildMelonPost = async (songDetails) => {
    const youtube_search_result = await searchByKeyword(`${songDetails.artist} ${songDetails.title} (official)`);
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
        .replace('{{videoId}}', videoId)
        .replace('{{producers}}', buildProducersMarkup(songDetails.producers));

    const minifyOptions = {
        minifyCSS: true,
        collapseWhitespace: true,
    };

    return minify(template, minifyOptions);
};