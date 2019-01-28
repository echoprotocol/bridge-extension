import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FocusTrap from 'focus-trap-react';

import { onLogout } from '../../actions/GlobalActions';
import { closeModal } from '../../actions/ModalActions';

import { MODAL_LOGOUT } from '../../constants/ModalConstants';


class ModalLogout extends React.Component {

	onClose() {
		this.props.closeModal();
	}

	onConfirm(name) {

		this.props.onLogout(name);
		this.props.closeModal();
	}

	render() {
		const { show } = this.props;
		if (show) {
			const {
				accountName,
			} = this.props;
			return (
				<div className="modal modal-overlay">
					<FocusTrap className="modal-content">

						<div className="modal-body">
							<h3 className="modal-title">Logout</h3>
							<div className="modal-info">You are about to log out from account {accountName}</div>
						</div>
						<div className="modal-actions">
							<div className="two-btn-wrap" >

								<Button
									className="btn-in-dark"
									onClick={() => this.onConfirm(accountName)}
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
	accountName: PropTypes.string,
	closeModal: PropTypes.func.isRequired,
	onLogout: PropTypes.func.isRequired,
};

ModalLogout.defaultProps = {
	show: false,
	accountName: null,
};

export default connect(
	(state) => ({
		show: state.modal.getIn([MODAL_LOGOUT, 'show']),
		accountName: state.modal.getIn([MODAL_LOGOUT, 'accountName']),
	}),
	(dispatch) => ({
		onLogout: (name) => dispatch(onLogout(name)),
		closeModal: () => dispatch(closeModal(MODAL_LOGOUT)),
	}),
)(ModalLogout);
