import request from 'axios';
import fs from 'fs';
import path from 'path';

import { downloadImage } from '../modules/Image/image';

test('Test downloadImage module', async () => {
    const url = 'https://cdnimg.melon.co.kr/svc/images/main/imgUrl20180801064436.jpg/melon/quality/80';
    await downloadImage(url, 'downloaded_image');
});


test('Test download image', async () => {
    const url = 'https://cdnimg.melon.co.kr/svc/images/main/imgUrl20180801064436.jpg/melon/quality/80';
    const response = await request.get(url, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];
    const extension = contentType.replace(/image\//, '').replace(/jpeg/, 'jpg');

    expect(contentType).toMatch(/image\/(jpg|jpeg|gif|png)/);
    expect(extension).toMatch(/(jpg|jpeg|gif|png)/);

    const base64Encoded = new Buffer(response.data, 'binary').toString('base64');
    fs.writeFileSync(path.join(`store/images/test.${extension}`), base64Encoded, 'base64');

});

