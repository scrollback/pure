/* @flow */

import { PropTypes } from 'react';

export default PropTypes.shape({
	observe: PropTypes.func.isRequired,
	put: PropTypes.func.isRequired,
	on: PropTypes.func.isRequired,
});
