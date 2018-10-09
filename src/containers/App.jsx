import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Dimmer } from 'semantic-ui-react';

import { connection } from '../actions/GlobalActions';

import Header from '../components/Header';
import Navbar from '../components/Navbar';
import { FORM_SIGN_UP } from '../constants/FormConstants';

class App extends React.Component {

	componentDidMount() {
		this.props.connection();
	}

	renderChildren() {
		const { children, loading } = this.props;
		return (
			<div className="temp-wrap">
				<div className="app-wrap">
					<Header />
					<Navbar />
					{children}

					{/* Dimmer */}
					{
						(loading) && <Dimmer active inverted />
					}


					{/* Добавить класс loading на кнопку */}
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
	loading: PropTypes.bool,
	connection: PropTypes.func.isRequired,
};

App.defaultProps = {
	loading: false,
};

export default connect(
	(state) => ({
		globalLoading: state.global.get('globalLoading'),
		loading: state.form.getIn([FORM_SIGN_UP, 'loading']),
	}),
	(dispatch) => ({
		connection: () => dispatch(connection()),
	}),
)(App);
