/* eslint-disable import/no-commonjs, no-console, prefer-const */

'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const crypto = require('crypto');
const child_process = require('child_process');
const pack = require('../node_modules/react-native/package.json');

const SSH_HOST_PROD = 'ubuntu@52.76.69.167';
const SSH_HOST_DEV = 'ubuntu@52.77.64.21';
const SSH_HOST = process.argv.indexOf('--prod') > -1 ? SSH_HOST_PROD : SSH_HOST_DEV; // The server user and host
const SSH_PATH = '/home/ubuntu/pure/static/bundles/android/'; // The server user and host
const BUNDLE_NAME = 'index.android.bundle'; // Name of the bundle
const GRADLE_PATH = __dirname + '/../android/app/build.gradle'; // Path to the gradle configuration

const log = {
	i(description, details) {
		console.log(chalk.gray(description), typeof details !== 'undefined' ? chalk.bold(details) : '');
	},

	e(description, details) {
		console.log(chalk.red(description), typeof details !== 'undefined' ? chalk.bold(details) : '');
	}
};

const metadata = {
	filename: BUNDLE_NAME
};

// Read the gradle configuration
log.i('Reading gradle configuration', GRADLE_PATH);

const lines = fs.readFileSync(GRADLE_PATH).toString().split('\n');

// Extract the version number and version code
for (let line of lines) {
	if (/versionName/.test(line)) {
		// Version name should be changed whenever any native APIs change
		metadata.version_name = line.trim().split(' ')[1].replace(/('|")/g, '');

		log.i('Found version name', metadata.version_name);
	} else if (/versionCode/.test(line)) {
		metadata.version_code = parseInt(line.trim().split(' ')[1], 10);

		log.i('Found version code', metadata.version_code);
	}

	if (metadata.version_name && metadata.version_code) {
		break;
	}
}

metadata.react_native_version = pack.version; // React native version may be useful in determining compatibility

log.i('Found React Native version', metadata.react_native_version);

// Timestamp can be used to determine if bundle is newer
metadata.timestamp = Date.now();

// Create the bundles directory and copy the bundle
const assetsPath = path.normalize(__dirname + '/../../belong-bundles/android/' + metadata.version_name); // Path to output directory, synced to the server

log.i('Creating new directory', assetsPath);

try {
	fs.mkdirSync(path.dirname(assetsPath));
} catch (e) {
	// Do nothing
}

try {
	fs.mkdirSync(assetsPath);
} catch (e) {
	if (e.code !== 'EEXIST') {
		throw e;
	}
}

// List files in a directory
function listFiles(dir, filelist) {
	const files = fs.readdirSync(dir);

	let list = filelist ? filelist.splice(0) : [];

	files.forEach(file => {
		if (file.indexOf('.') === 0) {
			return;
		}

		const filePath = path.join(dir, file);

		if (fs.statSync(filePath).isDirectory()) {
			list = listFiles(filePath, list);
		} else {
			list.push(filePath);
		}
	});

	return list;
}

log.i('Generating JavaScript bundle', BUNDLE_NAME);

const bundlePath = assetsPath + '/' + BUNDLE_NAME;
const metadataFile = assetsPath + '/metadata.json';

const bundle = child_process.spawn('react-native', [
	'bundle', '--platform', 'android', '--dev', 'false',
	'--entry-file', __dirname + '/../index.android.js',
	'--assets-dest', assetsPath,
	'--bundle-output', bundlePath
]);

bundle.stdout.on('data', d => log.i(d));
bundle.stderr.on('data', d => log.e(d));
bundle.on('exit', code => {
	if (code !== 0) {
		log.e('Failed to generate bundle', code);

		process.exit(code);
	}

	// Read the bundle so that we can generate checksum
	log.i(chalk.gray('Generating checksums for bundle'), chalk.bold(bundlePath));

	const data = fs.readFileSync(bundlePath);

	// Checksums can be used to verify bundle integrity
	metadata.checksum_md5 = crypto.createHash('md5').update(data, 'utf8').digest('hex');
	metadata.checksum_sha256 = crypto.createHash('sha256').update(data, 'utf8').digest('hex');

	// List all the assets
	metadata.assets = listFiles(assetsPath).filter(
		file => !(file.endsWith('metadata.json') || file.endsWith('.bundle'))
	).map(file => {
		const content = fs.readFileSync(file);

		return {
			filename: path.relative(assetsPath, file),
			checksum_md5: crypto.createHash('md5').update(content, 'utf8').digest('hex'),
			checksum_sha256: crypto.createHash('sha256').update(content, 'utf8').digest('hex'),
		};
	});

	log.i('Writing metadata', metadataFile);

	fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2) + '\n', 'utf-8');

	log.i('Uploading files to server', SSH_HOST);

	const upload = child_process.spawn('scp', [ '-r', assetsPath, `${SSH_HOST}:${SSH_PATH}` ]);

	upload.stdout.on('data', d => log.i(d));
	upload.stderr.on('data', d => log.e(d));
	upload.on('exit', c => {
		if (c !== 0) {
			log.e('Failed to upload files', c);

			process.exit(c);
		}

		log.i('Upload complete!');
	});
});
