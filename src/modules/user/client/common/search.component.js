import React, { Component } from "react";

const Search = ({ placeholder, width, onChange, value }) => {
	return (
		<React.Fragment>
			<h5 className="text-center">
				<input
                    onChange={onChange}
					className="form-control"
					style={{ width: {width} }}
                    placeholder={placeholder}
                    value={value}
				/>
			</h5>
		</React.Fragment>
	);
};

export default Search;