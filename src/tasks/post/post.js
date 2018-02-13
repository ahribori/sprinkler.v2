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
    await browser.execute((text) => {
        document.querySelector('#titleBox').value = text;
    }, title);
    await browser.execute((text) => {
        document.querySelector('#tx_canvas_source').value = text;
    }, contents);
    await browser.setValue('#tagInput', tags.join(','));
    await browser.pause(2000);
    await browser.click('#visibilityOption .btn_tab.btn_public');
    await browser.click('button.btn_comm.btn_save');
};