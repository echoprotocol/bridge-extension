import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Header from './layout/Header';
import Footer from './layout/Footer';

import ModalConfirm from './modals/Confirm';
import Navbar from './layout/Navbar';

class App extends React.Component {

	renderModals() {
		return (
			<ModalConfirm />
		);
	}

	render() {
		const { children } = this.props;
		return (
			<div className="tempWrap">
				<div className="appWrap">
					<Header />
					<Navbar />
					<div className="content">
						{children}
					</div>
					<Footer />

					{this.renderModals()}
				</div>
			</div>
		);
	}

}

App.propTypes = {
	children: PropTypes.element.isRequired,
};

export default connect((state) => ({
	globalLoading: state.global.get('globalLoading'),
	loading: state.global.get('loading'),
}))(App);
