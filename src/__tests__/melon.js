import { getMelonCharts, getSongDetailsById } from '../modules/crawling/melon';

let charts = null;

describe('Melon', () => {

    test('getMelonCharts', async () => {
        charts = await getMelonCharts();
        expect(charts.length).toBe(100);
        expect(charts[0].id).toMatch(/\d+/);
    });

    test('getSongDetailsById', async () => {
        const song = charts[0];
        const details = await getSongDetailsById(song.id);
        expect(details.id).toMatch(/\d+/);
        expect(details.lyric.length).toBeGreaterThan(100);
    });

});