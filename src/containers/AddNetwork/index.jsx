import React from 'react';
import { Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withRouter } from 'react-router';

import { clearForm, setFormValue } from '../../actions/FormActions';
import { addNetwork } from '../../actions/GlobalActions';

import { FORM_ADD_NETWORK } from '../../constants/FormConstants';

import BridgeInput from '../../components/BridgeInput';

class AddNetwork extends React.Component {

	componentWillUnmount() {
		this.props.clearForm();
	}

	onAdd() {
		this.props.addNetwork();
	}

	onChange(e, lowerCase) {
		const field = e.target.name;
		let { value } = e.target;

		if (lowerCase) {
			value = value.toLowerCase();
		}

		if (field) {
			this.props.setFormValue(field, value);
		}
	}

	isDisabledSubmit() {
		const {
			address, name, registrator, loading,
		} = this.props;

		if ((!address.value || address.error)
            || (!name.value || name.error)
            || (!registrator.value || registrator.error)
            || loading) {
			return true;
		}

		return false;
	}

	renderForm() {
		const {
			address, name, registrator, loading,
		} = this.props;

		return (

			<React.Fragment>

				<div className="page">
					<div className="icon-pageNetwork">
						<span className="path1" />
						<span className="path2" />
					</div>

					<div className="three-input-wrap">
						<BridgeInput
							error={!!name.error}
							disabled={loading}
							name="name"
							theme="input-light"
							labelText="Network name"
							errorText={name.error}
							value={name.value}
							onChange={(e) => this.onChange(e)}
						/>
						<BridgeInput
							error={!!address.error}
							disabled={loading}
							name="address"
							theme="input-light"
							labelText="Adress (URL or IP)"
							errorText={address.error}
							value={address.value}
							onChange={(e) => this.onChange(e)}
						/>
						<BridgeInput
							error={!!registrator.error}
							disabled={loading}
							name="registrator"
							theme="input-light"
							labelText="Faucet (URL or IP)"
							errorText={registrator.error}
							value={registrator.value}
							onChange={(e) => this.onChange(e)}
						/>
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap" >
						<Button
							content={<span className="btn-text">ADD</span>}
							disabled={this.isDisabledSubmit()}
							className={classnames('btn-in-light', { disabled: this.isDisabledSubmit() })}
							type="submit"
							onClick={(e) => this.onAdd(e)}
						/>

					</div>
				</div>

			</React.Fragment>
		);
	}

	render() {
		return (
			<React.Fragment>
				<div className="return-block">
					<a href="#" className="link-return" onClick={() => this.props.history.goBack()}>
						<i className="icon-return" />
						<span className="link-text">Return</span>
					</a>
				</div>
				<div className="page-wrap">
					{
						// this.renderSuccess()
						this.renderForm()
					}
				</div>

			</React.Fragment>


		);

	}

}

AddNetwork.propTypes = {
	loading: PropTypes.bool,
	address: PropTypes.object.isRequired,
	name: PropTypes.object.isRequired,
	registrator: PropTypes.object.isRequired,
	setFormValue: PropTypes.func.isRequired,
	addNetwork: PropTypes.func.isRequired,
	clearForm: PropTypes.func.isRequired,
	history: PropTypes.object.isRequired,
};

AddNetwork.defaultProps = {
	loading: false,
};

export default withRouter(connect(
	(state) => ({
		address: state.form.getIn([FORM_ADD_NETWORK, 'address']),
		name: state.form.getIn([FORM_ADD_NETWORK, 'name']),
		registrator: state.form.getIn([FORM_ADD_NETWORK, 'registrator']),
		loading: state.form.getIn([FORM_ADD_NETWORK, 'loading']),
	}),
	(dispatch) => ({
		addNetwork: () => dispatch(addNetwork()),
		setFormValue: (field, value) => dispatch(setFormValue(FORM_ADD_NETWORK, field, value)),
		clearForm: () => dispatch(clearForm(FORM_ADD_NETWORK)),
	}),
)(AddNetwork));

