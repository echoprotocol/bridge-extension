import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import classnames from 'classnames';
import { CopyToClipboard } from 'react-copy-to-clipboard';

class BridgeBtnCopy extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			copied: false,
		};
	}

	onClick() {
		this.setState({ copied: true });
	}

	onBlur() {

		this.setState({ copied: false });
	}


	render() {

		return (
			<CopyToClipboard text={this.props.text} >
				<Button
					onClick={() => this.onClick()}
					onBlur={() => this.onBlur()}
					className={classnames('btn-copy-wrap', { copied: this.state.copied })}
					content={
						<React.Fragment>
							<div className={classnames('btn-copy', { compact: this.props.compact })} >
								<i className="icon-copiedBtn" />
								<span className="btn-text">Copy to clipboard</span>
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
	compact: PropTypes.bool,
};

BridgeBtnCopy.defaultProps = {
	text: '',
	compact: false,
};

export default BridgeBtnCopy;
