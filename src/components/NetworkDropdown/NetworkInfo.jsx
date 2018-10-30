import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { GLOBAL_ID_1 } from '../../constants/GlobalConstants';

class NetworkInfo extends React.PureComponent {

	render() {
		const networkStyle = {
			top: this.props.netAir,
		};

		const { network, headBlock } = this.props;

		if (!network) {
			return null;
		}

		const registrator = network.get('registrator');
		const url = network.get('url');

		return (
			<ul className="network-info" style={networkStyle}>
				<li>
					<div>Block</div>
					<div>{headBlock}</div>
				</li>
				<li>
					<div>Faucet</div>
					<div>{registrator}</div>
				</li>
				<li>
					<div>Address</div>
					<div>{url}</div>
				</li>
			</ul>

		);
	}

}

NetworkInfo.propTypes = {
	network: PropTypes.object.isRequired,
	netAir: PropTypes.number,
	headBlock: PropTypes.any,
};
NetworkInfo.defaultProps = {
	headBlock: 0,
	netAir: 40,
};

export default connect((state) => ({
	network: state.global.get('network'),
	headBlock: state.blockchain.getIn(['objectsById', GLOBAL_ID_1, 'head_block_number']),
}))(NetworkInfo);
