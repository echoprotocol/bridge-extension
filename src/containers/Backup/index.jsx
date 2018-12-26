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
			key: {},
		};
	}

	async componentWillMount() {

		const key = await this.props.transitPublicKey();

		this.setState({ key });

	}


	render() {
		const { key } = this.state;

		if (!key) {
			return null;
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
									<div className="backup-container">
										<p className="title">Public key</p>
										<span className="key">{key.publicKey}</span>

										<div className="wif-wrap backup-key">
											<div className="wif">WIF</div>
											<div className="wif-key">{key.wif}</div>
											<BridgeBtnCopy compact btnTextWif text={key.wif} />
										</div>
									</div>

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
	transitPublicKey: PropTypes.func.isRequired,
};

export default connect(
	() => ({}),
	(dispatch) => ({
		transitPublicKey: () => dispatch(transitPublicKey()),
	}),
)(Backup);
