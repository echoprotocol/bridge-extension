import React from 'react';
import PropTypes from 'prop-types';
import { svgAvatar } from 'echojs-ping';

import avatar from '../../assets/images/default-avatar.svg';

class Avatar extends React.Component {


	render() {
		const { name, size } = this.props;
		return name ?
			<div
				className="avatar-image"
				dangerouslySetInnerHTML={{ __html: svgAvatar(name, size) }}
			/> :
			<img
				src={avatar}
				alt="avatar"
				className="avatar-image"
				style={{ width: `${size}px`, height: `${size}px` }}
			/>;
	}

}

Avatar.propTypes = {
	name: PropTypes.string,
	size: PropTypes.number,
};

Avatar.defaultProps = {
	name: '',
	size: 20,
};

export default Avatar;
