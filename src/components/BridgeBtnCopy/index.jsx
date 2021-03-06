/* eslint-disable no-nested-ternary */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import classnames from 'classnames';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import iconCopy from '../../assets/images/icons/copy.svg';

class BridgeBtnCopy extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			copied: false,
		};
	}


	onClick() {
		return this.setState({ copied: true });
	}

	render() {

		const { btnTextWif } = this.props;
		const { copied } = this.state;

		return (
			<CopyToClipboard text={this.props.text} >
				<Button
					onClick={() => this.onClick()}
					className={classnames('btn-copy-wrap', { copied })}
					content={
						<React.Fragment>
							<div className={classnames('btn-copy', { compact: this.props.compact })} >
								<img src={iconCopy} alt="" />
								<span className="btn-text">{copied ? (btnTextWif ? 'WIF is copied' : 'Copied to clipboard') : (btnTextWif ? 'Copy WIF' : 'Copy to clipboard')}</span>
							</div>
						</React.Fragment>
					}
				/>
			</CopyToClipboard>
		);
	}

}

BridgeBtnCopy.propTypes = {
	text: PropTypes.string,
	btnTextWif: PropTypes.bool,
	compact: PropTypes.bool,
};

BridgeBtnCopy.defaultProps = {
	text: '',
	btnTextWif: false,
	compact: false,
};

export default BridgeBtnCopy;
