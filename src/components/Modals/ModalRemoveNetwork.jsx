import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FocusTrap from 'focus-trap-react';

import { deleteNetwork } from '../../actions/GlobalActions';
import { closeModal } from '../../actions/ModalActions';

import { MODAL_RM_NETWORK } from '../../constants/ModalConstants';


class ModalLogout extends React.Component {

	onClose() {
		this.props.closeModal();
	}

	onConfirm(network) {
		this.props.deleteNetwork(network);
		this.props.closeModal();
	}

	render() {
		const { show } = this.props;

		if (!show) {
			return null;
		}

		const {
			network,
		} = this.props;

		return (
			<div className="modal modal-overlay">
				<FocusTrap className="modal-content">

					<div className="modal-body">
						<h3 className="modal-title">Remove Network</h3>
						<div className="modal-info">
							You are about removing custom network <br />
							‘{ network.name }’ from the list. <br />
							<br />
							Are you sure?
						</div>
					</div>
					<div className="modal-actions">
						<div className="two-btn-wrap" >

							<Button
								className="btn-in-dark"
								onClick={() => this.onConfirm(network)}
								content="Remove"
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

}

ModalLogout.propTypes = {
	show: PropTypes.bool,
	network: PropTypes.object,
	closeModal: PropTypes.func.isRequired,
	deleteNetwork: PropTypes.func.isRequired,
};

ModalLogout.defaultProps = {
	show: false,
	network: {},
};

export default connect(
	(state) => ({
		show: state.modal.getIn([MODAL_RM_NETWORK, 'show']),
		network: state.modal.getIn([MODAL_RM_NETWORK, 'network']),
	}),
	(dispatch) => ({
		deleteNetwork: (network) => dispatch(deleteNetwork(network)),
		closeModal: () => dispatch(closeModal(MODAL_RM_NETWORK)),
	}),
)(ModalLogout);
