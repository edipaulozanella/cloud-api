import {Rest,middleware} from 'express-restful-es6';

@Rest('/v1/init')
class HomeResource {

    async(){
        return new Promise(function(resolve,reject){
            setTimeout(()=>{
                resolve("hello");
            })
        })
    }

    get(){
        return this.async();
    }
}

@Rest('/v1/auto')
class ApiResource {

    use(){
        //authorize
        console.info("authorize");
        this.next();
    }

}


@Rest('/v1/test')
class TestApiResource {

    post(){

    }

    @middleware((req,res,next)=>{
        console.info("middle2")
        next()
    })
    @middleware(function(req,res,next){
        console.info("middle1",this);
        next();
    })
    get(){
        return this.send("<div>hello</div>")
    }

}