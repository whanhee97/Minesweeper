import React, {useReducer, createContext, useMemo} from 'react'
import Table from './Table'
import Form from './Form'

// 지뢰 상태 코드
export const CODE = {
    MINE: -7, // 지뢰
    NORMAL: -1, // 일반
    QUESTION: -2, // 물음표
    FLAG: -3, // 깃발
    QUESTION_MINE: -4, // 지뢰 있는 칸의 물음표
    FLAG_MINE: -5, // 지뢰 있는 칸의 깃발
    CLICKED_MINE: -6, // 지뢰 클릭
    OPENED: 0 // 정상적으로 오픈한 칸 -> 0 이상이면 전부 오픈
};

// 초기값 세팅
export const TableContext = createContext({
    tableData: [],
    dispatch: () => {},
    halted: true,
});

const initialState = {
    tableData: [],
    timer: 0,
    result: '',
    halted: true,
}

const plantMine = (row, cell, mine) => {
    const data = [];
    const shuffle = [];
    // 난수 생성 후 셔플 리스트에 넣어주기
    let i = 0;
    while (i < mine) {
        const chosen = Math.floor(Math.random() * (row*cell))
        if (shuffle.includes(chosen) === false) {
            shuffle.push(chosen);
            i++;
        }
    }
    
    // 데이타 맵을 전부 노멀로 초기화
    for (let i = 0; i < row; i++) {
        const rowData = [];
        data.push(rowData);
        for (let j = 0; j < cell; j++) {
            rowData.push(CODE.NORMAL);
        }
    }

    // 가로 세로 계산해서 지뢰 심기
    for (let k = 0; k < shuffle.length; k++) {
        const ver = Math.floor(shuffle[k] / cell);
        const hor = shuffle[k] % cell;
        data[ver][hor] = CODE.MINE;
    }
    
    return data;
}

export const START_GAME = 'START_GAME';
export const OPEN_CELL = 'OPEN_CELL';
export const CLICK_MINE = 'CLICK_MINE';
export const FLAG_CELL = 'FLAG_CELL';
export const QUESTION_CELL = 'QUESTION_CELL';
export const NORMAL_CELL = 'NORMAL_CELL';

const reducer = (state, action) => {
    switch (action.type) {
        case START_GAME:
            return {
                ...state,
                tableData: plantMine(action.row, action.cell, action.mine),
                halted: false,
            };
        case OPEN_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            
            let around = [] // 주변의 상태 값을 담는다 
            if (tableData[action.row - 1]) { // 양 옆이 없을 때는 undefined를 배열에 담는다
                around = around.concat(
                    tableData[action.row - 1][action.cell - 1],
                    tableData[action.row - 1][action.cell],
                    tableData[action.row - 1][action.cell + 1],
                );
            }

            around = around.concat(
                tableData[action.row][action.cell - 1],
                tableData[action.row][action.cell + 1],
            );

            if (tableData[action.row + 1]) {
                around = around.concat(
                    tableData[action.row + 1][action.cell - 1],
                    tableData[action.row + 1][action.cell],
                    tableData[action.row + 1][action.cell + 1],
                );
            }

            const count = around.filter((v) => [CODE.FLAG_MINE,CODE.MINE,CODE.QUESTION_MINE].includes(v)).length;
            tableData[action.row][action.cell] = count;
            
            return {
                ...state,
                tableData,
            }
        }
        case CLICK_MINE: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            tableData[action.row][action.cell] = CODE.CLICKED_MINE;
            return {
                ...state,
                tableData,
                halted: true,
            }
        }
        case FLAG_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            tableData[action.row][action.cell] = tableData[action.row][action.cell]===CODE.MINE?CODE.FLAG_MINE:CODE.FLAG;
            return {
                ...state,
                tableData,
            }
        }
        case QUESTION_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            tableData[action.row][action.cell] = tableData[action.row][action.cell]===CODE.FLAG_MINE?CODE.QUESTION_MINE:CODE.QUESTION;
            return {
                ...state,
                tableData,
            }
        }
        case NORMAL_CELL: {
            const tableData = [...state.tableData];
            tableData[action.row] = [...state.tableData[action.row]];
            tableData[action.row][action.cell] = tableData[action.row][action.cell]===CODE.QUESTION_MINE?CODE.MINE:CODE.NORMAL;
            return {
                ...state,
                tableData,
            }
        }
        default: 
            return state;
    }
}


const MineSearch = () => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { tableData, halted, timer, result } = state;
    //useMemo로 캐싱을 해줘야 contextAPI 사용시 계속되는 렌더링을 막을 수 있다.
    const value = useMemo(() => ({ tableData: tableData, halted: halted, dispatch }), [tableData, halted]);

    return (
        //value = {{ tableData: state.tableData, dispatch }} 원래는 이렇게 들어가지만 useMemo로 캐싱해줌
        <TableContext.Provider value = {value}>  
            <Form />
            <div>{timer}</div>
            <Table />
            <div>{result}</div>
        </TableContext.Provider>
    )
}

export default MineSearch;