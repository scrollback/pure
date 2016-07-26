/* @flow */

import { PropTypes } from 'react';

export default PropTypes.shape({
	observe: PropTypes.func.isRequired,
	dispatch: PropTypes.func.isRequired,
	addMiddleware: PropTypes.func.isRequired,
	on: PropTypes.func.isRequired,
});
