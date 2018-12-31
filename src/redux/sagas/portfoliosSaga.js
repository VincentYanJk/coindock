import { put, call, takeLatest } from 'redux-saga/effects';
import axios from 'axios';

function* fetchPortfolios() {
    try{ 
        const responsePortfolios = yield call(axios.get, '/api/portfolio');
        yield put({ type: 'SET_PORTFOLIOS', payload: responsePortfolios.data })
        console.log('response data:', responsePortfolios.data);
        
        const portfolioId = responsePortfolios.data.filter(item => {
            return item.active;
        })
        console.log(portfolioId);
        
        yield put({ type: 'FETCH_PORTFOLIO_SYMBOLS', payload: portfolioId[0].id })
    }
    catch( err ) {
        console.log('error in fetchPortfolios saga', err);
    }
}

function* fetchPortfolioSymbols(action) {
    const responseSymbols = yield call(axios.get, `/api/portfolio/symbols/${action.payload}`);
    yield put({ type: 'SET_PORTFOLIO_SYMBOLS', payload: responseSymbols.data })
}

//sets users active portfolio
function* setActive(action) {
    yield call(axios.post, '/api/portfolio', action.payload)
    yield put({type: 'FETCH_PORTFOLIOS'})
}

function* addCoin(action) {
    try {
        console.log('payload', action.payload);
        yield call(axios.post, '/api/portfolio/add', action.payload);
        yield put({ type: 'FETCH_PORTFOLIO_SYMBOLS', payload: action.payload.portfolio })
        // call snackbar confirmation here
    } catch ( err ) {
        console.log('error adding coin to portfolio', err);
    }
    
}

function* portfolioSaga() {
    yield takeLatest('FETCH_PORTFOLIOS', fetchPortfolios);
    yield takeLatest('FETCH_PORTFOLIO_SYMBOLS', fetchPortfolioSymbols);
    yield takeLatest('SET_ACTIVE', setActive);
    yield takeLatest('ADD_COIN', addCoin);
}

export default portfolioSaga;