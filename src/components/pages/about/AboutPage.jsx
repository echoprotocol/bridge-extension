import React from 'react';
import { Link } from 'react-router-dom';

class AboutPage extends React.Component {

	render() {

		return (
			<div className="about_page">
				<div className="wrap">
					<div className="oneBtnWrap">
						<button className="btnLightPrimary compact">SEND</button>
					</div>
				</div>
				<Link to="/">Back to home</Link>
			</div>
		);
	}

}

export default AboutPage;
