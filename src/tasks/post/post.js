import axios from 'axios';
import log from '@logger';

/***
 * 티스토리에 글을 포스팅
 * @param tistoryUrl
 * @param title
 * @param contents
 * @param tags
 * @param browser
 */
export const postToTistory = async (tistoryUrl, title, contents, tags, browser) => {
    /**
     * Need logged in
     */
    await browser.url(`${tistoryUrl}/manage/entry/post`);
    await browser.click('#tx_switchertoggle');
    log.info('[post.postToTistory]', 'click #tx_switchertoggle');
    await browser.execute((text) => {
        document.querySelector('#titleBox').value = text;
    }, title);
    await browser.execute((text) => {
        document.querySelector('#tx_canvas_source').value = text;
    }, contents);
    await browser.pause(3000);
    await browser.setValue('#tagInput', tags.join(','));
    log.info('[post.postToTistory]', 'setValue #tagInput');
    await browser.pause(3000);
    await browser.click('#visibilityOption .btn_tab.btn_public');
    log.info('[post.postToTistory]', 'click #visibilityOption .btn_tab.btn_public');
    await browser.pause(3000);
    await browser.click('button.btn_comm.btn_save');
    log.info('[post.postToTistory]', 'click button.btn_comm.btn_save');
    await browser.pause(5000);
};

export const postToTistoryByAccessToken = async ({ access_token, blogName, title, content, tags }) => {
    try {
        await await axios({
            method: 'POST',
            url: 'https://www.tistory.com/apis/post/write',
            data: {
                access_token,
                blogName,
                title,
                content,
                tags,
            },
        }).then(() => {
            log.info('[post.postToTistoryByAccessToken]', 'success');
        });
    } catch (e) {
        log.error('[post.postToTistoryByAccessToken]', e.message);
    }
};