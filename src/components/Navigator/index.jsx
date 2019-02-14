import React from 'react';
import PropTypes from 'prop-types';
import FocusTrap from 'focus-trap-react';
import { connect } from 'react-redux';

import Header from '../Header';
import Navbar from '../Navbar';
import BridgeSidebar from '../BridgeSidebar';

import { SIGN_TRANSACTION_PATH } from '../../constants/RouterConstants';
import echoService from '../../services/echo';

class Navigator extends React.PureComponent {

	constructor(props) {
		super(props);
		this.sidebarRef = React.createRef();
	}

	componentDidMount() {
		document.addEventListener('keydown', this.updateTimeout);
		document.addEventListener('mousedown', this.updateTimeout);
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.updateTimeout);
		document.removeEventListener('mousedown', this.updateTimeout);
	}

	updateTimeout() {
		echoService.getCrypto().updateLockTimeout();
	}

	render() {
		const { visibleSidebar, pathname } = this.props;

		return (
			<React.Fragment>
				<FocusTrap active={visibleSidebar} className="trap-wrap">
					<Header pathname={pathname} />
					<BridgeSidebar />
				</FocusTrap>
				{ pathname !== SIGN_TRANSACTION_PATH ? <Navbar /> : null }

			</React.Fragment>
		);
	}

}

Navigator.propTypes = {
	pathname: PropTypes.string.isRequired,
	visibleSidebar: PropTypes.bool.isRequired,
};

export default connect(
	(state) => ({
		visibleSidebar: state.global.get('visibleSidebar'),
	}),
	() => ({}),
)(Navigator);
