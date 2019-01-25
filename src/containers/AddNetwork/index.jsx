import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { withRouter } from 'react-router';
import CustomScroll from 'react-custom-scroll';

import { clearForm, setFormValue } from '../../actions/FormActions';
import { addNetwork } from '../../actions/GlobalActions';

import { FORM_ADD_NETWORK } from '../../constants/FormConstants';

import BridgeInput from '../../components/BridgeInput';

class AddNetwork extends React.Component {

	constructor(props) {
		super(props);

		this.nameRef = null;
		this.addressRef = null;
	}

	componentDidUpdate(prevProps) {
		const { name: prevName, address: prevAddress } = prevProps;
		const { name, address } = this.props;

		if (
			(name.value !== prevName.value)
			|| (address.value !== prevAddress.value)
		) {
			return false;
		}

		if (name.error && this.nameRef) {
			this.nameRef.focus();
		} else if (address.error && this.addressRef) {
			this.addressRef.focus();
		}

		return true;
	}

	componentWillUnmount() {
		this.props.clearForm();
	}

	onAdd() {
		this.props.addNetwork();
	}

	onClick(e) {
		e.preventDefault();
		this.props.history.goBack();
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

	isButtonDisabled() {
		const {
			address, name,
		} = this.props;

		return !!(!address.value || !name.value || address.error || name.error);
	}

	handleRef(ref, type) {
		if (ref) {
			this[`${type}Ref`] = ref.bridgeInput;
		}
	}

	renderForm() {
		const {
			address, name, loading,
		} = this.props;

		return (
			<Form>
				<div className="page">
					<div className="icon-pageNetwork">
						<span className="path1" />
						<span className="path2" />
						<span className="path3" />
						<span className="path4" />
						<span className="path5" />
					</div>

					<div className="three-input-wrap">
						<BridgeInput
							autoFocus
							error={!!name.error}
							disabled={loading}
							name="name"
							theme="input-light"
							labelText="Network name"
							errorText={name.error}
							value={name.value}
							onChange={(e) => this.onChange(e)}
							ref={(r) => this.handleRef(r, 'name')}
						/>
						<BridgeInput
							error={!!address.error}
							disabled={loading}
							name="address"
							theme="input-light"
							labelText="Address (URL or IP)"
							errorText={address.error}
							value={address.value}
							onChange={(e) => this.onChange(e)}
							ref={(r) => this.handleRef(r, 'address')}
						/>
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="one-btn-wrap" >
						<Button
							content={<span className="btn-text">Create network</span>}
							disabled={this.isButtonDisabled()}
							className={classnames('btn-in-light', { disabled: loading })}
							type="submit"
							onClick={(e) => this.onAdd(e)}
						/>
					</div>
				</div>
			</Form>
		);
	}

	render() {
		return (
			<React.Fragment>
				<div className="return-block">
					<a href="/" className="link-return" onClick={(e) => this.onClick(e)}>
						<i className="icon-return" />
						<span className="link-text">Return</span>
					</a>
				</div>
				<div className="networks-scroll">
					<CustomScroll
						flex="1"
						heightRelativeToParent="calc(100%)"
					>
						<div className="page-wrap">
							{
								this.renderForm()
							}
						</div>
					</CustomScroll>
				</div>

			</React.Fragment>
		);

	}

}

AddNetwork.propTypes = {
	loading: PropTypes.bool,
	address: PropTypes.object.isRequired,
	name: PropTypes.object.isRequired,
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
		loading: state.form.getIn([FORM_ADD_NETWORK, 'loading']),
	}),
	(dispatch) => ({
		addNetwork: () => dispatch(addNetwork()),
		setFormValue: (field, value) => dispatch(setFormValue(FORM_ADD_NETWORK, field, value)),
		clearForm: () => dispatch(clearForm(FORM_ADD_NETWORK)),
	}),
)(AddNetwork));

