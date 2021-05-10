import React, {useReducer} from 'react'

const initialState = {
    tableDate: [],
}

const reducer = (state, action) => {
    switch (action.type) {
        default: 
        return state;
    }
}

const MineSearch = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
}

export default MineSearch;