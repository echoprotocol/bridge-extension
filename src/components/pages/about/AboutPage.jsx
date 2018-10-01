import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from 'semantic-ui-react';
import classnames from 'classnames';

class AboutPage extends React.Component {

	render() {

		return (
			<div className="about-page">
				<div className="wrap">
					<div className="input-wrap">
						<Input
							label="Repeat PIN"
							onChange={(e, data) => this.onChange(e, data)}
							className={classnames({ dirty: true })}
						/>
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
