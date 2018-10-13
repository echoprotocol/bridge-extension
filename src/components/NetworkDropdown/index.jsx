import React from 'react';
import { ButtonToolbar, Dropdown, MenuItem } from 'react-bootstrap';
// import classnames from 'classnames';
// import NetworkInfo from './NetworkInfo';
// import UserIcon from '../UserIcon';

class NetworkDropdown extends React.PureComponent {


	render() {

		return (
			<React.Fragment>
				<ButtonToolbar>

					<Dropdown
						id="dropdown-network"
						rootCloseEvent="mousedown"
					>
						<Dropdown.Toggle>Pow! Zoom!</Dropdown.Toggle>
						<Dropdown.Menu className="super-colors">
							<div>
								<MenuItem eventKey="1">Action</MenuItem>
								<MenuItem eventKey="2">Another action</MenuItem>
								<MenuItem eventKey="3" active>Active Item</MenuItem>
								<MenuItem divider />
								<MenuItem eventKey="4">Separated link</MenuItem>
							</div>
							<MenuItem eventKey="5">Action</MenuItem>
							<MenuItem eventKey="6">Another action</MenuItem>
							<MenuItem eventKey="7">Separated link</MenuItem>
						</Dropdown.Menu>
					</Dropdown>
				</ButtonToolbar>
			</React.Fragment>

		);
	}

}

export default NetworkDropdown;

