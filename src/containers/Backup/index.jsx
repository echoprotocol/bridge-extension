import React from 'react';
import CustomScroll from 'react-custom-scroll';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { transitPublicKey } from '../../actions/CryptoActions';

import BridgeBtnCopy from '../../components/BridgeBtnCopy';

class Backup extends React.Component {

	constructor() {
		super();
		this.state = {
			keys: [],
		};
	}

	async componentWillMount() {

		const keys = await this.props.transitPublicKey();

		this.setState({ keys: [keys] });

	}

	componentWillUnmount() {
		this.setState({ keys: [] });
	}


	render() {
		return (
			<React.Fragment>
				<div className="page-wrap backup-page">

					<div
						className="user-scroll"
						style={{ height: '488px' }}
					>
						<CustomScroll
							flex="1"
							heightRelativeToParent="calc(100%)"
						>
							<div className="page">

								{
									this.state.keys.map((key) => (
										<div className="backup-container" key={key.wif} >
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
	transitPublicKey: PropTypes.func.isRequired,
};

export default connect(
	() => ({}),
	(dispatch) => ({
		transitPublicKey: () => dispatch(transitPublicKey()),
	}),
)(Backup);
