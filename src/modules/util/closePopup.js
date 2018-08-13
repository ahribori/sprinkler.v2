export const closePopup = async (browser) => {
    const mainTabId = await browser.getCurrentTabId();
    const tabIds = await browser.getTabIds();
    for (let i = 0, count = tabIds.length; i < count; i++) {
        if (tabIds[i] !== mainTabId) {
            await browser.switchTab(tabIds[i]);
            await browser.close();
        }
    }
};
