const tickers = (state = [], action) => {
    switch (action.type) {
        case 'SET_TICKERS':
            return action.payload;
        case 'SET_TICKER_PRICES':
            // return state.map(ticker => {
            //     if (ticker.symbol == action.payload.symbol) {
            //         console.log('matched one', action.payload);
                    
            //         return {
            //             ...ticker,
            //             ...action.payload
            //         }
            //     }
            //     return ticker
            // })
        // case 'UPDATE_PRICE':
        //     return state.map( ticker => {
        //         if(ticker.symbol == action.payload.data.s) {
        //             return {
        //                 ...ticker,
        //                 ...action.payload.data
        //             } 
        //         }
        //         return ticker
        //     })
        default:
            return state;
    }
};

export default tickers;