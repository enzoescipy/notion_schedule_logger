var express = require('express')
var router = express.Router()
var Mongo = require("../module/mongodb-communicate/server_mongod")


//homepage router
router.get('/',function(req, res) {
    res.render('home',{
                            //title: "Dong hyo Ko,- enzoescipy\'s life challenge",
                            /*
                            description: "이 글을 보고 계시는 누군가가 있다면, 저 자신 혹은 제가 정말 사랑하는 사람 혹은 그저 호기심에 들어온 나그네일 것 입니다." +
                            "이곳은 저의 미래의 관한 계획이자 계획에 대한 저의 움직임을 실시간으로 기록할, 제 인생을 담을 웹사이트로 만들어질 예정입니다." +
                            "저는 주위의 소중한 사람들로부터 종종 뭐든 열심히, 최선을 다한다는 이야기를 듣곤 합니다."+
                            "저의 인생에 비극이 닥쳤을 때에도, 무엇 하나 제대로 이뤄내는 것이 없을 때에도 그이들은 저에게 저는 열성적인 노력가니까 반드시 헤쳐낼 수 있을 거라고, " +
                            "제게 희망을 담아주고는 하였습니다." +
                            "저는 학창시절과 학교를 나온 직후까지 닥친 많은 아픔을 겪고, 이제 어엿한 성인이 되었습니다." +
                            "많은 시간이 흘렀고, 저 역시 상처에 딱지가 앉고 새살이 여물게 되고 있습니다."+
                            "정말 좋은 일입니다만, 저는 걱정이 됩니다."+
                            "그저 열심히 앞길을 찾아 헤메이는 저에게 용기를 북돋아주신 분들도 분명 한계가 있을 텐데,"+
                            "한해, 한해가 지나면서 점점 저를 걱정하시지 않을까. 만일 그렇다면 2022년이 다가오는 지금 수능도 포기하고 고등학교도 제대로 졸업하지 못한 저에 대하여 많이 실망하시지 않을까."+
                            "그런 걱정들이 아른거립니다."+
                            "물론 저는 앞일에 대한 계획의 윤곽을 점차 잡아갔고, 지금 역시 그것을 확고히 해가고 있습니다."+
                            "그러나 분명히, 여기서 더이상 성과 없이 시간이 지난다면 영원히 사람들이 저를 무한한 신뢰로 기다려주지 않을 것임을 전 압니다." +
                            "이 공간은 지금까지 저를 믿어주신 여러분들께 저 자신을 솔직하게 비추기 위한 곳입니다."+
                            "제대로 된 성과가 나오기 까지는 지금 이시간으로부터 수개월이 걸릴 것이며, 모두가 인정할 만한 성과가 나올 때 까지는 수년이 걸릴 것입니다."+
                            "제 스스로가 만족할 때 까지는 수십년이 걸릴 지 모르는 일이죠."+
                            "하지만 해내겠습니다."+
                            "그 첫 단추인, 2022년 3월, 독학학위제 1차 시험이 다가오고 있습니다."+
                            "합격하겠습니다."+
                            "그리고 이 곳도 점차 윤곽을 갖추어서, 제가 다시 무너지지 않으면서도 열심히 미래를 위해 준비 중임을 보여드리겠습니다."+
                            "저 자신과, 여러분들에게 이 공간을 바칩니다."*/

    })
})

//notion testing router
router.get('/hardcoading',function(req, res) {
    Mongo.debug(function(doc) {
        var DBdata = doc
        console.log("(get) show data inside of mongoDB")
        res.render('index',{
                            db: JSON.stringify(DBdata),
                            title: "Dong hyo Ko - enzoescipy's life challenge",
                            iam: "/home",
        })
    })
})

//notion update router
router.post('/api/notionUpdate', function(req, res) {
    Mongo.update(() => {
        console.log("(request) update data from notion -> server mongoDB ")
        res.render('warp', {portal: req.body.portal})
    })
})




module.exports = router