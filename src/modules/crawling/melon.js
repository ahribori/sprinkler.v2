import log from '@logger';
import jsdom from 'jsdom';
import axios from 'axios';

const { JSDOM } = jsdom;

export const getMelonCharts = async () => {
    log.info('[crawling/melon - getMelonCharts] GET https://www.melon.com/chart/index.htm');
    const response = await axios.get('https://www.melon.com/chart/index.htm');
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const melon_chart_rows = document.querySelectorAll('form#frm table tr');
    const chart = [];
    for (let i = 1; i <= 100; i++) {
        const row = melon_chart_rows[i];
        const song = {};

        // 멜론 곡 id
        song.id = row.getAttribute('data-song-no');
        // 멜론 차트 순위
        song.rank = row.querySelector('span.rank').innerHTML;
        // 곡 제목
        song.title = row.querySelector('td:nth-child(6) div.ellipsis.rank01 a').innerHTML;
        // 아티스트
        song.artist = row.querySelector('td:nth-child(6) div.ellipsis.rank02 a').innerHTML;
        // 앨범
        song.album = row.querySelector('td:nth-child(7) a').innerHTML;

        chart.push(song);
    }
    log.info(`[crawling/melon - getMelonCharts] chart.length: ${chart.length}`);
    return chart;
};

export const getSongDetailsById = async songId => {
    log.info(`[crawling/melon - getSongDetailsById] GET https://www.melon.com/song/detail.htm?songId=${songId}`);
    const response = await axios.get(`https://www.melon.com/song/detail.htm?songId=${songId}`);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    const songDetails = {};

    // 멜론 곡 id
    songDetails.id = songId;
    // 곡 제목
    document.querySelector('#downloadfrm div.song_name > strong').remove();
    songDetails.title = document.querySelector('#downloadfrm div.song_name').innerHTML
        .replace(/\t/g, '').replace(/\n/g, '');
    // 아티스트
    songDetails.artist = document.querySelector('#downloadfrm div.artist > a > span:nth-child(1)').innerHTML;
    // 앨범
    songDetails.album = document.querySelector('#downloadfrm div.meta > dl > dd:nth-child(2) > a').innerHTML;
    // 발매일
    songDetails.releaseDate = document.querySelector('#downloadfrm div.meta > dl > dd:nth-child(4)').innerHTML;
    // 장르
    songDetails.genre = document.querySelector('#downloadfrm div.meta > dl > dd:nth-child(6)').innerHTML;
    // 썸네일 이미지
    songDetails.thumbnail_image = document.querySelector('.thumb img').getAttribute('src');
    // 가사
    songDetails.lyric = document.querySelector('#d_video_summary').innerHTML
        .replace(/<!--.+-->/gi, '')
        .replace(/\t/g, '').replace(/\n/g, '');

    // 작사,작곡,편곡
    songDetails.producers = [];
    const producerList = document.querySelectorAll('.section_prdcr ul.list_person li');
    for (let i = 0, length = producerList.length; i < length; i++) {
        const producer_li = producerList[i];
        const name = producer_li.querySelector('.entry .artist a').innerHTML;
        const type = producer_li.querySelector('.meta > .type').innerHTML;
        const thumbnail_image = producer_li.querySelector('.thumb img').getAttribute('src');
        songDetails.producers.push({
            name,
            type,
            thumbnail_image,
        })
    }
    log.info(`[crawling/melon - getSongDetailsById] songDetails: `, songDetails);
    return songDetails;
};