import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Button } from 'semantic-ui-react';

import { setNetworkInfo } from '../../actions/GlobalActions';

import { GLOBAL_ID_1, NETWORKS } from '../../constants/GlobalConstants';

import arrowLeft from '../../assets/images/icons/arrow_dark_left.svg';
import { openModal } from '../../actions/ModalActions';
import { MODAL_RM_NETWORK } from '../../constants/ModalConstants';

class Network extends React.Component {

	componentWillUnmount() {
		this.props.setNetworkInfo({
			name: '',
			url: '',
			isActive: false,
			custom: false,
		});
	}

	onClick(e) {
		e.preventDefault();
		this.props.history.goBack();
	}

	onDeleteNetwork(name) {
		const { networks } = this.props;
		const network = networks.concat(NETWORKS).find((i) => i.name === name);
		this.props.openModal(network);
	}


	render() {
		const {
			network, connected, objectsById,
		} = this.props;

		return (
			<React.Fragment>
				<div className="return-block">
					<a href="/" className="link-return" onClick={(e) => this.onClick(e)}>
						<img src={arrowLeft} alt="" />
						<span className="link-text">Return</span>
					</a>
				</div>
				<div className="networks-scroll">
					<div className="page-wrap network-page">
						<div className="page">
							<div className="icon-pageNetwork">
								<span className="path1" />
								<span className="path2" />
								<span className="path3" />
								<span className="path4" />
								<span className="path5" />
							</div>
							{
								network.isActive && connected &&
								<div className="block">
									<div className="block-title">Block number</div>
									<div className="block-number">{objectsById.getIn([GLOBAL_ID_1, 'head_block_number'])}</div>
								</div>
							}

							<div className="network-table">
								<div className="line">
									<span>Network name</span>
									<span>{ network.name }</span>
								</div>
								<div className="line">
									<span>Node address</span>
									<span>{ network.url }</span>
								</div>
							</div>

						</div>

						{
							network.custom &&
							<div className="page-action-wrap">
								<div className="one-btn-wrap" >
									<Button
										content={<span className="btn-text">Delete network</span>}
										className="btn-in-light"
										onClick={() => this.onDeleteNetwork(network.name)}
									/>
								</div>
							</div>
						}

					</div>
				</div>
			</React.Fragment>
		);

	}

}

Network.propTypes = {
	network: PropTypes.object,
	networks: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
	connected: PropTypes.bool,
	objectsById: PropTypes.object,
	setNetworkInfo: PropTypes.func.isRequired,
	openModal: PropTypes.func.isRequired,
};

Network.defaultProps = {
	network: {},
	objectsById: {},
	connected: false,
};

export default withRouter(connect(
	(state) => ({
		network: state.global.get('networkInfo'),
		networks: state.global.get('networks'),
		connected: state.global.get('connected'),
		objectsById: state.blockchain.get('objectsById'),

	}),
	(dispatch) => ({
		setNetworkInfo: (network) => dispatch(setNetworkInfo(network)),
		openModal: (value) => dispatch(openModal(MODAL_RM_NETWORK, 'network', value)),
	}),
)(Network));

