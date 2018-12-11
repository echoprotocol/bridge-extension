import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import BridgeBtnCopy from '../../components/BridgeBtnCopy';

class Receive extends React.Component {

	onClick(e) {
		e.preventDefault();
		this.props.history.goBack();
	}

	render() {
		const { accountName } = this.props;

		if (!accountName) {
			return null;
		}

		return (
			<React.Fragment>
				<div className="return-block">
					<a href="/" className="link-return" onClick={(e) => this.onClick(e)}>
						<i className="icon-return" />
						<span className="link-text">Return</span>
					</a>
				</div>
				<div className="page-wrap">
					<div className="page recieve-page">
						<p>Share your account name to request a transaction</p>

						<div className="wif-wrap">
							<div className="wif">{accountName}</div>
							<BridgeBtnCopy compact text={accountName} />
						</div>
					</div>
				</div>
			</React.Fragment>


		);

	}

}

Receive.propTypes = {
	accountName: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
};

export default connect((state) => ({
	accountName: state.global.getIn(['account', 'name']),
}))(Receive);
