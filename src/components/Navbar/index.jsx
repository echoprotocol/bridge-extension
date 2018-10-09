import React from 'react';
import { Button } from 'semantic-ui-react';

class Navbar extends React.PureComponent {

	render() {

		return (
			<div className="navbar">
				<ul>
					<li className="btn-nav-wrap" >
						<Button
							className="btn-nav"
							content={
								<React.Fragment>
									<div />
									<div />
									<div />
								</React.Fragment>
							}
						/>
					</li>
					<li className="page-title">Create account</li>
					<li className="link-nav">
						<a href="#">Import account</a>
					</li>
				</ul>
			</div>
		);
	}

}

export default Navbar;
