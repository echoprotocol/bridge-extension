import React from 'react';
import { Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { transitPublicKey } from '../../actions/CryptoActions';
import BridgeBtnCopy from '../../components/BridgeBtnCopy';
import UserIcon from '../../components/UserIcon';
import ArrowDown from '../../assets/images/icons/arrow_dark_bot.svg';
import { INDEX_PATH, SETTINGS_PATH, NEW_KEY_PATH } from '../../constants/RouterConstants';
import { FORM_WELCOME, FORM_SIGN_UP } from '../../constants/FormConstants';
import { storageRemoveDraft, storageSetDraft } from '../../actions/GlobalActions';
import { toggleLoading } from '../../actions/AuthActions';

class Welcome extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			keys: [],
			newKey: false,
			nextSettings: false,
		};
	}

	componentWillMount() {
		this.getKeys();
	}

	componentDidMount() {
		const { pathname, search } = this.props.location;
		this.isNewKey(`${pathname}${search}` === NEW_KEY_PATH);
		storageRemoveDraft();
	}
	componentWillUnmount() {

		if (!this.state.nextSettings) {
			storageRemoveDraft();
		}

	}

	getKeys() {
		const { account, networkName } = this.props;

		const keys = this.props.transitPublicKey(account.get('id'), networkName);

		if (keys.length) {
			this.props.toggleLoading(false);
		}
		keys.then((value) => {
			this.setState({ keys: value });
		});
	}

	settings() {
		storageSetDraft(FORM_WELCOME, 'copied', false);
		this.setState({ nextSettings: true });
		this.props.history.push(SETTINGS_PATH);
	}

	proceed() {
		this.props.history.push(INDEX_PATH);
	}

	isNewKey(newKey) {
		this.setState({ newKey });
	}

	renderNewKey(name) {
		return (
			<div className="page">
				<div className="hi-text">
					<span>Key was successfully added to </span>
					<div>{name}</div>
				</div>
			</div>
		);
	}

	render() {
		const { account } = this.props;
		const { keys, newKey } = this.state;

		return (
			<div className="welcome-wrap">

				<UserIcon
					color={account.get('iconColor')}
					animationChange
					size="big"
					avatar={`ava${account.get('icon')}`}
					onClickIcon={() => this.settings()}
				/>

				<div className="page-wrap" >

					{
						newKey ?
							this.renderNewKey(account.get('name')) :

							<div className="page">
								<div className="hi-text">
									<div>{account.get('name')},</div>
									<span>Welcome to Bridge!</span>
								</div>
								<React.Fragment>
									<div className="instruction-text">
										Save your WIF key and don’t lose it.
										You <br /> will need it to restore account.
									</div>
									<div className="wif-wrap">

										{
											keys && keys.length && keys.map((key) => (
												key.wif &&
												<React.Fragment>
													<div className="wif">{key.wif}</div>
													<BridgeBtnCopy
														compact
														text={key.wif}
													/>
												</React.Fragment>
											))
										}

									</div>

								</React.Fragment>
							</div>

					}


					<div className="page-action-wrap">
						<div className="one-btn-wrap">
							<Button
								className="btn-noborder"
								onClick={() => this.proceed()}
							>
								<div className="btn-text">
									<img src={ArrowDown} alt="" />
									Proceed
								</div>
							</Button>
						</div>
					</div>
				</div>
			</div>
		);
	}

}


Welcome.propTypes = {
	account: PropTypes.object,
	networkName: PropTypes.string.isRequired,
	location: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
	transitPublicKey: PropTypes.func.isRequired,
	toggleLoading: PropTypes.func.isRequired,
};

Welcome.defaultProps = {
	account: null,
};


export default withRouter(connect(
	(state) => ({
		account: state.global.get('account'),
		networkName: state.global.getIn(['network', 'name']),
	}),
	(dispatch) => ({
		transitPublicKey: (accountId, networkName) => dispatch(transitPublicKey(
			accountId,
			networkName,
		)),
		toggleLoading: (value) => dispatch(toggleLoading(FORM_SIGN_UP, value)),
	}),
)(Welcome));
