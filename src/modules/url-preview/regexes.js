/* @flow */

export default {
	link: /<link[^>]*type[ ]*=[ ]*['|"]application\/json\+oembed['|"][^>]*[>]/i,
	content: /content[ ]*=[ ]*["|'][^"']*/i,
	description: /<meta[^>]*name[ ]*=[ ]*['|"]description['|"][^>]*[>]/i,
	title: /<title.*>[^>]*/i,
	image: /<meta[^>]*property[ ]*=[ ]*['|"]og:image['|"][^>]*[>]/i,
};
