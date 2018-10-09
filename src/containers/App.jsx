import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Dimmer } from 'semantic-ui-react';

import { connection } from '../actions/GlobalActions';

import Header from '../components/Header';
import Navbar from '../components/Navbar';

class App extends React.Component {

	componentDidMount() {
		this.props.connection();
	}

	renderChildren() {
		const { children, accountLoading } = this.props;
		return (
			<div className="temp-wrap">
				<div className="app-wrap">
					<Header />
					<Navbar />
					{children}
					{
						(accountLoading) && <Dimmer active inverted />
					}
				</div>
			</div>
		);
	}

	render() {
		return this.renderChildren();
	}

}

App.propTypes = {
	children: PropTypes.element.isRequired,
	accountLoading: PropTypes.bool.isRequired,
	connection: PropTypes.func.isRequired,
};
export default connect(
	(state) => ({
		accountLoading: state.global.get('accountLoading'),
	}),
	(dispatch) => ({
		connection: () => dispatch(connection()),
	}),
)(App);
