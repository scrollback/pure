import test from 'ava';
import request from 'request';
import { uploadImageToS3 } from '../uploadToS3';

test.skip('should upload image', async t => {
	let url = 'https://ict4kids.files.wordpress.com/2013/05/mrc-2.png';
	const upload = await uploadImageToS3('someuser', 'avatar', request.get(url));
	t.is(upload.Location, 'https://test-belong.s3-ap-southeast-1.amazonaws.com/uploaded/avatar/someuser/avatar');
});