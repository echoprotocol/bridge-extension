import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FocusTrap from 'focus-trap-react';

import { removeAccount } from '../../actions/GlobalActions';
import { closeModal } from '../../actions/ModalActions';

import { MODAL_LOGOUT } from '../../constants/ModalConstants';


class ModalLogout extends React.Component {

	onClose() {
		this.props.closeModal();
	}

	onConfirm(name) {

		removeAccount(name);
		this.props.closeModal();
	}

	render() {
		const { show } = this.props;
		if (show) {
			const {
				account,
			} = this.props;
			return (
				<div className="modal modal-overlay">
					<FocusTrap className="modal-content">

						<div className="modal-body">
							<h3 className="modal-title">Logout</h3>
							<div className="modal-info">You are about to log out from account {account.get('name')}</div>
						</div>
						<div className="modal-actions">
							<div className="two-btn-wrap" >

								<Button
									className="btn-in-dark"
									onClick={() => this.onConfirm(account.get('name'))}
									content="Confirm"
								/>
								<Button
									className="btn-transparent"
									onClick={() => this.onClose()}
									content="Cancel"
								/>

							</div>
						</div>
					</FocusTrap>
				</div>
			);
		}

		return null;
	}

}

ModalLogout.propTypes = {
	show: PropTypes.bool,
	account: PropTypes.object,
	closeModal: PropTypes.func.isRequired,
};

ModalLogout.defaultProps = {
	show: false,
	account: null,
};

export default connect(
	(state) => ({
		show: state.modal.getIn([MODAL_LOGOUT, 'show']),
		account: state.global.get('account'),
	}),
	(dispatch) => ({
		closeModal: () => dispatch(closeModal(MODAL_LOGOUT)),
	}),
)(ModalLogout);
