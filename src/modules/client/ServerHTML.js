/* @flow */
/* eslint-disable react/no-danger */

import React, { PropTypes } from 'react';

type Props = {
	locale?: string;
	title: string;
	description: string;
	body: string;
	image: string;
	permalink: string;
	styles?: Array<string>;
	analytics: {
		google: string;
		optimizely: string;
	}
};

const ServerHTML = ({
	locale, title, description, body, image, permalink, styles, analytics
}: Props) => (
	<html lang={locale}>
		<head>
			<meta charSet='utf-8' />
			<meta name='viewport' content='width=device-width, user-scalable=no, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0' />
			<meta name='mobile-web-app-capable' content='yes' />
			<meta name='apple-mobile-web-app-capable' content='yes' />

			<meta name='description' content={description} />

			<meta name='twitter:card' content='summary' />
			<meta name='twitter:title' content={title} />
			<meta name='twitter:description' content={description} />
			<meta name='twitter:image' content={image} />

			<meta property='og:type' content='website' />
			<meta property='og:title' content={title} />
			<meta property='og:description' content={description} />
			<meta property='og:image' content={image} />
			<meta property='og:url' content={permalink} />

			<title>{title}</title>

			<link rel='image_src' href={image} />

			{styles ? styles.map(url => (
				<link
					key={url}
					href={url}
					rel='stylesheet'
				/>
			)) : null}

			{analytics.google ?
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;
							i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},
							i[r].l=1*new Date();a=s.createElement(o),
							m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;
							m.parentNode.insertBefore(a,m)})(window,document,'script',
							'https://www.google-analytics.com/analytics.js','ga');

							ga('create', '${analytics.google}', 'auto');
							ga('send', 'pageview');
							`
					}}
				></script> :
				null
			}

			{analytics.optimizely ?
				<script src={`https://cdn.optimizely.com/js/${analytics.optimizely}.js`}></script> :
				null
			}
		</head>
		<body>
			<div id='root' dangerouslySetInnerHTML={{ __html: body }} />
		</body>
	</html>
);

ServerHTML.propTypes = {
	locale: PropTypes.string,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	body: PropTypes.string.isRequired,
	image: PropTypes.string.isRequired,
	permalink: PropTypes.string.isRequired,
	styles: PropTypes.arrayOf(PropTypes.string),
	analytics: {
		google: PropTypes.string,
		optimizely: PropTypes.string,
	},
};

ServerHTML.defaultProps = {
	locale: 'en',
};

export default ServerHTML;
