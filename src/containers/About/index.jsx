import React from 'react';
import main from '../../config/main';
import bridgeRoundLogo from '../../assets/images/about/bridge-round-logo.svg';

class About extends React.Component {

	render() {

		return (
			<React.Fragment>

				<div className="about-bg" />
				<div className="about-wrap">

					<img src={bridgeRoundLogo} alt="bridge" className="about-logo" />

					<div className="about-copyright">© Echo Technological Solutions LLC</div>

					<a
						href="https://echo.org"
						target="_blank"
						rel="noopener noreferrer"
						className="echo-link"
					> echo.org
					</a>

					<div className="about-version">Version {main.VERSION}</div>

				</div>
			</React.Fragment>
		);

	}

}

export default About;
