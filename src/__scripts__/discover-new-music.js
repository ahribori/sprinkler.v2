import config from '@config';
import log from '@logger';
import { getMelonCharts, getSongDetailsById } from '../modules/crawling/melon';
import { buildMelonPost } from '../modules/post/melon';
import { save, load } from '../util/store';
import { tistory_oauth2_login } from '../modules/login/tistory';
import { postToTistoryByAccessToken } from '../modules/post/post';
import { run } from '../selenium';

const cron = require('cron').CronJob;

const STORE_NAME = `melon_blog_discover_new_music`;
const { discover_new_music } = config.tistory;

const job = new cron('0 0 8-23 * * *', () => {
    const minutesTimeoutRange = 30;
    const secondTimeoutRange = 60;
    const randomTimeoutMinutes = Math.round(Math.random() * (minutesTimeoutRange - 1));
    const randomTimeoutSecond = Math.round(Math.random() * (secondTimeoutRange - 1));
    const timeout = ((randomTimeoutMinutes * 60) + (randomTimeoutSecond)) * 1000;
    log.info('[discover-new-music]', `${randomTimeoutMinutes}분 ${randomTimeoutSecond}초 후에 실행.`);

    setTimeout(() => {
        run(async browser => {

            const makeStoreModelBySong = song => ({
                title: song.title,
                artist: song.artist,
                created_at: Date.now(),
            });

            const post = async songId => {
                const songDetails = await getSongDetailsById(songId);
                const html = await buildMelonPost(songDetails);

                const auth = await tistory_oauth2_login({
                    blog_identifier: 'discover_new_music',
                    client_id: discover_new_music.client_id,
                    client_secret: discover_new_music.client_secret,
                    id: discover_new_music.id,
                    pw: discover_new_music.pw,
                    redirect_uri: discover_new_music.redirect_uri,
                }, browser);

                await postToTistoryByAccessToken({
                    title: `${songDetails.artist} - ${songDetails.title} [듣기/가사]`,
                    access_token: auth.access_token,
                    content: html,
                    tag: `${songDetails.title},${songDetails.artist},${songDetails.album},${songDetails.genre}`,
                    blogName: 'discover-new-music',
                    visibility: 3,
                    category: 761920,
                });
            };

            try {
                const melonChart = await getMelonCharts();
                const store = load(STORE_NAME);

                if (store) {
                    for (let i = 0, length = melonChart.length; i < length; i++) {
                        const song = melonChart[i];
                        if (!store[song.id]) {
                            await post(song.id);
                            const newStore = store;
                            newStore[song.id] = makeStoreModelBySong(song);
                            save(STORE_NAME, newStore);
                            break;
                        }
                    }
                } else {
                    const song = melonChart[0];
                    await post(song.id);
                    save(STORE_NAME, {
                        [song.id]: makeStoreModelBySong(song),
                    });
                }
            } catch (e) {
                console.log(e);
            }
        });
    }, timeout);
});

job.start();

