import React from 'react';
import CustomScroll from 'react-custom-scroll';
import { Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import { WALLET_PATH } from '../../constants/RouterConstants';
import { FORM_WATCH_TOKEN } from '../../constants/FormConstants';

import BridgeInput from '../../components/BridgeInput';

import { watchToken } from '../../actions/BalanceActions';
import { clearForm, setFormValue } from '../../actions/FormActions';
import { KEY_CODE_ENTER } from '../../constants/GlobalConstants';

class WatchTokens extends React.Component {

	componentWillUnmount() {
		this.props.clearForm();
	}


	onChange(e) {
		const field = e.target.name;
		const { value } = e.target;

		if (field) {
			this.props.setFormValue(field, value);
		}
	}

	onKeyPress(e) {
		const { contractId } = this.props;
		const code = e.keyCode || e.which;

		if (KEY_CODE_ENTER === code && contractId.value) {
			this.props.addToken(contractId.value);
		}
	}

	watchToken() {
		const { contractId } = this.props;

		this.props.addToken(contractId.value.trim());
	}

	render() {
		const { contractId, loading } = this.props;

		return (
			<React.Fragment>
				<div className="return-block">
					<Link
						to={WALLET_PATH}
						className="link-return"
					>
						<i className="icon-return" />
						<span className="link-text">Return</span>
					</Link>
				</div>
				<div className="watch-scroll">
					<CustomScroll
						flex="1"
						heightRelativeToParent="calc(100%)"
					>
						<div className="page-wrap">
							<div className="page">
								<div className="one-input-wrap">
									<BridgeInput
										name="contractId"
										autoFocus
										leftLabel
										defaultUp
										theme="input-light"
										labelText="Contract ID"
										value={contractId.value}
										error={!!contractId.error}
										errorText={contractId.error}
										onChange={(e) => this.onChange(e)}
										onKeyPress={(e) => this.onKeyPress(e)}
									/>
								</div>
							</div>
						</div>
						<div className="page-action-wrap">
							<div className="one-btn-wrap" >
								<Button
									content={<span className="btn-text">Watch</span>}
									className={classnames('btn-in-light', { loading })}
									onClick={() => this.watchToken()}
									type="submit"
								/>
							</div>
						</div>
					</CustomScroll>
				</div>

			</React.Fragment>
		);

	}

}

WatchTokens.propTypes = {
	loading: PropTypes.bool.isRequired,
	contractId: PropTypes.object.isRequired,
	addToken: PropTypes.func.isRequired,
	setFormValue: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		contractId: state.form.getIn([FORM_WATCH_TOKEN, 'contractId']),
		loading: state.form.getIn([FORM_WATCH_TOKEN, 'loading']),
	}),
	(dispatch) => ({
		addToken: (id) => dispatch(watchToken(id)),
		setFormValue: (field, value) => dispatch(setFormValue(FORM_WATCH_TOKEN, field, value)),
		clearForm: () => dispatch(clearForm(FORM_WATCH_TOKEN)),
	}),
)(WatchTokens);
