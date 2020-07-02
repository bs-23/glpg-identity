import userReducer from '../../src/modules/user/client/user.reducer'

describe('User Reducer', () => {
    it('Should update users in the store', () => {
        const action = {
            type: 'GET_USERS_FULFILLED',
            payload: {
                data: [{ id: '1', email: 'sample_email@gmail.com' }]
            }
        }
        const changedState = {
            loggedInUser: null,
            users: [{ id: '1', email: 'sample_email@gmail.com' }]
        }
        expect(userReducer(undefined, action)).toEqual(changedState)
    })

    it('Should delete a user in the store', () => {
        const initialState = {
            loggedInUser: null,
            users: [{ id: '1', email: 'sampleEmail@gmail.com' }]
        }
        const action = {
            type: 'DELETE_USER_FULFILLED',
            payload: {
                data: {
                    id: '1'
                }
            }
        }
        const changedState = {
            loggedInUser: null,
            users: []
        }
        expect(userReducer(initialState, action)).toEqual(changedState)
    })
})
