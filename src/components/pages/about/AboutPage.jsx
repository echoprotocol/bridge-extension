import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from 'semantic-ui-react';

class AboutPage extends React.Component {

	render() {

		return (
			<div className="about-page">
				<div className="wrap">
					<div className="input-wrap">
						<Input />

					</div>
					<div className="one-btn-wrap">
						<Button className="btn-in-light" content="test" />
					</div>

				</div>
				<Link to="/">Back to home</Link>

			</div>

		);
	}

}

export default AboutPage;
