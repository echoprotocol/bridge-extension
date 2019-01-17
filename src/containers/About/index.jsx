import React from 'react';
import info from '../../config/info';
import bridgeRoundLogo from '../../assets/images/about/bridge-round-logo.svg';

class About extends React.Component {

	render() {

		return (
			<React.Fragment>

				<div className="about-bg" />
				<div className="about-wrap">

					<img src={bridgeRoundLogo} alt="bridge" className="about-logo" />

					<div className="about-copyright">© 2018-2019 Bridge.</div>

					<a
						href="https://echo.org"
						target="_blank"
						rel="noopener noreferrer"
						className="echo-link"
					> echo.org
					</a>

					<div className="about-version">Version {info.VERSION}</div>

				</div>
			</React.Fragment>
		);

	}

}

export default About;
