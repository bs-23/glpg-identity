import React, { useEffect, useState } from 'react';

const UserDetails = (props) => {
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        setUserId(props.match.params.id);
    });

    return (
        <div>
            <h4 style={{margin: '5%'}}>Profile Details</h4>
            
            <div style={{marginLeft: '15%'}}>
                <h4>Jerome Williams</h4>
                <p>Jerome.Williams@gmail.com</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div>
                    <h5>Name</h5>
                    <p>Jerome Williams</p>

                    <h5>Email</h5>
                    <p>Jerome.Williams@gmail.com</p>
                </div>

                <div>
                    <h5>Phone Number</h5>
                    <p>01992343615</p>

                    <h5>Land Number</h5>
                    <p>859647</p>
                </div>

                <div>
                    <h5>Last Login</h5>
                    <p>21 April 2020 4:20 pm</p>

                    <h5>Status</h5>
                    <p>Active</p>
                </div>
            </div>
        </div>
    );
}
 
export default UserDetails;