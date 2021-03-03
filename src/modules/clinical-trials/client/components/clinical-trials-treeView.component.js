import React from 'react';
import TreeView from 'react-treeview';
import "react-treeview/react-treeview.css";

// let dataSource = [
//   {
//     type: 'Trial 1',
//     collapsed: true,
//     people: [
//       {title: 'Title 1', age: 27, gender: 'female', studyDate: '18-2-2021', phases: 2, participantNo : 50, collapsed: true},
//     ],
//   },
//   {type: 'Trial 2',
//     collapsed: true,
//     people: [
//       {title: 'Title 2', age: 17, gender: 'male', studyDate: '28-2-2019', phases: 3, participantNo : 100, collapsed: true},
//     ],
//   },
//   {type: 'Trial 3',
//     collapsed: true,
//     people: [
//       {title: 'Title 3', age: 32, gender: 'female', studyDate: '21-3-2018', phases: 1, participantNo : 60, collapsed: true},
//     ],
//   },
//   {type: 'Trial 4',
//     collapsed: true,
//     people: [
//       {title: 'Title 4', age: 20, gender: 'male', studyDate: '02-2-2020', phases: 4, participantNo : 10, collapsed: true},
//     ],
//   },

 
// ];





class Tree extends React.Component {
  render() {
    return (
      <div>
        {/* {console.log('props ja pelam', this.props.trialDetails)} */}
        <TreeView defaultCollapsed={true} key={this.props.trialDetails?.data?.id} nodeLabel='Click for details'>
          <div className='info'><b>Brief Summary:</b> {this.props.trialDetails?.data?.clinical_trial_brief_summary}</div>
          <div className='info'><b>Brief Title:</b> {this.props.trialDetails?.data?.clinical_trial_brief_title}</div>
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
        </TreeView>
        
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
      </div>
    );
  }
}

export default Tree;