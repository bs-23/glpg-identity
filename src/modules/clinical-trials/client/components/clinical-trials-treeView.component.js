import React from 'react';
import TreeView from 'react-treeview';
import "react-treeview/react-treeview.css";


const dataSource = [
  {
    type: 'Employees',
    collapsed: false,
    people: [
      {name: 'Paul Gordon', age: 29, sex: 'male', role: 'coder', collapsed: false},
      {name: 'Sarah Lee', age: 27, sex: 'female', role: 'ocamler', collapsed: false},
    ],
  },
  // {
  //   type: 'CEO',
  //   collapsed: false,
  //   people: [
  //     {name: 'Drew Anderson', age: 39, sex: 'male', role: 'boss', collapsed: false},
  //   ],
  // },
];



class Tree extends React.Component {
  render() {
    return (
      <div>
        {/* {console.log('props ja pelam', this.props.trialDetails)} */}
        {/* <TreeView defaultCollapsed={true} key={this.props.trialDetails?.data?.id} nodeLabel='Click for details'>
          {()=>{
              return (
                <TreeView nodeLabel={label2} key={'Brief Summary'} defaultCollapsed={true}>
                  <div className="info">Brief Summary: {this.props.trialDetails?.data?.clinical_trial_brief_summary}</div>
                </TreeView>
              );
          }} */}
          {/* <div className='info'><b>Brief Summary:</b> {this.props.trialDetails?.data?.clinical_trial_brief_summary}</div> */}
          {/* <div className='info'><b>Brief Title:</b> {this.props.trialDetails?.data?.clinical_trial_brief_title}</div>
          <div className='info'><b>Eudract Number:</b> {this.props.trialDetails?.data?.eudract_number}</div>
          <div className='info'><b>Exclusion Criteria:</b> {this.props.trialDetails?.data?.exclusion_criteria}</div>
          <div className='info'><b>Inclusion Criteria:</b> {this.props.trialDetails?.data?.inclusion_criteria}</div>
          <div className='info'><b>Gender:</b> {this.props.trialDetails?.data?.gender}</div>
          <div className='info'><b>Government Identifier:</b> {this.props.trialDetails?.data?.gov_identifier}</div>
          <div className='info'><b>Indication:</b> {this.props.trialDetails?.data?.indication}</div>
          <div className='info'><b>Indication Group:</b> {this.props.trialDetails?.data?.indication_group}</div>
          <div className='info'><b>Max Age:</b> {this.props.trialDetails?.data?.max_age}</div>
          <div className='info'><b>Min Age:</b> {this.props.trialDetails?.data?.min_age}</div>
          <div className='info'><b>Note Criteria:</b> {this.props.trialDetails?.data?.note_criteria}</div>
          <div className='info'><b>Official Title:</b> {this.props.trialDetails?.data?.official_title}</div>
          <div className='info'><b>Phase:</b> {this.props.trialDetails?.data?.phase}</div>
          <div className='info'><b>Protocol Number:</b> {this.props.trialDetails?.data?.protocol_number}</div>
          <div className='info'><b>Standard Age:</b> {this.props.trialDetails?.data?.std_age}</div>
          <div className='info'><b>Story Telling:</b> {this.props.trialDetails?.data?.story_telling}</div>
          <div className='info'><b>Trial End Date:</b> {this.props.trialDetails?.data?.trial_end_date}</div>
          <div className='info'><b>Trial Fixed ID:</b> {this.props.trialDetails?.data?.trial_fixed_id}</div>
          <div className='info'><b>Trial Start Date:</b> {this.props.trialDetails?.data?.trial_start_date}</div>
          <div className='info'><b>Trial Status:</b> {this.props.trialDetails?.data?.trial_status}</div>
          <div className='info'><b>Type of Drug:</b> {this.props.trialDetails?.data?.type_of_drug}</div>
        </TreeView> */}
        
        {/* {this.props.trialDetails?.data?.map((node, i) => {
          const type = node.type;
          const label = <span className="node">{type}</span>;
          return (
            <TreeView key={type + '|' + i} nodeLabel={label} defaultCollapsed={true}>
              {node.people.map(person => {
                const label2 = <span className="node">{person.title}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.title} defaultCollapsed={true}>
                    <div className="info">Age: {person.age}</div>
                    <div className="info">Gender: {person.gender}</div>
                    <div className="info">Study Date: {person.studyDate}</div>
                    <div className="info">Phases: {person.phases}</div>
                    <div className="info">Perticipant Number: {person.participantNo}</div>
                  </TreeView>
                );
              })}
            </TreeView>
          );
        })}  */}

{dataSource.map((node, i) => {
          const type = node.type;
          const label = <span className="node">{this.props.trialDetails?.data?.gov_identifier}</span>;
          return (
            <TreeView key={type + '|' + i} nodeLabel={label} defaultCollapsed={true}>
              {[0].map(person => {
                const label2 = <span className="node">{'Title'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.clinical_trial_brief_title}</div>
                  </TreeView>
                );
              })}

              {[1].map(person => {
                const label2 = <span className="node">{'Summary'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.clinical_trial_brief_summary}</div>
                  </TreeView>
                );
              })}

              {[2].map(person => {
                const label2 = <span className="node">{'Eudract Number'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.eudract_number}</div>
                  </TreeView>
                );
              })}

              {[3].map(person => {
                const label2 = <span className="node">{'Exclusion Criteria'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.exclusion_criteria}</div>
                  </TreeView>
                );
              })}

              {[4].map(person => {
                const label2 = <span className="node">{'Inclusion Criteria'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.inclusion_criteria}</div>
                  </TreeView>
                );
              })}

              {[5].map(person => {
                const label2 = <span className="node">{'Gender'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.gender}</div>
                  </TreeView>
                );
              })}

              {[6].map(person => {
                const label2 = <span className="node">{'Gov. Identifier'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.gov_identifier}</div>
                  </TreeView>
                );
              })}

              {[7].map(person => {
                const label2 = <span className="node">{'Indication'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.indication}</div>
                  </TreeView>
                );
              })}

              {[8].map(person => {
                const label2 = <span className="node">{'Indication Group'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.indication_group}</div>
                  </TreeView>
                );
              })}

              {[9].map(person => {
                const label2 = <span className="node">{'Max Age'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.max_age}</div>
                  </TreeView>
                );
              })}

              {[10].map(person => {
                const label2 = <span className="node">{'Min Age'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.min_age}</div>
                  </TreeView>
                );
              })}

              {[11].map(person => {
                const label2 = <span className="node">{'Note Criteria'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.note_criteria}</div>
                  </TreeView>
                );
              })}

              {[12].map(person => {
                const label2 = <span className="node">{'Official Title'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.official_title}</div>
                  </TreeView>
                );
              })}

              {[13].map(person => {
                const label2 = <span className="node">{'Phase'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.phase}</div>
                  </TreeView>
                );
              })}

              {[14].map(person => {
                const label2 = <span className="node">{'Protocol Number'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.protocol_number}</div>
                  </TreeView>
                );
              })}

              {[15].map(person => {
                const label2 = <span className="node">{'Std Age'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.std_age}</div>
                  </TreeView>
                );
              })}

              {[16].map(person => {
                const label2 = <span className="node">{'Trial End Date'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.trial_end_date}</div>
                  </TreeView>
                );
              })}

              {[17].map(person => {
                const label2 = <span className="node">{'Trial Fixed ID'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.trial_fixed_id}</div>
                  </TreeView>
                );
              })}

              {[18].map(person => {
                const label2 = <span className="node">{'Trial Start Date'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.trial_start_date}</div>
                  </TreeView>
                );
              })}

              {[19].map(person => {
                const label2 = <span className="node">{'Trial Status'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.trial_status}</div>
                  </TreeView>
                );
              })}

              {[20].map(person => {
                const label2 = <span className="node">{'Type of Drug'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                    <div className="info">{this.props.trialDetails?.data?.type_of_drug}</div>
                  </TreeView>
                );
              })}

              {[21].map(person => {
                const label2 = <span className="node">{'Locations'}</span>;
                return (
                  <TreeView nodeLabel={label2} key={person.name} defaultCollapsed={true}>
                     {this.props.trialDetails?.data?.locations.map((loc,locNo) => {
                        const label2 = <span className="node">{loc?.location_country +', '+loc?.location_city+', '+loc?.location_facility}</span>;
                        return (
                          <TreeView nodeLabel={label2} key={'loc'+locNo} defaultCollapsed={true}>
                            <div className="info"><b>clinical trial ID :</b> {loc?.clinicalTrialId}</div>
                            <div className="info"><b>created at :</b> {loc?.created_at}</div>
                            <div className="info"><b>id :</b> {loc?.id}</div>
                            <div className="info"><b>latitude :</b> {loc?.lat}</div>
                            <div className="info"><b>longitude :</b> {loc?.lng}</div>
                            <div className="info"><b>city :</b> {loc?.location_city}</div>
                            <div className="info"><b>country :</b> {loc?.location_country}</div>
                            <div className="info"><b>facility :</b> {loc?.location_facility}</div>
                            <div className="info"><b>status :</b> {loc?.location_status}</div>
                            <div className="info"><b>zip :</b> {loc?.location_zip}</div>
                            <div className="info"><b>updated at :</b> {loc?.updated_at}</div>
                          </TreeView>
                );
              })}
                  </TreeView>
                );
              })}

             


            </TreeView>
          );
        })}
      </div>
    );
  }
}

export default Tree;