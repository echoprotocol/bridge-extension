import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class NetworkInfo extends React.PureComponent {

	render() {
		const networkStyle = {
			top: this.props.netAir,
		};

		const { network, block } = this.props;
		return (
			<ul className="network-info" style={networkStyle}>
				<li>
					<div>Block</div>
					<div>{block}</div>
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
	block: PropTypes.any,
	netAir: PropTypes.number,
};
NetworkInfo.defaultProps = {
	block: 100000000,
	netAir: 40,
};

export default connect((state) => ({
	network: state.global.get('network').toJS(),
}))(NetworkInfo);

