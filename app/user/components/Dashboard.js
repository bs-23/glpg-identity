import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

class Dashbaord extends React.Component {
    render() {
        return (
            <>
                <h4>This is your dashboard!</h4>
            </>
        );
    }
}

export default withRouter(connect(null, null)(Dashbaord));
