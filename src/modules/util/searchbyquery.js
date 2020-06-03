import _ from 'lodash'

export default function searchByQuery(items, columns, search_query){
    return _.filter(items, item => {
        let isFound = false
        columns.forEach( column => {
            if(column.path){
                const value = _.get(item, column.path)
                if(value) isFound = isFound || value.toString().toUpperCase().includes(search_query.toUpperCase())
            }
        })
        return isFound
    })
}