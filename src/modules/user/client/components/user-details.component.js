import axios from "axios";
import React, { useEffect, useState } from 'react';

const UserDetails = (props) => {
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const { id } = props.match.params;

        async function getInfo() {
            const response = await axios.get(`/api/users/${id}`);
            setUserInfo(response.data);
        }
        
        getInfo();
    }, [props]);

    return (
        <div>
            <h4 style={{margin: '5%'}}>Profile Details</h4>
            
            <div style={{marginLeft: '15%'}}>
                <h4>{userInfo.name}</h4>
                <p>{userInfo.email}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div>
                    <h5>Name</h5>
                    <p>{userInfo.name}</p>

                    <h5>Email</h5>
                    <p>{userInfo.email}</p>
                </div>

                <div>
                    <h5>Phone Number</h5>
                    <p>{userInfo.phone}</p>

                    <h5>Land Number</h5>
                    <p> NaN</p>
                </div>

                <div>
                    <h5>Last Login</h5>
                    <p>{userInfo.last_login}</p>

                    <h5>Status</h5>
                    <p>Active</p>
                </div>
            </div>
        </div>
    );
}
 
export default UserDetails;