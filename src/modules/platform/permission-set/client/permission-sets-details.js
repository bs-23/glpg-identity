import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { Modal } from "react-bootstrap";
import { useSelector } from "react-redux";

const WarningMessage = ({ message }) => <div className="alert alert-warning">
    {message}
</div>

const PermissionSetDetails = ({ permissionSetId }) => {
    const [permissionDetails, setPermissionDetails] = useState();
    const [notFound, setNotFound] = useState(false);
    const [error, setError] = useState(false);
    const countries = useSelector(state => state.countryReducer.countries);
    const nullValueToken = '--';

    const getPermissionDetails = async () => {
        if(!permissionSetId) return;
        const response = await Axios.get(`/api/permissionSets/${permissionSetId}`)
            .catch(err => {
                err.response && err.response.status === 404 ? setNotFound(true) : setError(true);
            });
        setPermissionDetails(response.data);
    }

    const getCountryNames = () => {
        if(!permissionDetails || !permissionDetails.countries || !countries) return nullValueToken;
        const countryNames = countries.filter(i => permissionDetails.countries.includes(i.country_iso2)).map(i => i.codbase_desc);
        return countryNames.length ? countryNames.join(', ') : nullValueToken;
    }

    const getServiceCategoryNames = () => {
        if(!permissionDetails) return nullValueToken;
        const serviceCategories = permissionDetails.ps_sc;
        if(!serviceCategories) return nullValueToken;

        const serviceCatNames = serviceCategories.map(sc => sc.serviceCategory.title);
        return serviceCatNames.length ? serviceCatNames.join(', ') : nullValueToken;
    }

    const getApplicationNames = () => {
        if(!permissionDetails) return nullValueToken;
        const applications = permissionDetails.ps_app;
        if(!applications) return nullValueToken;

        const appNames = applications.map(app => app.application.name);
        return appNames.length ? appNames.join(', ') : nullValueToken;
    }

    const getUsedInProfileNames = () => {
        if(!permissionDetails || !permissionDetails.ps_up_ps || permissionDetails.ps_up_ps.length === 0) return [];
        return permissionDetails.ps_up_ps.map(({profile}) => profile.title);
    }

    const getUsedInRoleNames = () => {
        if(!permissionDetails || !permissionDetails.ps_role_ps || permissionDetails.ps_role_ps.length === 0) return [];
        return permissionDetails.ps_role_ps.map(({role}) => role.title);
    }

    useEffect(() => {
        getPermissionDetails();
    }, []);

    if(notFound) return <WarningMessage message="Permission set not found." />

    if(error) return <WarningMessage message="Something went wrong." />

    return <div className="profile-detail p-3 mb-3 mb-sm-0">
        <h2 className="profile-detail__name pb-3">{ permissionDetails && permissionDetails.title ? permissionDetails.title  : '' }</h2>
        <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
            <div className="profile-detail__col pb-3 pr-0 pr-sm-3">
                <span className="mr-2 d-block profile-detail__label">Description</span>
                <span className="profile-detail__value">{permissionDetails && permissionDetails.description ? permissionDetails.description : nullValueToken}</span>
            </div>
            <div className="profile-detail__col pb-3">
                <span className="mr-2 d-block profile-detail__label">Type</span>
                <span className="profile-detail__value text-capitalize">{permissionDetails && permissionDetails.type ? permissionDetails.type : nullValueToken}</span>
            </div>
        </div>
        <div className="profile-detail__row pb-0 pb-sm-2 d-block d-sm-flex">
            <div className="profile-detail__col pb-3">
                <span className="mr-2 d-block profile-detail__label">Countries</span>
                <span className="profile-detail__value">{getCountryNames()}</span>
            </div>
            <div className="profile-detail__col pb-3">
                <span className="mr-2 d-block profile-detail__label">Applications</span>
                <span className="profile-detail__value">{getApplicationNames()}</span>
            </div>
        </div>
        <div className="pb-0 pb-sm-2 d-block d-sm-flex">

            <div className="profile-detail__col pb-3">
                <span className="mr-2 d-block profile-detail__label">Used in Profiles</span>
                <span className="profile-detail__value">{
                    getUsedInProfileNames().length
                        ? getUsedInProfileNames().map(profileTitle => <div key={profileTitle}>{profileTitle}</div>)
                        : nullValueToken
                }</span>
            </div>
            <div className="profile-detail__col pb-3">
                <span className="mr-2 d-block profile-detail__label">Used in Roles</span>
                <span className="profile-detail__value">{
                    getUsedInRoleNames().length
                        ? getUsedInRoleNames().map(roleTitle => <div key={roleTitle}>{roleTitle}</div>)
                        : nullValueToken
                }</span>
            </div>
        </div>
        <div className="pb-0 pb-sm-2 d-block d-sm-flex">
            <div className="pb-3">
                <span className="mr-2 d-block profile-detail__label">Service Categories</span>
                <span className="profile-detail__value">{getServiceCategoryNames()}</span>
            </div>
        </div>
    </div>
}

export const PermissionSetDetailsModal = ({ permissionSetId, show, onHide, ...rest }) => {
    return <Modal
        show={show}
        onHide={onHide}
        dialogClassName="modal-90w modal-customize"
        aria-labelledby="example-custom-modal-styling-title"
        centered
        size="lg"
        {...rest}
    >
        <Modal.Header closeButton>
            <Modal.Title id="example-custom-modal-styling-title">
                Rights of this Permission Set
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <PermissionSetDetails permissionSetId={permissionSetId} />
        </Modal.Body>
    </Modal>
}

export default PermissionSetDetails;
