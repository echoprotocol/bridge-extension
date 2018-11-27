import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import BridgeInput from '../../components/BridgeInput';

class CreateComponent extends React.Component {

	constructor(props) {
		super(props);

		this.inputRef = null;
	}

	componentDidUpdate() {
		const { error } = this.props;

		if (error && this.inputRef) {
			this.inputRef.focus();
		}
	}

	onChangeName(e) {
		this.props.changeName(e.target.value.trim().toLowerCase());
	}

	isButtonDisabled() {
		const {
			name, error,
		} = this.props;

		return !!(!name || error);
	}

	handleRef(ref) {
		if (ref) {
			this.inputRef = ref.bridgeInput;
		}
	}

	render() {
		const {
			name, error, example, loading,
		} = this.props;

		return (
			<Form>
				<div className="page-wrap">

					<div className="page">
						<div className="icon-pageAccount">
							<span className="path1" />
							<span className="path2" />
						</div>
						<div className="one-input-wrap">
							<BridgeInput
								error={!!error}
								autoFocus
								name="accountName"
								theme="input-light"
								labelText="Account name"
								errorText={error}
								hintText={example}
								beforeExampleText="You can try"
								hintClickable
								descriptionText="Unique name will be used to make transactions"
								value={name}
								onChange={(e) => this.onChangeName(e)}
								onHintClick={() => this.props.changeName(example)}
								disabled={loading}
								ref={(r) => this.handleRef(r)}
							/>
						</div>
					</div>
					<div className="page-action-wrap">
						<div className="one-btn-wrap" >
							<Button
								className={classnames('btn-in-light', { loading })}
								content={<span className="btn-text">Create</span>}
								type="submit"
								onClick={(e) => this.props.createAccount(e)}
								disabled={this.isButtonDisabled()}
							/>
						</div>
					</div>
				</div>
			</Form>

		);
	}

}

CreateComponent.defaultProps = {
	error: null,
};

CreateComponent.propTypes = {
	error: PropTypes.any,
	loading: PropTypes.bool.isRequired,
	name: PropTypes.string.isRequired,
	example: PropTypes.string.isRequired,
	changeName: PropTypes.func.isRequired,
	createAccount: PropTypes.func.isRequired,
};

export default CreateComponent;
