import React from "react";
import Enzyme, { configure, shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

// import Dashboard from "./dashboard.component"
import { Login } from './login.component'

configure({ adapter: new Adapter() });


describe("Login component", () => {
    it("should render the login component", () => {
        const wrapper = shallow(<Login />);
        

        expect(wrapper.exists()).toBe(true);
    })
})
