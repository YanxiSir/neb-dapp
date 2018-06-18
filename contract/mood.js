 "use strict";

var MoodContent = function(text) {
    if (text) {
        var o = JSON.parse(text);
        this.modifyCount = o.modifyCount;
        this.color = o.color;
        this.desc = o.desc;
        this.datekey = o.datekey;
    } else {
        this.modifyCount = 0;
        this.color = "rgb(255,255,255)";
        this.desc = "平淡的一天，毫无波澜";
        this.datekey = "";
    }
};
MoodContent.prototype = {
    toString: function() {
        return JSON.stringify(this);
    }
};

var MoodContract = function() {
    LocalContractStorage.defineMapProperty(this, "datekeyArrayMap");
    LocalContractStorage.defineMapProperty(this, "datekeyMap");
    LocalContractStorage.defineMapProperty(this, "moodMap");
    LocalContractStorage.defineProperty(this, "datekeySize");
    LocalContractStorage.defineProperty(this, "moodSize");
};

MoodContract.prototype = {
    init: function() {
		this.datekeySize = 0;
        this.moodSize = 0;
    },
    save: function(datekey, color, desc) {
        var from = Blockchain.transaction.from;
        var key = from + datekey;
        var mood = this.moodMap.get(key);
        if(mood==null){
            mood = new MoodContent();
            mood.datekey=datekey;
        }else if(mood.modifyCount>=3){
            throw Error("every day ,you can just modify 3 times");
        }
        mood.color = color;
        if(desc != ''){
            mood.desc = desc;
        }
        mood.modifyCount+=1;
        this.moodMap.put(key,mood);
        // 增加datekey
        var localDatekey = this.datekeyMap.get(datekey);
        if (localDatekey==null) {
            this.datekeyMap.put(datekey,"-");
            this.datekeyArrayMap.put(this.datekeySize,datekey);
            this.datekeySize+=1;
        }
    },
    search: function(wallet){
        // 按钱包地址查询记录
         var result  = [];
         for(var i=0;i<this.datekeySize;i++){
            var datekey = this.datekeyArrayMap.get(i);
            var key = wallet+datekey
            var object = this.moodMap.get(key);
            if (object==null) {
                continue;
            }
            result.push(object);
        }
        return result;
    },
    searchOneDay: function(wallet,datekey){
        var key = wallet+datekey;
        return this.moodMap.get(key);
    }
};
module.exports = MoodContract;