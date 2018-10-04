import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import connection from '../actions/GlobalActions';

import Header from '../components/Header';
import Navbar from '../components/Navbar';

class App extends React.Component {

	componentDidMount() {
		this.props.connection();
	}

	render() {
		const { children } = this.props;
		return (
			<div className="temp-wrap">
				<div className="app-wrap">
					<Header />
					<Navbar />
					{children}

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
