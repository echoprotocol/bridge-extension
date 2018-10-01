import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';
import BridgeInput from '../../BridgeInput';

class AboutPage extends React.Component {


	render() {

		return (
			<div className="about-page">
				<div className="wrap">

					<BridgeInput theme="input-light" position="left" labelText="From" />
					<br />
					<div className="one-btn-wrap">
						<Button
							className="btn-in-dark"
							content={<span className="btn-text">Create</span>}
						/>
					</div>

				</div>
				<Link to="/">Back to home</Link>

			</div>

		);
	}

}

export default AboutPage;
