"use strict";

var Default = function() {
    this.price = 0.001;
    this.priceWei = 1000000000000000;
    this.wei = 1000000000000000000;
    this.address = "n1JE2mf65ryVScatTsnP8M9U5c1VSFmzvaZ";
};
var WalletNameContent = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.address = o.address;
        this.nickname = o.nickname;
        this.salePrice = o.salePrice;
        this.saleCount = o.saleCount;
    } else {
        this.address = "";
        this.nickname = "";
        this.salePrice = 0;
        this.saleCount = 0;
    }
};
WalletNameContent.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var WalletNameContract = function() {
    LocalContractStorage.defineMapProperty(this, "nameMap");
    LocalContractStorage.defineMapProperty(this, "nameArrayMap");
    LocalContractStorage.defineProperty(this, "size");
};

WalletNameContract.prototype = {
    init: function() {
		this.size = 0;
    },
    save: function(nickname, salePrice) {
        var defal = new Default();
        var from = Blockchain.transaction.from;
        var value = Blockchain.transaction.value;
        if (!nickname || nickname == null || nickname == '') {
            throw new Error("name can't be empty");
        }
        if (value < defal.priceWei) {
            throw new Error("at least " + defal.price + " NAS");
        }
        nickname = nickname.toLowerCase();
        var record = this.nameMap.get(nickname);
        if (record != null) {
            throw new Error("this name is owned by " + recore.address);
        }
        if (!salePrice || salePrice <= 0) {
            salePrice = defal.price;
        }
        var walletName = new WalletNameContent();
        walletName.address = from;
        walletName.nickname = nickname;
        walletName.salePrice = salePrice;
        walletName.saleCount = 1;
        var result = Blockchain.transfer(defal.address, value);
        if (result) {
            this.nameMap.put(nickname, walletName);
            this.nameArrayMap.put(this.size,nickname);
            this.size+=1;
        } else {
            throw new Error("pay error");
        }
    },
    buy: function(nickname, salePrice) {
        var defal = new Default();
        var from = Blockchain.transaction.from;
        nickname = nickname.toLowerCase();
        var seller = this.nameMap.get(nickname);
        var value = Blockchain.transaction.value;
        if (null == seller) {
            throw Error("seller not exist");
        }
        if (value.lt(seller.salePrice * defal.wei)) {
            throw Error("price is lower than salePrice");
        }
        if (!salePrice || salePrice < 0) {
            salePrice = defal.price;
        }
        var to = seller.address;
        seller.address = from;
        seller.salePrice = salePrice;
        seller.saleCount += 1;
        var result = Blockchain.transfer(to, value);
        if (result) {
            // del
            this.nameMap.del(seller.nickname);
            // add
            this.nameMap.put(seller.nickname, seller);
        } else {
            throw new Error("pay error");
        }

    },
    updatePrice: function(nickname,salePrice){
    	var defal = new Default();
    	var from = Blockchain.transaction.from;
        nickname = nickname.toLowerCase();
        var user = this.nameMap.get(nickname);
        if (null == user) {
            throw Error(nickname+"not exist");
        }
        if (user.address != from) {
        	throw Error("it's not your name");
        }
        if (!salePrice || salePrice < 0) {
            salePrice = defal.price;
        }
        user.salePrice = salePrice;
        this.nameMap.put(nickname,user);
    },
    searchByName: function(nickname) {
        if (!nickname || nickname == null || nickname == '') {
            throw new Error("name can't be empty");
        }
        nickname = nickname.toLowerCase();
        return this.nameMap.get(nickname);
    },
    // searchByAddress: function(address) {
    //     if (!address || address == null || address == '') {
    //         throw new Error("name can't be empty");
    //     }
    //     return this.addressMap.get(address);
    // },
    getAllByName: function(offset,limit) {
        limit = parseInt(limit);
        offset = parseInt(offset);
        if(offset>this.size){
           throw new Error("offset is not valid");
        }
        var number = offset+limit;
        if(number > this.size){
          number = this.size;
        }
        var result  = [];
        for(var i=offset;i<number;i++){
            var key = this.nameArrayMap.get(i);
            var object = this.nameMap.get(key);
            result.push(object);
        }
        return result;
    }
};
module.exports = WalletNameContract;