import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Header from './layout/Header';
import Footer from './layout/Footer';

import ModalConfirm from './modals/Confirm';
import connection from '../actions/GlobalActions';
import Navbar from './layout/Navbar';

class App extends React.Component {

	componentDidMount() {
		this.props.connection();
	}

	renderModals() {
		return (
			<ModalConfirm />
		);
	}

	render() {
		const { children } = this.props;
		return (
			<div className="temp-wrap">
				<div className="app-wrap">
					<Header />
					<Navbar />
					{children}
					<Footer />

					{this.renderModals()}
				</div>
			</div>
		);
	}

}

App.propTypes = {
	children: PropTypes.element.isRequired,
	connection: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		globalLoading: state.global.get('globalLoading'),
		loading: state.global.get('loading'),
	}),
	(dispatch) => ({
		connection: () => dispatch(connection()),
	}),
)(App);
