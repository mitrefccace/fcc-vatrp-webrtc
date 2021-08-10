/* eslint-disable no-unused-vars */
// utility functions
export function updateObject(oldObject:object, newValues: object) {
  return Object.assign({}, oldObject, newValues)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function updateItemInArray(array:any, itemId:object, updateItemCallback:any) {
  const updatedItems = array.map((item: { name: object; }) => {
    if (item.name !== itemId) {
      // Since we only want to update one item, preserve all others as they are now
      return item
    }

    // Use the provided callback to create an updated item
    const updatedItem = updateItemCallback(item)
    return updatedItem
  })

  return updatedItems
}

export function createReducer(initialState: any, handlers: { [x: string]: (arg0: any, arg1: any) => any; hasOwnProperty: (arg0: any) => any; }) {
  return function reducer(state = initialState, action: { type: string | number; }) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}
