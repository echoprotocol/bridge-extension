
import React from 'react';

class NetworkInfo extends React.PureComponent {

	render() {

		return (
			<ul className="network-info">
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

export default NetworkInfo;

