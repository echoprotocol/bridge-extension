import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class NetworkInfo extends React.PureComponent {

	render() {
		const networkStyle = {
			top: this.props.netAir,
		};

		const { network, headBlock } = this.props;
		return (
			<ul className="network-info" style={networkStyle}>
				<li>
					<div>Block</div>
					<div>{headBlock}</div>
				</li>
				<li>
					<div>Faucet</div>
					<div>{network.registrator}</div>
				</li>
				<li>
					<div>Address</div>
					<div>{network.url}</div>
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
	network: state.global.get('network').toJS(),
	headBlock: state.blockchain.getIn(['objectsById', '2.1.0', 'head_block_number']),
}))(NetworkInfo);

