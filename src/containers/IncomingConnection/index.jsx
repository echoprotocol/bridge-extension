import React from 'react';
import { Link } from 'react-router-dom';
import UserIcon from '../../components/UserIcon';
import connect from '../../assets/images/connection/connect.svg';


class About extends React.Component {

	render() {

		return (
			<React.Fragment>

				<div className="incoming-connection-bg" />
				<div className="incoming-connection-wrap">

					<div className="connection-block">
						<div className="site">Mywebsite.com</div>
						<img className="connect" src={connect} alt="" />
						<div className="account">
							<UserIcon
								color="green"
								avatar="ava1"
							/>
							<div className="user-name">Username</div>
						</div>
					</div>

					<div className="connection-info">
						<div className="line">
							mywebsite.com is trying to connect to your Echo account using Bridge.
						</div>
						<div className="line">
							Would you like to approve access?
						</div>
					</div>
				</div>
				<div className="page-action-wrap">
					<div className="two-btn-wrap" >
						<Link className="btn-transparent link" to="/">
							<span className="btn-text">Reject</span>
						</Link>
						<Link className="btn-in-light link" to="/">
							<span className="btn-text">Approve</span>
						</Link>

					</div>
				</div>
			</React.Fragment>
		);

	}

}

export default About;
