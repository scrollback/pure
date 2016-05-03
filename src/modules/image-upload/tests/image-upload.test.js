import test from 'ava';
import { getResponse } from './../image-upload';

test('generate policies for "content" type upload', t => {
	const req = {
		auth: {
			user: 'harish'
		},
		uploadType: 'content',
		textId: 'df37y32-h87er-efewrywe-we'
	};
	getResponse(req);
	t.true(typeof req.response === 'object');
	t.is(req.response.acl, 'public-read');
});
