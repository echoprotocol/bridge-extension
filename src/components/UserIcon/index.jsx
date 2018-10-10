import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classnames from 'classnames';

class UserIcon extends React.PureComponent {


	render() {

		return (
			<div
				className={classnames(
					'user-icon-wrap',
					this.props.color,
					this.props.avatar,
				)}
			>
				<i aria-hidden="true" className={classnames(`icon-${this.props.avatar}`)} />

			</div>

		);
	}

}

UserIcon.propTypes = {
	avatar: PropTypes.string.isRequired,
	color: PropTypes,
};
UserIcon.defaultProps = {
	color: 'green',
};
export default connect(
	() => ({
	}),
	() => ({}),
)(UserIcon);

