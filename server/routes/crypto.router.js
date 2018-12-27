const express = require('express');
const { rejectUnauthenticated } = require('../modules/authentication-middleware');
const pool = require('../modules/pool');


const axios = require('axios');


const router = express.Router();

//get all available trading symbols from binance REST API
router.get('/binance', (req, res) => {
    console.log('made it to binance route');
    axios.get('https://api.binance.com/api/v1/exchangeInfo')
        .then(response => {
            //filter coins to get only certain quote asset pairs
            let symbols = response.data.symbols.filter(item => {
                if (item.quoteAsset === 'BTC' || item.quoteAsset === 'ETH' || item.quoteAsset === 'USDT') {
                    return item
                }
            });
            //badSymbols don't have logos on CMC
            let badSymbols = ['BCHSV', 'BQX', 'HSR', 'IOTA', 'RPX', 'YOYO']
            // filter coins again to remove duplicate baseasset coins
            symbols = symbols.filter((item, i, self) => {
                return i === self.findIndex(t => {
                    return t.baseAsset === item.baseAsset && !badSymbols.includes(item.baseAsset);
                })
            })
            //save symbol pairs to db for later use
            symbols.map(item => {
                pool.query(`INSERT INTO "symbols" ("symbol", "base_asset")
                VALUES($1, $2);`, [item.symbol, item.baseAsset])
                .then( () => {
                }).catch( err => {
                    console.log('error in symbols query:', err);
                    res.sendStatus(500);
                })
            })
            
            // baseSymbols used to get logos from CMC
            let baseSymbols = symbols.map(item => {
                return item.baseAsset
            });
            
            baseSymbols = baseSymbols.filter(item => {
                return !badSymbols.includes(item);
            })
            baseSymbols = baseSymbols.join(',');
            axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?CMC_PRO_API_KEY=${process.env.CMC_API_KEY}&symbol=${baseSymbols}`).then(resp => {
                let obj = resp.data.data;
                for (let key in obj) {
                    pool.query(`UPDATE "symbols"
                    SET "logo" = $1, "symbol_name" = $2
                    WHERE "base_asset" = $3;`, [obj[key].logo, obj[key].name, key])
                        .then(result => {
                        }).catch( err => {
                            console.log('error in insert cmc', err);
                            
                        })
                }
                res.sendStatus(201)
            }).catch(err => {
                console.log('error in cmc get:', err);
                res.sendStatus(500);
            })
        }).catch(err => {
            console.log('error:', err);
        })
})

router.get('/alltickers', (req, res) => {
    axios.get('https://api.binance.com/api/v1/ticker/24hr')
    .then( result => {
        res.send(result.data);
    }).catch( err => {
        console.log('error getting 24h data from binance', err);
        res.sendStatus(500);
    })
})

router.get('/tickers', (req, res) => {
    pool.query(`SELECT * FROM "symbols" ORDER BY "id" ASC;`)
    .then( result => {
        res.send(result.rows)
    }).catch( err => {
        console.log('error getting symbols from db:', err);
        res.sendStatus(500);
    })
})

module.exports = router;