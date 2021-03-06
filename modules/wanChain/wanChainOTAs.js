//cranelv wanchain OTA database 2017-11-19
const logger = require('../utils/logger');
const db = global.db = require('../db');

const log = logger.create('wanChainOTAs');
/*
OTAsCollection struct
    adress:
    OTA:
    value:
    state:
 */

exports.getScanedByWaddr = function(waddr){
    if (!waddr){
        waddr = '0x0000000000000000000000000000000000000000';
    }
    let ScanBlockIndex = db.getCollection('ScanBlockIndex');
    let Index = ScanBlockIndex.find({'_id': waddr});
    log.trace("getScanedByWaddr:", Index);
    const begin = Index.length === 0 ? 0:Index[0].index;
    return begin;
}
exports.setScanedByWaddr = function (waddr, scaned) {
    if (!waddr){
        waddr = '0x0000000000000000000000000000000000000000';
    }
    let ScanBlockIndex = db.getCollection('ScanBlockIndex');
    var found = ScanBlockIndex.findOne({'_id': waddr});
    if(found == null) {
        ScanBlockIndex.insert({
            _id: waddr,
            index: scaned,
        });
        log.debug('setScanedByWaddr:', waddr, 'insert');
    } else {
        found.index = scaned;
        ScanBlockIndex.update(found);
        log.debug('setScanedByWaddr:', waddr, 'update');
    }
}
exports.updateOtaStatus = function(ota) {
    let OTAsCollection = db.getCollection('OTAsCollection');
    var found = OTAsCollection.findOne({'_id': ota});
    if(found){
        found.state = 1;
        OTAsCollection.update(found);
    }
}
exports.insertOtabyWaddr = function(waddr, ota, value, state,timeStamp,from,blockNumber, txHash) {
    let OTAsCollection = db.getCollection('OTAsCollection');
    let Key = waddr.toLowerCase();
    try {
        OTAsCollection.insert({'address': Key, '_id':ota, 'value':value, 'state':state, 'timeStamp':timeStamp,'otaFrom':from, 'blockNumber':blockNumber, 'txHash':txHash});
    }catch(err){
        log.debug("insertOtabyWaddr:", err.Error);
    }
}

exports.checkOta = function( cb, blockFrom, blockEnd) {
    let OTAsCollection = db.getCollection('OTAsCollection');
    let where = {};
    where.blockNumber = {'$gte': blockFrom, '$lte':blockEnd};
    where.address = {'$eq':''};
    where.state = {'$eq': 0};
    let otaSet = OTAsCollection.find(where);
    log.debug('checkOta otaSet length:', otaSet.length);
    otaSet.forEach((ota) => {
       let changed = cb(ota);
       if (changed) {
           OTAsCollection.update(ota);
           log.debug("find new ota by waddress:", ota);
       }
    });
}


exports.requireOTAsFromCollection = (where) =>
{
    var OTAsCollection = db.getCollection('OTAsCollection');
    return OTAsCollection.find(where);
}
exports.firstNewAccount = (newAccount) =>
{
    var accountCollection = db.getCollection('firstNewAccount');
    var found = accountCollection.findOne({'address': newAccount.address});

    if(found == null)
    {
        accountCollection.insert({'address': newAccount.address, 'name': newAccount.name, 'reminder': newAccount.reminder});
    }
};

exports.requireAccountName = (address) =>
{
    var accountCollection = db.getCollection('firstNewAccount');

    return accountCollection.find({'address': address});
}
