import React from 'react';
import TreeView from 'react-treeview';
import "react-treeview/react-treeview.css";


class Tree extends React.Component {
  
  render() {
    return (
      <div>
        {console.log('Tree view props: ',this.props)}
        {this.props.multipleTrialDetails.data.map((item,i)=>{
             const type = item.gov_identifier;
             const label = <span className="node">{item.gov_identifier}</span>;
             return (
               <TreeView key={type + '|' + i} nodeLabel={label} defaultCollapsed={true}>
                 
                  {Object.keys(item).map(field=>{
                    const label2 = <span className="node">{field}</span>;
                    if(field === 'locations'){
                      return (
                        <TreeView nodeLabel={label2} defaultCollapsed={true}>
                          {
                            item[field].map(locField=>{
                              const label3 = <span className="node">{locField.location_country +', '+locField.location_city +', '+ locField.location_facility}</span>;
                              return (
                                <TreeView nodeLabel={label3} defaultCollapsed={true}>
                                  <div className="info">Country : {locField.location_country}</div>
                                  <div className="info">City : {locField.location_city}</div>
                                  <div className="info">Facility : {locField.location_facility}</div>
                                  <div className="info">Trial ID : {locField.clinicalTrialId}</div>
                                  <div className="info">Status : {locField.location_status}</div>
                                  <div className="info">ZIP : {locField.location_zip}</div>
                                  <div className="info">Latitude : {locField.lat}</div>
                                  <div className="info">Longitude : {locField.lng}</div>
                                </TreeView>
                              )

                            })
                          }
                        </TreeView>
                      )
                    }else{
                      return (
                        <TreeView nodeLabel={label2} defaultCollapsed={true}>
                          <div className="info">{item[field]}</div>
                        </TreeView>
                      )
                    }
                    
                  })} 
                 
                </TreeView> 
                )})}
       
      </div>
    );
  }
}

export default Tree;