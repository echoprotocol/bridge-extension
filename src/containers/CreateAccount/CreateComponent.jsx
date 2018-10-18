import React from 'react';
import { Button, Form } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import BridgeInput from '../../components/BridgeInput';

class CreateComponent extends React.Component {

	onChangeName(e) {

		this.props.changeName(e.target.value.trim().toLowerCase());
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
								exampleName={example}
								descriptionText="Unique name will be used to make transaction"
								value={name}
								onChange={(e) => this.onChangeName(e)}
								disabled={loading}
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
								disabled={!name}
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
