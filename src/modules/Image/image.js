import request from 'axios';
import fs from 'fs';
import path from 'path';

const IMAGE_STORE_PATH = path.resolve('store/images');
fs.existsSync(IMAGE_STORE_PATH) || fs.mkdirSync(IMAGE_STORE_PATH);

export const downloadImage = async (url, saveName) => {
    if (!url || url === '') {
        throw new Error(`Invalid parameter 'url' : ${url}`);
    }
    if (!saveName || saveName === '') {
        throw new Error(`Invalid parameter 'saveName' : ${saveName}`);
    }

    const response = await request.get(url, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];

    if (!new RegExp(/image\/(jpg|jpeg|gif|png)/).test(contentType)) {
        throw new Error(`Invalid Content-Type : ${contentType}`);
    }

    const extension = contentType.replace(/image\//, '').replace(/jpeg/, 'jpg');

    const base64Encoded = new Buffer(response.data, 'binary').toString('base64');
    fs.writeFileSync(path.join(IMAGE_STORE_PATH, `/${saveName}.${extension}`), base64Encoded, 'base64');
};