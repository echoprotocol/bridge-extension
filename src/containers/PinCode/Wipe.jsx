import React from 'react';
import { Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { UNLOCK_PATH } from '../../constants/RouterConstants';
import { FORM_WIPE } from '../../constants/FormConstants';

import { wipeCrypto } from '../../actions/CryptoActions';
import { setValue, clearForm } from '../../actions/FormActions';

import CheckBox from '../../components/CheckBox';

class Wipe extends React.Component {

	componentWillUnmount() {
		this.props.clearForm();
	}

	onSubmit() {
		this.props.wipe();
	}

	onCheckBox() {
		this.props.setValue(!this.props.checked);
	}

	render() {
		const { loading, checked } = this.props;

		return (
			<div className="no-restored-pin-container">
				<div className="top-section">
					<Link
						className="link link-return_icn green"
						to={UNLOCK_PATH}
					>
						<span className="icon-return" />
						Return
					</Link>
					<div className="title">Your PIN number can not be restored.</div>
					<div className="description">
						<span>You can clear your account data from
							Bridge and set a new PIN. If you do, you will
							lose access to the accounts you&#39;ve logged into.
						</span>
						<span>You will need to log into them again, after you have set a new PIN.</span>
					</div>
				</div>
				<div className="confirm-container">
					<section>
						<CheckBox
							id="1"
							checked={checked}
							label="I understand that Bridge does not store backups of my account keys, and I will lose access to them by clearing my account data."
							onChange={(e) => this.onCheckBox(e)}
						/>
					</section>
					<div className="one-btn-wrap" >
						<Button
							type="submit"
							className="btn-in-dark"
							disabled={loading || !checked}
							content={<span className="btn-text">Clear Bridge data</span>}
							onClick={(e) => this.onSubmit(e)}
						/>
					</div>
				</div>
			</div>
		);
	}

}


Wipe.defaultProps = {
	loading: false,
	checked: false,
};

Wipe.propTypes = {
	loading: PropTypes.bool,
	checked: PropTypes.bool,
	wipe: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
	setValue: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		loading: state.form.getIn([FORM_WIPE, 'loading']),
		checked: state.form.getIn([FORM_WIPE, 'checked']),
	}),
	(dispatch) => ({
		wipe: () => dispatch(wipeCrypto()),
		setValue: (value) => dispatch(setValue(FORM_WIPE, 'checked', value)),
		clearForm: () => dispatch(clearForm(FORM_WIPE)),
	}),
)(Wipe);
