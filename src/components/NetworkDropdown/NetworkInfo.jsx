
import React from 'react';
import PropTypes from 'prop-types';

class NetworkInfo extends React.PureComponent {

	render() {
		const networkStyle = {
			top: this.props.netAir,
		};
		return (
			<ul className="network-info" style={networkStyle}>
				<li>
					<div>Block</div>
					<div>5282942</div>
				</li>
				<li>
					<div>Faucet</div>
					<div>1.234.234.34</div>
				</li>
				<li>
					<div>Addres</div>
					<div>192.168.1.02</div>
				</li>
			</ul>

		);
	}

}
NetworkInfo.propTypes = {
	netAir: PropTypes.number,
};
NetworkInfo.defaultProps = {
	netAir: 40,
};

export default NetworkInfo;

