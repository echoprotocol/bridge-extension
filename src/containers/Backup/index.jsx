import React from 'react';
import CustomScroll from 'react-custom-scroll';
import PropTypes from 'prop-types';

import { getWIFByPublicKey } from '../../actions/CryptoActions';

import BridgeBtnCopy from '../../components/BridgeBtnCopy';

class Backup extends React.Component {

	componentWillMount() {
		this.props.getWIFByPublicKey(network);
	}

	render() {
		const { keys } = this.state;
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
									keys.map((key) => (
										<div className="backup-container">
											<p className="title">Public key</p>
											<span className="key">{key.public}</span>

											<div className="wif-wrap backup-key">
												<div className="wif">WIF</div>
												<div className="wif-key">{key.wif}</div>
												<BridgeBtnCopy compact btnTextWif text={key.wif} />
											</div>
										</div>
									))
								}

								<div className="backup-container">
									<p className="title">Public key</p>
									<span className="key">5Kb8kLf9zgWQnogidDaA76MzPL6TsZZY36hWXMssSzNydYXYB9KF</span>

									<div className="wif-wrap backup-key">
										<div className="wif">WIF</div>
										<div className="wif-key">5Kb8kLf9zgWQnogidDaA76MzPL6TsZZY36hWXMssSzNydYXYB9KF</div>
										<BridgeBtnCopy compact btnTextWif text="5Kb8kLf9zgWQnogidDaA76MzPL6TsZZY36hWXMssSzNydYXYB9KF" />
									</div>
								</div>
							</div>
						</CustomScroll>
					</div>
				</div>
			</React.Fragment>
		);

	}

}

Backup.propTypes = {
	network: PropTypes.string.isRequired,
	accountKeys: PropTypes.object.isRequired,
	getWIFByPublicKey: PropTypes.func.isRequired,
};

export default Backup;
