import React from 'react';
import CustomScroll from 'react-custom-scroll';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { transitPublicKey } from '../../actions/CryptoActions';

import BridgeBtnCopy from '../../components/BridgeBtnCopy';

class Backup extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			keys: [],
		};
	}

	componentWillMount() {
		this.getKeys();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.accountId !== this.props.accountId) {
			this.getKeys();
		}
	}


	async getKeys() {
		const { accountId, networkName } = this.props;
		const keys = await this.props.transitPublicKey(accountId, networkName);

		this.setState({ keys });
	}

	render() {
		const { keys } = this.state;

		if (!keys.every((key) => key.wif)) {
			return (
				<React.Fragment>
					<div className="backup-page-empty">
						The active key is invalid or has been deleted. Please log in again.
					</div>
				</React.Fragment>
			);

		}

		return (
			<React.Fragment>
				<div className="page-wrap backup-page">
					<div className="user-scroll">
						<CustomScroll
							flex="1"
							heightRelativeToParent="calc(100%)"
						>
							<div className="page">
								{
									keys.map((key) => (
										key.wif &&
											<div className="backup-container" key={key.wif}>
												<p className="title">Public key</p>
												<span className="key">{key.publicKey}</span>

												<div className="wif-wrap backup-key">
													<div className="wif">WIF</div>
													<div className="wif-key">{key.wif}</div>
													<BridgeBtnCopy compact btnTextWif text={key.wif} />
												</div>
											</div>
									))
								}
							</div>
						</CustomScroll>
					</div>
				</div>
			</React.Fragment>
		);

	}

}

Backup.propTypes = {
	accountId: PropTypes.string.isRequired,
	networkName: PropTypes.string.isRequired,
	transitPublicKey: PropTypes.func.isRequired,
};

export default connect(
	(state) => ({
		accountId: state.global.getIn(['account', 'id']),
		networkName: state.global.getIn(['network', 'name']),
	}),
	(dispatch) => ({
		transitPublicKey: (accountId, networkName) => dispatch(transitPublicKey(
			accountId,
			networkName,
		)),
	}),
)(Backup);
