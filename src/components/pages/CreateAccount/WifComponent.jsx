import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BridgeBtnCopy from '../../BridgeBtnCopy';

import { FORM_SIGN_UP } from '../../../constants/FormConstants';

class WifComponent extends React.Component {

	render() {
		return (
			<React.Fragment>
				<div className="page-wrap" >
					<div className="icon-person-in" />

					<div className="hi-text">
						<div>{this.props.accountName},</div>
						<span>welcome to Bridge!</span>
					</div>
					<div className="instruction-text">
                        Save your WIF key and don’t loose it.
                        You <br /> will need it to restore account.
					</div>
					<div className="wif-wrap">
						<div className="wif">{this.props.wif}</div>
						<BridgeBtnCopy compact />

					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap" >
						<Button
							className="btn-in-light"
							content={<span className="btn-text">Proceed</span>}
						/>
					</div>
				</div>
			</React.Fragment>
		);

	}

}

WifComponent.propTypes = {
	wif: PropTypes.string.isRequired,
	accountName: PropTypes.string,
};

WifComponent.defaultProps = {
	accountName: '',
};

export default connect(
	(state) => ({
		wif: state.form.getIn([FORM_SIGN_UP, 'wif']),
		activeUser: state.global.getIn(['activeUser', 'name']),
	}),
	() => ({}),
)(WifComponent);
