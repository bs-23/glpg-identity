import React from 'react';
import TreeView from 'react-treeview';
import "react-treeview/react-treeview.css"


const dataSource = [
  {
    type: 'Trial 1',
    collapsed: true,
    people: [
      {title: 'Title 1', age: 27, gender: 'female', studyDate: '18-2-2021', phases: 2, participantNo : 50, collapsed: true},
    ],
  },
  {type: 'Trial 2',
    collapsed: true,
    people: [
      {title: 'Title 2', age: 17, gender: 'male', studyDate: '28-2-2019', phases: 3, participantNo : 100, collapsed: true},
    ],
  },
  {type: 'Trial 3',
    collapsed: true,
    people: [
      {title: 'Title 3', age: 32, gender: 'female', studyDate: '21-3-2018', phases: 1, participantNo : 60, collapsed: true},
    ],
  },
  {type: 'Trial 4',
    collapsed: true,
    people: [
      {title: 'Title 4', age: 20, gender: 'male', studyDate: '02-2-2020', phases: 4, participantNo : 10, collapsed: true},
    ],
  },
];

class Tree extends React.Component {
  render() {
    return (
      <div>
        {dataSource.map((node, i) => {
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
        })}
      </div>
    );
  }
}

export default Tree;