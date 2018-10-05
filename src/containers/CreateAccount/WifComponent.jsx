import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { clearForm } from '../../actions/FormActions';

import BridgeBtnCopy from '../../components/BridgeBtnCopy';

import { FORM_SIGN_UP } from '../../constants/FormConstants';

class WifComponent extends React.Component {

	componentWillUnmount() {
		this.props.clearForm();
	}

	render() {
		const { accountName, wif } = this.props;

		return (
			<React.Fragment>
				<div className="page-wrap" >
					<div className="icon-person-in" />

					<div className="hi-text">
						<div>{accountName.value},</div>
						<span>welcome to Bridge!</span>
					</div>
					<div className="instruction-text">
                        Save your WIF key and don’t loose it.
                        You <br /> will need it to restore account.
					</div>
					<div className="wif-wrap">
						<div className="wif">{wif}</div>
						<BridgeBtnCopy compact text={wif} />

					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap" >
						<Button
							className="btn-in-light"
							onClick={() => this.props.history.goBack()}
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
	accountName: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
	clearForm: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		wif: state.form.getIn([FORM_SIGN_UP, 'wif']),
		accountName: state.form.getIn([FORM_SIGN_UP, 'accountName']),
	}),
	(dispatch) => ({
		clearForm: () => dispatch(clearForm(FORM_SIGN_UP)),
	}),
)(WifComponent);
